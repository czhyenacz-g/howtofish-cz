import { bosses as curatedBosses } from "../../../../data/bosses.ts";
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
import type { BossSuggestionData } from "../../../../lib/universal-content-api/types.ts";

export const NAME_MAX_LENGTH = 80;
export const LOCATION_MAX_LENGTH = 120;
export const HOW_TO_FIND_MAX_LENGTH = 400;
export const TIP_MAX_LENGTH = 300;

export type BossSuggestionEvaluation =
  | { ok: true; payload: BossSuggestionData; file: File }
  | { ok: false; message: string };

export function evaluateBossSuggestion(
  user: CurrentUserLike,
  formData: FormData,
  knownPendingTitles: string[],
  knownApprovedTitles: string[]
): BossSuggestionEvaluation {
  if (!user) return { ok: false, message: NOT_LOGGED_IN_ERROR };
  if (user.isBlocked) return { ok: false, message: BLOCKED_ERROR };

  const name = requireText(formData, "name", "Název", NAME_MAX_LENGTH);
  if (!name.ok) return name;

  const location = optionalText(formData, "location", LOCATION_MAX_LENGTH);
  if (!location.ok) return location;

  const howToFind = optionalText(formData, "howToFind", HOW_TO_FIND_MAX_LENGTH);
  if (!howToFind.ok) return howToFind;

  const tip = optionalText(formData, "tip", TIP_MAX_LENGTH);
  if (!tip.ok) return tip;

  const screenshot = validateScreenshot(formData, { required: true });
  if (!screenshot.ok) return screenshot;
  if (!screenshot.value) return { ok: false, message: "Vyber prosím screenshot." };

  const note = optionalText(formData, "note", NOTE_MAX_LENGTH);
  if (!note.ok) return note;

  if (!validateRightsConfirmed(formData)) return { ok: false, message: RIGHTS_ERROR };

  if (
    isDuplicateTitle(
      name.value,
      curatedBosses.map((b) => b.name),
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
      ...(location.value ? { location: location.value } : {}),
      ...(howToFind.value ? { how_to_find: howToFind.value } : {}),
      ...(tip.value ? { tip: tip.value } : {}),
      steam_id: user.steamId,
      nickname: user.nickname,
      ...(note.value ? { note: note.value } : {}),
      rights_confirmed: true,
    },
  };
}
