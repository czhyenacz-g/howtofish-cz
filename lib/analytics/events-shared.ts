// Sdílené konstanty/typy pro analytics eventy — BEZ "server-only", ať je
// smí importovat i klientské soubory (track-client-event.ts, app/api/
// events/route.ts). Samotný zápis do UCA (trackEvent) žije v events.ts.
//
// Malý, uzavřený seznam významných událostí — žádný libovolný free-text
// event name (viz zadání). Nové eventy se přidávají sem, ne vymýšlí za běhu.
export const ANALYTICS_EVENTS = [
  "steam_login",
  "page_view",
  "fish_upload",
  "suggestion_created",
  "game_started",
  "game_score",
  "multiplayer_join",
  "multiplayer_leave",
  "wave_sent",
  "affiliate_click",
  "feedback_click",
  "gear_affiliate_click",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

// Podmnožina eventů, které smí přijít z klienta přes POST /api/events —
// zbytek (steam_login, fish_upload, suggestion_created, game_score,
// multiplayer_join/leave, wave_sent) se loguje výhradně přímo ze
// server-side akcí, které samy ověřily, že se věc skutečně stala (upload
// prošel, score bylo přijato, ...). Kdyby šly i tyhle přes veřejný
// endpoint, šlo by je zfalšovat (např. vymyšlené vysoké game_score).
export const CLIENT_TRACKABLE_EVENTS = ["page_view", "affiliate_click", "feedback_click", "game_started", "gear_affiliate_click"] as const;
export type ClientTrackableEvent = (typeof CLIENT_TRACKABLE_EVENTS)[number];

export function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  return typeof value === "string" && (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

export function isClientTrackableEvent(value: unknown): value is ClientTrackableEvent {
  return typeof value === "string" && (CLIENT_TRACKABLE_EVENTS as readonly string[]).includes(value);
}

// Povolené klíče v `metadata` PER event — cokoliv jiného se při zápisu
// tiše ořízne (viz sanitizeMetadata v events.ts). Žádný event nemá
// dostat text poznámky, filename, raw URL, cílovou affiliate URL apod.
// (viz zadání "NELOGOVAT").
export const METADATA_ALLOWED_KEYS: Record<AnalyticsEvent, readonly string[]> = {
  steam_login: [],
  page_view: [],
  fish_upload: ["fish_slug"],
  suggestion_created: ["type"],
  game_started: ["game"],
  game_score: ["game", "score", "round"],
  multiplayer_join: [],
  multiplayer_leave: [],
  wave_sent: [],
  affiliate_click: ["promotion_id", "placement"],
  feedback_click: [],
  // Bez "destination"/URL — viz komentář výš, žádný event nedostane
  // syrovou/cílovou URL, jen bezpečné identifikátory.
  gear_affiliate_click: ["creator_slug", "product_name", "category", "confidence", "link_type"],
};

export const MAX_METADATA_BYTES = 2000; // výrazně pod UCA limitem 64 KB (ReasonableJsonPayload), viz zadání "ideálně výrazně méně"
export const MAX_PATH_LENGTH = 300;
export const MAX_ANONYMOUS_ID_LENGTH = 100;
export const MAX_STRING_VALUE_LENGTH = 200;

/**
 * Ořízne metadata jen na povolené klíče pro daný event a jen na
 * jednoduché primitivní hodnoty (string/number/boolean, žádné vnořené
 * objekty/pole, žádné HTML) — obranná vrstva navíc k UCA vlastnímu
 * ReasonableJsonPayload limitu.
 */
export function sanitizeMetadata(event: AnalyticsEvent, raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};

  const allowedKeys = new Set(METADATA_ALLOWED_KEYS[event]);
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!allowedKeys.has(key)) continue;
    if (typeof value === "string") {
      if (value.length > MAX_STRING_VALUE_LENGTH) continue;
      result[key] = value;
    } else if (typeof value === "number" && Number.isFinite(value)) {
      result[key] = value;
    } else if (typeof value === "boolean") {
      result[key] = value;
    }
  }

  return result;
}

export function sanitizePath(path: unknown): string | null {
  if (typeof path !== "string") return null;
  if (path.length === 0 || path.length > MAX_PATH_LENGTH) return null;
  if (!path.startsWith("/")) return null;
  return path;
}

export function sanitizeAnonymousId(anonymousId: unknown): string | null {
  if (typeof anonymousId !== "string") return null;
  if (anonymousId.length === 0 || anonymousId.length > MAX_ANONYMOUS_ID_LENGTH) return null;
  // UUID i náš fallback tvar (anon-...) jsou vždy jen [a-zA-Z0-9-] — nic jiného neprojde.
  if (!/^[a-zA-Z0-9-]+$/.test(anonymousId)) return null;
  return anonymousId;
}
