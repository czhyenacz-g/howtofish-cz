// Veřejná profilová data ze Steam Web API — použito jen POST přihlášení,
// jen pro nickname/avatar. Žádné scrapování, jen oficiální API.
const FALLBACK_NICKNAME = "Steam hráč";

export async function fetchSteamProfile(
  steamId: string,
): Promise<{ nickname: string; avatarUrl: string | null }> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    return { nickname: FALLBACK_NICKNAME, avatarUrl: null };
  }

  const url = new URL("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("steamids", steamId);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("Steam profil: GetPlayerSummaries selhalo, status", response.status);
      return { nickname: FALLBACK_NICKNAME, avatarUrl: null };
    }
    const data = await response.json();
    const player = data?.response?.players?.[0];
    if (!player) {
      return { nickname: FALLBACK_NICKNAME, avatarUrl: null };
    }
    return {
      nickname: typeof player.personaname === "string" ? player.personaname : FALLBACK_NICKNAME,
      avatarUrl: typeof player.avatarfull === "string" ? player.avatarfull : null,
    };
  } catch (error) {
    console.error("Steam profil: GetPlayerSummaries selhalo", error instanceof Error ? error.message : error);
    return { nickname: FALLBACK_NICKNAME, avatarUrl: null };
  }
}
