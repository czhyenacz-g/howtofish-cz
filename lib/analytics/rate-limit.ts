import "server-only";

// Lehký, best-effort rate limit jen pro POST /api/events — cíl je
// zabránit náhodnému zaspamování endpointu, ne dokonalý anti-abuse
// systém (viz zadání). Záměrně in-memory (žádný Redis): omezuje jen v
// rámci jedné teplé serverless instance, ne globálně napříč celým
// nasazením — pro "60 eventů/minutu/anonymous session" účel to stačí,
// server-side interní eventy (steam_login, fish_upload, ...) tímhle
// limitem vůbec neprochází (nejdou přes veřejný endpoint).
const WINDOW_MS = 60_000;
const MAX_EVENTS_PER_WINDOW = 60;
const MAX_TRACKED_KEYS = 5000;

const hits = new Map<string, number[]>();

export function isEventIngestRateLimited(key: string, now: number = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Ať mapa neroste bez omezení, když se objeví hodně různých klíčů
  // během života jedné instance — hrubý reset stačí (viz zadání "lehký").
  if (hits.size > MAX_TRACKED_KEYS) hits.clear();

  return recent.length > MAX_EVENTS_PER_WINDOW;
}
