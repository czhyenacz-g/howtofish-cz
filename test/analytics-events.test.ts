import { test } from "node:test";
import assert from "node:assert/strict";

process.env.UNIVERSAL_CONTENT_API_URL = "https://content-api.example.test";
process.env.UNIVERSAL_CONTENT_API_TOKEN = "uca_test_token_not_real";

const { trackEvent } = await import("../lib/analytics/events.ts");

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function withMockedFetch<T>(impl: typeof fetch, run: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  // @ts-expect-error test mock
  globalThis.fetch = impl;
  return run().finally(() => {
    globalThis.fetch = original;
  });
}

test("trackEvent: zapíše do collection 'analytics_events' se steam_id ze vstupu, ne z metadaty", async () => {
  let seenUrl = "";
  let seenBody: Record<string, unknown> = {};
  await withMockedFetch(
    async (url, init) => {
      seenUrl = String(url);
      seenBody = JSON.parse(String(init?.body));
      return jsonResponse(201, { data: { id: 1, status: "pending" } });
    },
    () => trackEvent({ event: "fish_upload", steamId: "76561198000000000", metadata: { fish_slug: "spider-crab" } })
  );

  assert.match(seenUrl, /collections\/analytics_events\/records$/);
  const data = seenBody.data as Record<string, unknown>;
  assert.equal(data.event, "fish_upload");
  assert.equal(data.steam_id, "76561198000000000");
  assert.deepEqual(data.metadata, { fish_slug: "spider-crab" });
});

test("trackEvent: anonymní event (bez steamId) uloží steam_id: null", async () => {
  let seenBody: Record<string, unknown> = {};
  await withMockedFetch(
    async (_url, init) => {
      seenBody = JSON.parse(String(init?.body));
      return jsonResponse(201, { data: { id: 1, status: "pending" } });
    },
    () => trackEvent({ event: "page_view", anonymousId: "anon-abc", path: "/ryby" })
  );
  const data = seenBody.data as Record<string, unknown>;
  assert.equal(data.steam_id, null);
  assert.equal(data.anonymous_id, "anon-abc");
  assert.equal(data.path, "/ryby");
});

test("trackEvent: neplatný event name se tiše zahodí (žádný request)", async () => {
  let called = false;
  await withMockedFetch(
    async () => {
      called = true;
      return jsonResponse(201, { data: { id: 1 } });
    },
    // @ts-expect-error testujeme runtime ochranu i mimo TS typy
    () => trackEvent({ event: "not_a_real_event" })
  );
  assert.equal(called, false);
});

test("trackEvent: UCA výpadek/chyba se nikdy nepropaguje ven (fail-open, žádný throw)", async () => {
  await withMockedFetch(
    async () => jsonResponse(500, { error: { message: "boom" } }),
    async () => {
      await assert.doesNotReject(() => trackEvent({ event: "page_view", path: "/ryby" }));
    }
  );
});

test("trackEvent: síťová chyba (fetch throw) se taky nikdy nepropaguje ven", async () => {
  await withMockedFetch(
    async () => {
      throw new Error("network down");
    },
    async () => {
      await assert.doesNotReject(() => trackEvent({ event: "page_view", path: "/ryby" }));
    }
  );
});
