import { getUserBySteamId } from "./db.ts";

// Vytažené do vlastního souboru bez next/headers, aby šlo otestovat
// (viz test/current-user.test.ts) — next/headers mimo skutečný Next.js
// request kontext nejde importovat, stejná konvence jako u
// evaluate-*.ts souborů jinde v projektu.
export type CurrentUser = {
  steamId: string;
  nickname: string;
  avatarUrl: string | null;
  isBlocked: boolean;
};

type VerifiedSession = { steamId: string } | null;

/**
 * Volá se prakticky na každé veřejné stránce (přes getCurrentUser) —
 * dočasný výpadek/timeout Postgresu nesmí shodit celý web na HTTP 500,
 * jen degradovat na anonymního návštěvníka. Session sama zůstává
 * platná (nic se neodhlašuje), příště se DB lookup zkusí znovu.
 */
export async function getUserForSession(session: VerifiedSession): Promise<CurrentUser | null> {
  if (!session) return null;

  let user;
  try {
    user = await getUserBySteamId(session.steamId);
  } catch (error) {
    console.error("getCurrentUser: DB lookup selhal, degraduji na anonymního uživatele:", error instanceof Error ? error.message : error);
    return null;
  }

  if (!user) return null;

  return {
    steamId: user.steamId,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    isBlocked: user.isBlocked,
  };
}
