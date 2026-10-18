// Přepínače funkcí pro režim minimální údržby (říjen 2026). Funkce, které
// vyžadují průběžnou moderaci nebo aktivní komunitu, jsou z veřejného UI
// skryté, ale jejich kód, server actions a data zůstávají — zapnutí zpět
// je jen změna hodnoty tady.

/**
 * Komunitní příspěvky: formuláře „Navrhnout…“ (ryby, předměty, bossové,
 * lokace, návody), „Navrhnout opravu“, „Chybí tu hra?“ a nahrávání
 * screenshotů úlovků. Vypnuto = žádné CTA v UI a `/x/navrhnout` přesměruje
 * na rodičovskou sekci. Už schválený obsah (záznamy, úlovky) se dál zobrazuje.
 */
export const COMMUNITY_CONTRIBUTIONS_ENABLED = false;

/**
 * Multiplayer ostrov (/multiplayer — Steam presence a mávání). Vypnuto =
 * stránka jen informuje o pozastavení (noindex), žádný vstup v navigaci,
 * patičce ani globálním UI.
 */
export const MULTIPLAYER_ENABLED = false;

/**
 * Cesty, kde je přihlášení přes Steam potřeba pro viditelnou funkci — dnes
 * jen ukládání skóre Krabí invaze do žebříčku. Jinde se tlačítko
 * „Přihlásit přes Steam“ v hlavičce nezobrazuje (odhlášení pro už
 * přihlášené zůstává všude).
 */
export function isSteamLoginRelevant(pathname: string): boolean {
  if (COMMUNITY_CONTRIBUTIONS_ENABLED || MULTIPLAYER_ENABLED) return true;
  return pathname === "/hra" || pathname.startsWith("/hra/");
}
