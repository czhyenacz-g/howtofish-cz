import { cookies } from "next/headers";
import { getUserForSession } from "./get-user-for-session";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "./session";

export type { CurrentUser } from "./get-user-for-session";

// Volej v layoutech/stránkách (Server Components) a výsledek předej
// jako prop do Header, ať nepotřebujeme klientský /api/auth/me fetch.
// Vždy dočítá aktuální stav z DB (viz getUserForSession), takže
// is_blocked nemůže být zastaralé v cookie. DB výpadek se tam bezpečně
// degraduje na null, ne na vyhozenou výjimku.
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = verifySessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  return getUserForSession(session);
}
