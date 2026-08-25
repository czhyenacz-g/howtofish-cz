import { guides as curatedGuides } from "../../../../data/guides.ts";
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
import type { GuideSuggestionData } from "../../../../lib/universal-content-api/types.ts";

export const TITLE_MAX_LENGTH = 100;
export const CATEGORY_MAX_LENGTH = 60;
export const SUMMARY_MAX_LENGTH = 200;
export const CONTENT_MAX_LENGTH = 4000;

export type GuideSuggestionEvaluation =
  | { ok: true; payload: GuideSuggestionData; file?: File }
  | { ok: false; message: string };

// Na rozdíl od item/boss/location je screenshot u návodu jen doporučený,
// ne povinný — rights checkbox je proto vyžadovaný jen tehdy, když
// uživatel skutečně nějaký obrázek přiložil (viz zadání).
export function evaluateGuideSuggestion(
  user: CurrentUserLike,
  formData: FormData,
  knownPendingTitles: string[],
  knownApprovedTitles: string[]
): GuideSuggestionEvaluation {
  if (!user) return { ok: false, message: NOT_LOGGED_IN_ERROR };
  if (user.isBlocked) return { ok: false, message: BLOCKED_ERROR };

  const title = requireText(formData, "title", "Název", TITLE_MAX_LENGTH);
  if (!title.ok) return title;

  const category = optionalText(formData, "category", CATEGORY_MAX_LENGTH);
  if (!category.ok) return category;

  const summary = requireText(formData, "summary", "Krátký popis", SUMMARY_MAX_LENGTH);
  if (!summary.ok) return summary;

  const content = requireText(formData, "content", "Postup", CONTENT_MAX_LENGTH);
  if (!content.ok) return content;

  const screenshot = validateScreenshot(formData, { required: false });
  if (!screenshot.ok) return screenshot;

  const note = optionalText(formData, "note", NOTE_MAX_LENGTH);
  if (!note.ok) return note;

  if (screenshot.value && !validateRightsConfirmed(formData)) {
    return { ok: false, message: RIGHTS_ERROR };
  }

  if (
    isDuplicateTitle(
      title.value,
      curatedGuides.map((g) => g.title),
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
      title: title.value,
      ...(category.value ? { category: category.value } : {}),
      summary: summary.value,
      content: content.value,
      steam_id: user.steamId,
      nickname: user.nickname,
      ...(note.value ? { note: note.value } : {}),
      rights_confirmed: true,
    },
  };
}
