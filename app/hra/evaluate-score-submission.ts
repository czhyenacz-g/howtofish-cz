import type { GameScoreData } from "../../lib/universal-content-api/types.ts";

// Čistá validace — Server Action (save-score-action.ts) jen dodá
// aktuálního uživatele ze session a zavolá tohle. Nejde o
// competitive-security-grade anti-cheat, jen rozumné meze proti
// absurdním hodnotám (viz report).
export type CurrentUserLike = { steamId: string; nickname: string; isBlocked: boolean } | null;

export type ScoreInput = {
  score: number;
  round: number;
  kills: number;
  bestCombo: number;
};

export type ScoreEvaluation = { ok: true; payload: GameScoreData } | { ok: false; message: string };

export const GAME_SLUG = "crab-rush";

const MAX_SCORE = 500_000;
const MAX_ROUND = 999;
const MAX_KILLS = 9_999;
const MAX_COMBO = 9_999;
const GENERIC_ERROR = "Skóre se momentálně nepodařilo uložit. Zkus to prosím znovu.";

function isValidNonNegativeInt(value: number, max: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= max;
}

export function evaluateScoreSubmission(user: CurrentUserLike, input: ScoreInput): ScoreEvaluation {
  if (!user) {
    return { ok: false, message: "Přihlas se přes Steam a ulož skóre do žebříčku." };
  }
  if (user.isBlocked) {
    return { ok: false, message: "Tento účet momentálně nemůže ukládat skóre." };
  }

  const { score, round, kills, bestCombo } = input;

  if (!isValidNonNegativeInt(score, MAX_SCORE)) return { ok: false, message: GENERIC_ERROR };
  if (!Number.isInteger(round) || round < 1 || round > MAX_ROUND) {
    return { ok: false, message: GENERIC_ERROR };
  }
  if (!isValidNonNegativeInt(kills, MAX_KILLS)) return { ok: false, message: GENERIC_ERROR };
  if (!isValidNonNegativeInt(bestCombo, MAX_COMBO)) return { ok: false, message: GENERIC_ERROR };

  return {
    ok: true,
    payload: {
      game: GAME_SLUG,
      steam_id: user.steamId,
      nickname: user.nickname,
      score,
      round,
      kills,
      best_combo: bestCombo,
    },
  };
}
