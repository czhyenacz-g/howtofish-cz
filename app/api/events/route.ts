import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth/current-user";
import { trackEvent } from "../../../lib/analytics/events";
import { isClientTrackableEvent, sanitizeAnonymousId, sanitizePath } from "../../../lib/analytics/events-shared";
import { isEventIngestRateLimited } from "../../../lib/analytics/rate-limit";

// Interní ingest endpoint jen pro tenhle frontend (ne otevřený proxy do
// UCA) — browser sem posílá jen event name + anonymous_id + path +
// malá metadata. UCA token se sem nikdy nedostane (trackEvent běží
// server-side). steam_id se VŽDY dopočítá ze session, nikdy z těla
// requestu — klient by si jinak mohl "přihlásit" cizí Steam ID.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { event, anonymousId: rawAnonymousId, path: rawPath, metadata } = body as Record<string, unknown>;

  if (!isClientTrackableEvent(event)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const anonymousId = sanitizeAnonymousId(rawAnonymousId);
  const path = sanitizePath(rawPath);

  // Rate limit klíčovaný anonymous_id (stabilní per browser), s
  // fallbackem na IP jen když anonymous_id chybí/neprošlo validací —
  // viz zadání "max 60 eventů/minutu/anonymous session nebo IP fallback".
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateLimitKey = anonymousId ?? `ip:${ip}`;
  if (isEventIngestRateLimited(rateLimitKey)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  // Blokovaný uživatel může dál normálně procházet web (blokace se týká
  // jen vytváření obsahu) — analytics ho tedy taky normálně loguje,
  // stejně jako jakéhokoliv jiného přihlášeného uživatele.
  const user = await getCurrentUser().catch(() => null);

  await trackEvent({
    event,
    steamId: user?.steamId ?? null,
    anonymousId,
    path,
    metadata: typeof metadata === "object" && metadata !== null ? (metadata as Record<string, unknown>) : {},
  });

  return NextResponse.json({ ok: true });
}
