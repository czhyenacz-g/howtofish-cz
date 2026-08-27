import { getOrCreateAnonymousId } from "./anonymous-id.ts";
import type { ClientTrackableEvent } from "./events-shared.ts";

/**
 * Best-effort klientský event log — POSTuje na interní /api/events (ne
 * přímo do UCA, browser nikdy nevidí UCA token, viz app/api/events/
 * route.ts). Nikdy nevolá preventDefault ani neblokuje navigaci — pokud
 * použité v onClick na odkazu (affiliate/feedback), samotný klik pokračuje
 * úplně normálně bez ohledu na to, jestli se zápis podaří.
 */
export function trackClientEvent(
  event: ClientTrackableEvent,
  options: { path?: string; metadata?: Record<string, unknown> } = {}
): void {
  try {
    const anonymousId = getOrCreateAnonymousId();
    const path = options.path ?? (typeof window !== "undefined" ? window.location.pathname : undefined);

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, anonymousId, path, metadata: options.metadata ?? {} }),
      // Ať request dokončí i případnou rychlou navigaci pryč ze stránky
      // (affiliate_click v cíli s target="_blank" tenhle problém nemá,
      // ale keepalive je levná pojistka i pro budoucí použití).
      keepalive: true,
    }).catch(() => {
      // Síťová chyba — čistě best-effort, nic dalšího se neděje.
    });
  } catch {
    // fetch/localStorage nedostupné apod. — tracking nikdy nesmí shodit volající kód.
  }
}
