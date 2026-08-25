import { NextRequest, NextResponse } from "next/server";
import { sanitizeReturnTo } from "../../../../../lib/auth/return-to";
import { getSiteUrl } from "../../../../../lib/auth/site-url";
import { buildSteamLoginUrl } from "../../../../../lib/auth/steam-openid";

export async function GET(request: NextRequest) {
  if (!process.env.STEAM_API_KEY) {
    console.error(
      "Steam přihlášení: chybí STEAM_API_KEY, přihlášení je vypnuté. Nastav proměnnou prostředí, viz .env.example.",
    );
    return new NextResponse("Přihlášení přes Steam není momentálně dostupné.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const { searchParams } = new URL(request.url);
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));
  const siteUrl = getSiteUrl(request);

  const steamLoginUrl = buildSteamLoginUrl({ siteUrl, returnTo });
  return NextResponse.redirect(steamLoginUrl);
}
