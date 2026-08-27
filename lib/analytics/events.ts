import "server-only";
import { createCommunityRecord } from "../universal-content-api/community.ts";
import { isAnalyticsEvent, sanitizeAnonymousId, sanitizeMetadata, sanitizePath } from "./events-shared.ts";
import type { AnalyticsEvent } from "./events-shared.ts";

export type { AnalyticsEvent, ClientTrackableEvent } from "./events-shared.ts";
export { ANALYTICS_EVENTS, CLIENT_TRACKABLE_EVENTS, isAnalyticsEvent, isClientTrackableEvent } from "./events-shared.ts";

export type TrackEventInput = {
  event: AnalyticsEvent;
  steamId?: string | null;
  anonymousId?: string | null;
  path?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Zapíše jednu analytickou událost do UCA collection "analytics_events"
 * (viz createCommunityRecord — stejný generický mechanismus jako
 * predmety/bossove/lokace/navody). VŽDY best-effort: chyba se jen
 * zaloguje do konzole, nikdy nepropadne volajícímu — analytics nikdy
 * nesmí shodit hlavní akci (login, upload, game score, ...), viz zadání.
 * `steamId` musí přijít jen ze server-side session, nikdy z klientského
 * payloadu (o to se stará volající, viz app/api/events/route.ts).
 */
export async function trackEvent(input: TrackEventInput): Promise<void> {
  if (!isAnalyticsEvent(input.event)) return;

  const path = sanitizePath(input.path);
  const anonymousId = sanitizeAnonymousId(input.anonymousId);
  const metadata = sanitizeMetadata(input.event, input.metadata ?? {});

  const data = {
    event: input.event,
    steam_id: input.steamId ?? null,
    anonymous_id: anonymousId,
    path,
    metadata,
  };

  if (JSON.stringify(data).length > 65_000) {
    // Reálná pojistka proti UCA ReasonableJsonPayload limitu (64 KB) —
    // metadata sama je ořezaná na pár set bajtů (viz sanitizeMetadata),
    // tohle by šlo zasáhnout jen extrémně dlouhým `path`.
    console.error(`trackEvent("${input.event}"): payload je moc velký, event se nezaloguje.`);
    return;
  }

  try {
    await createCommunityRecord("analytics_events", data);
  } catch (error) {
    console.error(`trackEvent("${input.event}") selhal:`, error instanceof Error ? error.message : error);
  }
}
