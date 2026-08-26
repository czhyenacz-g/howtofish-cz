// Čisté (testovatelné) sessionStorage helpery pro frekvenci prodejce —
// stejný vzor jako professor-state.ts (globalThis.sessionStorage, ne
// window., try/catch všude, bezpečný fallback). Na rozdíl od profesora
// (per-route klíč) je tohle session-globální: cooldown a "once per route"
// mají platit napříč celou návštěvou, ne jen pro jednu route.
const LAST_SHOWN_KEY = "howtofish-seller-callout:lastShownAt";
const SHOWN_ROUTES_KEY = "howtofish-seller-callout:shownRoutes";

export function getSellerLastShownAt(): number | null {
  try {
    const raw = globalThis.sessionStorage?.getItem(LAST_SHOWN_KEY);
    if (raw === null || raw === undefined) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getSellerShownRoutes(): readonly string[] {
  try {
    const raw = globalThis.sessionStorage?.getItem(SHOWN_ROUTES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

// Voláno jen v okamžiku, kdy se prodejce SKUTEČNĚ zobrazí (ne při pokusu,
// který skončí kvůli viditelnému banneru) — viz shouldShowSeller.
export function rememberSellerShown(pathname: string, now: number): void {
  try {
    globalThis.sessionStorage?.setItem(LAST_SHOWN_KEY, String(now));
    const routes = getSellerShownRoutes();
    if (!routes.includes(pathname)) {
      globalThis.sessionStorage?.setItem(SHOWN_ROUTES_KEY, JSON.stringify([...routes, pathname]));
    }
  } catch {
    // no-op — bez persistence se prodejce příště jen znovu zvažuje od nuly
  }
}
