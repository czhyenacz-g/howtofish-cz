import { items as curatedItems } from "../../../../data/items.ts";
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
import type { ItemSuggestionData } from "../../../../lib/universal-content-api/types.ts";

export const ITEM_TYPES = ["Prut", "Návnada", "Nástroj", "Zbraň", "Předmět", "Jiné"] as const;
export const NAME_MAX_LENGTH = 80;
export const OBTAINED_AT_MAX_LENGTH = 160;
export const USE_MAX_LENGTH = 200;

export type ItemSuggestionEvaluation =
  | { ok: true; payload: ItemSuggestionData; file: File }
  | { ok: false; message: string };

export function evaluateItemSuggestion(
  user: CurrentUserLike,
  formData: FormData,
  knownPendingTitles: string[],
  knownApprovedTitles: string[]
): ItemSuggestionEvaluation {
  if (!user) return { ok: false, message: NOT_LOGGED_IN_ERROR };
  if (user.isBlocked) return { ok: false, message: BLOCKED_ERROR };

  const name = requireText(formData, "name", "Název", NAME_MAX_LENGTH);
  if (!name.ok) return name;

  const itemType = optionalText(formData, "itemType", 40);
  if (!itemType.ok) return itemType;

  const obtainedAt = optionalText(formData, "obtainedAt", OBTAINED_AT_MAX_LENGTH);
  if (!obtainedAt.ok) return obtainedAt;

  const use = optionalText(formData, "use", USE_MAX_LENGTH);
  if (!use.ok) return use;

  const screenshot = validateScreenshot(formData, { required: true });
  if (!screenshot.ok) return screenshot;
  if (!screenshot.value) return { ok: false, message: "Vyber prosím screenshot." };

  const note = optionalText(formData, "note", NOTE_MAX_LENGTH);
  if (!note.ok) return note;

  if (!validateRightsConfirmed(formData)) return { ok: false, message: RIGHTS_ERROR };

  if (
    isDuplicateTitle(
      name.value,
      curatedItems.map((i) => i.name),
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
      ...(itemType.value ? { item_type: itemType.value } : {}),
      ...(obtainedAt.value ? { obtained_at: obtainedAt.value } : {}),
      ...(use.value ? { use: use.value } : {}),
      steam_id: user.steamId,
      nickname: user.nickname,
      ...(note.value ? { note: note.value } : {}),
      rights_confirmed: true,
    },
  };
}
