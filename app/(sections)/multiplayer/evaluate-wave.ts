// Čistá validace "Zamávat" — cooldown/rate-limit se řeší samostatně
// (viz lib/universal-content-api/waves.ts checkWaveAllowed), protože to
// vyžaduje síťové čtení. Tohle jen ověří to, co jde ověřit bez UCA.
export type WaveUserLike = { steamId: string; nickname: string; isBlocked: boolean } | null;

export type WaveEvaluation =
  | { ok: true; fromSteamId: string; fromNickname: string; toSteamId: string }
  | { ok: false; message: string };

export function evaluateWave(user: WaveUserLike, toSteamIdRaw: unknown, activeSteamIds: ReadonlySet<string>): WaveEvaluation {
  if (!user) {
    return { ok: false, message: "Přihlas se přes Steam, abys mohl zamávat." };
  }
  if (user.isBlocked) {
    return { ok: false, message: "Tento účet momentálně nemůže mávat." };
  }
  if (typeof toSteamIdRaw !== "string" || !toSteamIdRaw) {
    return { ok: false, message: "Neplatný příjemce." };
  }
  if (toSteamIdRaw === user.steamId) {
    return { ok: false, message: "Sám sobě zamávat nemůžeš." };
  }
  if (!activeSteamIds.has(toSteamIdRaw)) {
    return { ok: false, message: "Tenhle hráč už není aktivní." };
  }

  return { ok: true, fromSteamId: user.steamId, fromNickname: user.nickname, toSteamId: toSteamIdRaw };
}
