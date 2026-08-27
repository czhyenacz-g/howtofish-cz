// First-party anonymní identifikátor prohlížeče pro analytics_events —
// náhodné UUID uložené v localStorage, žádný fingerprint (ne IP, ne
// user-agent, ne canvas). Slouží jen k tomu, aby šlo v datech poznat
// "tenhle prohlížeč" napříč návštěvami, ne ke konkrétní osobě.
//
// Použitý i pro anonym -> Steam login vazbu: page_view/affiliate_click/
// feedback_click/game_started eventy posílají tohle ID VŽDY (i po
// přihlášení), zatímco steam_id se nezávisle dopočítá server-side ze
// session (viz lib/analytics/events.ts). V datech tak jde najít, kdy se
// u stejného anonymous_id poprvé objevil steam_id — bez nutnosti cokoliv
// posílat přes Steam OpenID redirect flow.
const STORAGE_KEY = "howtofish:anonymous-id";

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback pro prohlížeče bez crypto.randomUUID — pořád jen [a-z0-9-].
  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * `null` při SSR (žádný `localStorage`) nebo když je storage nedostupné
 * (private mode, quota, zakázané) — volající (trackClientEvent) v tom
 * případě eventy pošle bez anonymous_id, nikdy nespadne.
 */
export function getOrCreateAnonymousId(): string | null {
  try {
    // Explicitní kontrola (ne jen `?.`) — bez ní by `?.` jen tiše
    // přeskočilo perzistenci a funkce by přesto vrátila čerstvé,
    // nikam neuložené ID při každém volání (vypadalo by to jako "funguje",
    // ale nikdy by to nebylo stabilní napříč voláními/reloady).
    if (!globalThis.localStorage) return null;

    const existing = globalThis.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const id = generateId();
    globalThis.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return null;
  }
}
