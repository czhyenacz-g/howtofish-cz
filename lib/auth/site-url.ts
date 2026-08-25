// Steam OpenID potřebuje absolutní realm/return_to URL, která musí
// fungovat jak v produkci (přes vlastní doménu i přes Vercel alias),
// tak lokálně. app/config/site.ts má SITE_URL napevno na produkční
// doménu, což pro lokální vývoj nestačí — proto tu je vlastní env-first
// resolver s fallbackem na request origin (jen pro pohodlí lokálního
// vývoje; v produkci vždy nastav env SITE_URL).
export function getSiteUrl(request?: Request): string {
  const fromEnv = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (request) {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }

  return "http://localhost:3000";
}
