import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Next.js Route Handler (next/server) — zdrojová kontrola, stejný vzor
// jako ostatní framework-vázané testy v repu (viz test/ad-slot.test.ts).
// Validace/sanitizace samotná (events-shared.ts) je testovaná přímo v
// test/analytics-events-shared.test.ts.
const source = readFileSync(fileURLToPath(new URL("../app/api/events/route.ts", import.meta.url)), "utf8");

test("POST /api/events: odmítne event mimo CLIENT_TRACKABLE_EVENTS whitelist", () => {
  assert.match(source, /isClientTrackableEvent\(event\)/);
});

test("POST /api/events: steam_id se VŽDY dopočítá ze session (getCurrentUser), nikdy z těla requestu", () => {
  assert.match(source, /const user = await getCurrentUser\(\)/);
  assert.match(source, /steamId: user\?\.steamId \?\? null/);
  // Tělo requestu se nikdy nedestrukturuje jako steamId/steam_id.
  assert.doesNotMatch(source, /body\.steamId|body\.steam_id/);
});

test("POST /api/events: rate limit je zapojený PŘED zápisem eventu", () => {
  const rateLimitIndex = source.indexOf("isEventIngestRateLimited(rateLimitKey)");
  const trackEventIndex = source.indexOf("await trackEvent(");
  assert.ok(rateLimitIndex !== -1 && trackEventIndex !== -1);
  assert.ok(rateLimitIndex < trackEventIndex, "rate limit musí proběhnout před zápisem eventu");
  assert.match(source, /status: 429/);
});

test("POST /api/events: neplatný JSON / chybějící tělo vrátí 400, ne pád", () => {
  assert.match(source, /catch \{\s*return NextResponse\.json\(\{ ok: false \}, \{ status: 400 \}\);/);
});

test("POST /api/events: getCurrentUser selhání se odchytí (blokovaný/DB výpadek nesmí shodit ingest)", () => {
  assert.match(source, /getCurrentUser\(\)\.catch\(\(\) => null\)/);
});

test("POST /api/events: nikdy neimportuje UCA client/token přímo — jen trackEvent (server-only) zprostředkovaně", () => {
  assert.doesNotMatch(source, /UNIVERSAL_CONTENT_API_TOKEN/);
  assert.doesNotMatch(source, /universal-content-api\/client/);
});
