import { locations as curatedLocations } from "../../../../data/locations.ts";
import {
  BLOCKED_ERROR,
  DUPLICATE_ERROR,
  NOTE_MAX_LENGTH,
  NOT_LOGGED_IN_ERROR,
  RIGHTS_ERROR,
  isDuplicateTitle,
  optionalText,
  requireText,
  validateRightsConfirmed,
  validateScreenshot,
  type CurrentUserLike,
} from "../../../../lib/community/validation.ts";
import type { LocationSuggestionData } from "../../../../lib/universal-content-api/types.ts";

export const NAME_MAX_LENGTH = 80;
export const ISLAND_MAX_LENGTH = 80;
export const NOTABLE_THINGS_MAX_LENGTH = 400;

export type LocationSuggestionEvaluation =
  | { ok: true; payload: LocationSuggestionData; file: File }
  | { ok: false; message: string };

export function evaluateLocationSuggestion(
  user: CurrentUserLike,
  formData: FormData,
  knownPendingTitles: string[],
  knownApprovedTitles: string[]
): LocationSuggestionEvaluation {
  if (!user) return { ok: false, message: NOT_LOGGED_IN_ERROR };
  if (user.isBlocked) return { ok: false, message: BLOCKED_ERROR };

  const name = requireText(formData, "name", "Název", NAME_MAX_LENGTH);
  if (!name.ok) return name;

  const island = optionalText(formData, "island", ISLAND_MAX_LENGTH);
  if (!island.ok) return island;

  const notableThings = optionalText(formData, "notableThings", NOTABLE_THINGS_MAX_LENGTH);
  if (!notableThings.ok) return notableThings;

  const screenshot = validateScreenshot(formData, { required: true });
  if (!screenshot.ok) return screenshot;
  if (!screenshot.value) return { ok: false, message: "Vyber prosím screenshot." };

  const note = optionalText(formData, "note", NOTE_MAX_LENGTH);
  if (!note.ok) return note;

  if (!validateRightsConfirmed(formData)) return { ok: false, message: RIGHTS_ERROR };

  if (
    isDuplicateTitle(
      name.value,
      curatedLocations.map((l) => l.name),
      knownApprovedTitles,
      knownPendingTitles
    )
  ) {
    return { ok: false, message: DUPLICATE_ERROR };
  }

  return {
    ok: true,
    file: screenshot.value,
    payload: {
      kind: "new",
      name: name.value,
      ...(island.value ? { island: island.value } : {}),
      ...(notableThings.value ? { notable_things: notableThings.value } : {}),
      steam_id: user.steamId,
      nickname: user.nickname,
      ...(note.value ? { note: note.value } : {}),
      rights_confirmed: true,
    },
  };
}
