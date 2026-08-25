// Steam OpenID 2.0 (ne OAuth) — https://partner.steamgames.com/doc/features/auth#openid
// Ručně napsané, bez závislosti: samotné ověření je jeden dobře
// zdokumentovaný POST-back krok (check_authentication), takže nemá
// smysl kvůli tomu tahat neauditovanou knihovnu do bezpečnostně
// kritického kódu.
const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const OPENID_NS = "http://specs.openid.net/auth/2.0";

// claimed_id má tvar https://steamcommunity.com/openid/id/<steamid64>
const CLAIMED_ID_RE = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

export function buildSteamLoginUrl(params: { siteUrl: string; returnTo: string }): string {
  const realm = params.siteUrl;
  const callbackUrl = `${params.siteUrl}/api/auth/steam/callback?returnTo=${encodeURIComponent(
    params.returnTo,
  )}`;

  const query = new URLSearchParams({
    "openid.ns": OPENID_NS,
    "openid.mode": "checkid_setup",
    "openid.return_to": callbackUrl,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return `${STEAM_OPENID_ENDPOINT}?${query.toString()}`;
}

export function extractSteamId64(claimedId: string | null): string | null {
  if (!claimedId) return null;
  const match = CLAIMED_ID_RE.exec(claimedId);
  return match ? match[1] : null;
}

// Ověří odpověď Steamu POST-backem (check_authentication) a vrátí
// validované SteamID64, nebo null pokud je odpověď neplatná. SteamID
// se NIKDY nesmí brát přímo z query parametru bez tohoto ověření.
export async function verifySteamCallback(searchParams: URLSearchParams): Promise<string | null> {
  if (searchParams.get("openid.ns") !== OPENID_NS) return null;
  if (searchParams.get("openid.mode") !== "id_res") return null;

  const claimedId = searchParams.get("openid.claimed_id");
  const steamId = extractSteamId64(claimedId);
  if (!steamId) return null;

  const verifyParams = new URLSearchParams(searchParams);
  verifyParams.set("openid.mode", "check_authentication");

  let response: Response;
  try {
    response = await fetch(STEAM_OPENID_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyParams.toString(),
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;
  const body = await response.text();
  const isValid = body.split("\n").some((line) => line.trim() === "is_valid:true");
  if (!isValid) return null;

  return steamId;
}
