import { test } from "node:test";
import assert from "node:assert/strict";
import { trackClientEvent } from "../lib/analytics/track-client-event.ts";

class FakeStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
}

function withFakeLocalStorage<T>(run: () => T): T {
  const storage = new FakeStorage();
  const original = (globalThis as { localStorage?: unknown }).localStorage;
  // @ts-expect-error test fake
  globalThis.localStorage = storage;
  try {
    return run();
  } finally {
    // @ts-expect-error restore
    globalThis.localStorage = original;
  }
}

function withMockedFetch<T>(impl: typeof fetch, run: () => T): T {
  const original = globalThis.fetch;
  // @ts-expect-error test mock
  globalThis.fetch = impl;
  try {
    return run();
  } finally {
    globalThis.fetch = original;
  }
}

test("trackClientEvent: POSTuje na /api/events s event/anonymousId/path/metadata", async () => {
  let seenUrl = "";
  let seenBody: Record<string, unknown> = {};
  let seenMethod = "";
  let resolveFetch: () => void;
  const fetchCalled = new Promise<void>((resolve) => {
    resolveFetch = resolve;
  });

  withFakeLocalStorage(() => {
    withMockedFetch(async (url, init) => {
      seenUrl = String(url);
      seenMethod = init?.method ?? "";
      seenBody = JSON.parse(String(init?.body));
      resolveFetch();
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }, () => {
      trackClientEvent("affiliate_click", { path: "/ryby", metadata: { promotion_id: "community-1", placement: "banner" } });
    });
  });

  await fetchCalled;
  assert.equal(seenUrl, "/api/events");
  assert.equal(seenMethod, "POST");
  assert.equal(seenBody.event, "affiliate_click");
  assert.equal(seenBody.path, "/ryby");
  assert.deepEqual(seenBody.metadata, { promotion_id: "community-1", placement: "banner" });
  assert.equal(typeof seenBody.anonymousId, "string");
});

test("trackClientEvent: fetch selhání se nikdy nepropaguje ven (fail-open, žádný throw)", () => {
  withFakeLocalStorage(() => {
    withMockedFetch(
      async () => {
        throw new Error("network down");
      },
      () => {
        assert.doesNotThrow(() => trackClientEvent("page_view", { path: "/ryby" }));
      }
    );
  });
});

test("trackClientEvent: chybějící fetch/localStorage globálně nespadne", () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = (globalThis as { localStorage?: unknown }).localStorage;
  // @ts-expect-error simulace prostředí bez fetch
  delete globalThis.fetch;
  // @ts-expect-error simulace SSR bez localStorage
  delete globalThis.localStorage;
  try {
    assert.doesNotThrow(() => trackClientEvent("page_view", { path: "/ryby" }));
  } finally {
    globalThis.fetch = originalFetch;
    // @ts-expect-error restore
    globalThis.localStorage = originalStorage;
  }
});
