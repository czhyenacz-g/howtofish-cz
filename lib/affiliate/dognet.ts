// Centrální Dognet + Allegro fallback konfigurace a URL buildery (viz
// zadání bod 20) — chid/d1 na jednom místě, ne v patnácti komponentách.
// Čisté funkce, žádný network fetch (URL vzniká lokálně, viz zadání bod
// 26 — žádné volání na Allegro/Dognet za běhu).
export const DOGNET_CONFIG = {
  chid: "rKROKhrd",
  d1: "htf",
} as const;

const ALLEGRO_SEARCH_BASE = "https://allegro.cz/vyhledavani";
const DOGNET_BASE = "https://go.dognet.com/";

/**
 * Allegro fulltextové hledání pro daný dotaz. `URLSearchParams` zajistí
 * přesně jedno správné URL-encodování (mezery jako "+"), žádná ruční
 * string concatenation (viz zadání bod 6/21).
 */
export function buildAllegroSearchUrl(query: string): string {
  const url = new URL(ALLEGRO_SEARCH_BASE);
  url.searchParams.set("string", query);
  return url.toString();
}

/**
 * Dognet wrapper okolo libovolné cílové URL (typicky výstup
 * buildAllegroSearchUrl, ale funguje pro jakoukoliv URL). `destinationUrl`
 * se vloží jako `url` parametr přes `URLSearchParams.set` — encoduje
 * syrovou hodnotu přesně jednou, i když sama obsahuje `%`/`&`/`?`
 * (žádné double encoding, viz zadání bod 21).
 */
export function buildDognetAffiliateUrl(destinationUrl: string, d2: string): string {
  const url = new URL(DOGNET_BASE);
  url.searchParams.set("chid", DOGNET_CONFIG.chid);
  url.searchParams.set("d1", DOGNET_CONFIG.d1);
  url.searchParams.set("d2", d2);
  url.searchParams.set("url", destinationUrl);
  return url.toString();
}

/**
 * Bezpečný tracking slug jen z `[a-z0-9-]` (viz zadání bod 8 "normalizuj
 * slug"). `Ø`/`ø` (RØDE) se napřed ručně přemapuje na "o" — NFD dekompozice
 * ho neřeší (není to skládané diakritické písmeno), na rozdíl od
 * české/ostatní diakritiky, kterou NFD + odstranění combining marks
 * běžně zvládne (á/č/ř/š/ž/ý -> a/c/r/s/z/y).
 */
export function normalizeTrackingSlug(value: string): string {
  return value
    .replace(/[øØ]/g, "o")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
