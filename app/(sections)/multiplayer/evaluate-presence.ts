import { isPresenceStatusKey } from "../../../lib/universal-content-api/types.ts";
import type { PresenceStatusKey } from "../../../lib/universal-content-api/types.ts";

// Čistá, snadno testovatelná validace — Server Action (actions.ts) jen
// dodá aktuálního uživatele ze session a zavolá tohle. Steam identita
// (steamId/nickname/avatarUrl) se NIKDY nebere z formData, vždy jen ze
// server-side session (viz getCurrentUser) — stejný vzor jako
// evaluate-catch-upload.ts / evaluate-score-submission.ts.
export type PresenceUserLike = {
  steamId: string;
  nickname: string;
  avatarUrl: string | null;
  isBlocked: boolean;
} | null;

export type PresenceEvaluation =
  | { ok: true; steamId: string; nickname: string; avatarUrl: string | null; status: PresenceStatusKey }
  | { ok: false; message: string };

export function evaluateSetPresence(user: PresenceUserLike, statusRaw: unknown): PresenceEvaluation {
  if (!user) {
    return { ok: false, message: "Přihlas se přes Steam, abys mohl na multiplayer ostrov." };
  }
  if (user.isBlocked) {
    return { ok: false, message: "Tento účet momentálně nemůže na multiplayer ostrov." };
  }
  if (!isPresenceStatusKey(statusRaw)) {
    return { ok: false, message: "Vyber prosím platný status." };
  }

  return {
    ok: true,
    steamId: user.steamId,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    status: statusRaw,
  };
}

export type HideEvaluation = { ok: true; steamId: string } | { ok: false; message: string };

export function evaluateHidePresence(user: PresenceUserLike): HideEvaluation {
  if (!user) {
    return { ok: false, message: "Přihlas se přes Steam." };
  }
  return { ok: true, steamId: user.steamId };
}
