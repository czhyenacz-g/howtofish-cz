import { NextRequest, NextResponse } from "next/server";
import { upsertSteamUser } from "../../../../../lib/auth/db";
import { sanitizeReturnTo } from "../../../../../lib/auth/return-to";
import { fetchSteamProfile } from "../../../../../lib/auth/steam-profile";
import { createSessionCookieValue, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "../../../../../lib/auth/session";
import { verifySteamCallback } from "../../../../../lib/auth/steam-openid";

const GENERIC_ERROR = "Přihlášení přes Steam se nezdařilo. Zkuste to prosím znovu.";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));

  let steamId: string | null;
  try {
    steamId = await verifySteamCallback(searchParams);
  } catch (error) {
    console.error("Steam callback: ověření selhalo", error instanceof Error ? error.message : error);
    steamId = null;
  }

  if (!steamId) {
    return new NextResponse(GENERIC_ERROR, {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const profile = await fetchSteamProfile(steamId);

  try {
    await upsertSteamUser({ steamId, nickname: profile.nickname, avatarUrl: profile.avatarUrl });
  } catch (error) {
    console.error("Steam callback: uložení uživatele selhalo", error instanceof Error ? error.message : error);
    return new NextResponse(GENERIC_ERROR, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const response = NextResponse.redirect(new URL(returnTo, request.url));
  response.cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(steamId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
