import { gameEntries } from "../../../data/games.ts";

// Čistá validace formuláře "Chybí tu tvoje hra?" — Server Action
// (submit-game-suggestion-action.ts) jí předá jen FormData, žádné síťové
// volání tady, takže se dá testovat samostatně (stejný vzor jako
// evaluate-item-suggestion.ts / ryby/navrhnout/evaluate-suggestion.ts).
//
// Návrh hry je záměrně BEZ přihlášení přes Steam (na rozdíl od návrhů
// encyklopedického obsahu) — jde o veřejné "napiš nám tip" CTA. Ochrana
// proti spamu je proto jednoduchá: honeypot pole + server-side limit
// počtu návrhů za hodinu (viz lib/community/game-suggestions.ts).

export const GAME_NAME_MAX_LENGTH = 120;
export const NOTE_MAX_LENGTH = 300;

export const GENERIC_ERROR = "Návrh se momentálně nepodařilo odeslat. Zkus to prosím znovu.";
export const SPAM_ERROR = "Návrh se nepodařilo odeslat. Zkus to prosím znovu.";
export const DUPLICATE_ERROR = "Tuhle hru už v katalogu máme — mrkni na seznam výš.";

export type GameSuggestionPayload = { gameName: string; note?: string };

export type GameSuggestionEvaluation =
  | { ok: true; payload: GameSuggestionPayload }
  | { ok: false; message: string };

export function normalizeGameName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isKnownGame(name: string): boolean {
  const normalized = normalizeGameName(name);
  return gameEntries.some((entry) => normalizeGameName(entry.name) === normalized);
}

export function evaluateGameSuggestion(formData: FormData): GameSuggestionEvaluation {
  // Honeypot — pole je v UI skryté (viz GameSuggestForm.tsx), člověk ho
  // nikdy nevyplní. Boti, kteří vyplní všechna pole, tady skončí.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { ok: false, message: SPAM_ERROR };
  }

  const gameName = String(formData.get("gameName") ?? "").trim();
  if (!gameName) {
    return { ok: false, message: "Napiš prosím název hry." };
  }
  if (gameName.length > GAME_NAME_MAX_LENGTH) {
    return { ok: false, message: `Název hry může mít nejvýš ${GAME_NAME_MAX_LENGTH} znaků.` };
  }

  const rawNote = formData.get("note");
  const note = typeof rawNote === "string" ? rawNote.trim() : "";
  if (note.length > NOTE_MAX_LENGTH) {
    return { ok: false, message: `Poznámka může mít nejvýš ${NOTE_MAX_LENGTH} znaků.` };
  }

  if (isKnownGame(gameName)) {
    return { ok: false, message: DUPLICATE_ERROR };
  }

  return { ok: true, payload: { gameName, ...(note ? { note } : {}) } };
}
