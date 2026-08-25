import { cookies } from "next/headers";
import { getUserBySteamId } from "./db";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "./session";

export type CurrentUser = {
  steamId: string;
  nickname: string;
  avatarUrl: string | null;
  isBlocked: boolean;
};

// Server-only — volej v layoutech/stránkách (Server Components) a
// výsledek předej jako prop do Header, ať nepotřebujeme klientský
// /api/auth/me fetch. Vždy dočítá aktuální stav z DB, takže is_blocked
// nemůže být zastaralé v cookie.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const session = verifySessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session) return null;

  const user = await getUserBySteamId(session.steamId);
  if (!user) return null;

  return {
    steamId: user.steamId,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    isBlocked: user.isBlocked,
  };
}
