import { test } from "node:test";
import assert from "node:assert/strict";

process.env.UNIVERSAL_CONTENT_API_URL = "https://content-api.example.test";
process.env.UNIVERSAL_CONTENT_API_TOKEN = "uca_test_token_not_real";

const { getAssetById } = await import("../lib/universal-content-api/assets.ts");

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

test("getAssetById: GETuje /records/{id} v collection 'assets' a mapuje public_url z posledního média", async () => {
  let seenUrl = "";
  let seenMethod = "";
  const asset = await withMockedFetch(
    async (url, init) => {
      seenUrl = String(url);
      seenMethod = init?.method ?? "GET";
      return jsonResponse(200, {
        data: {
          id: 45,
          status: "approved",
          data: { title: "multiplayer badge" },
          media: [{ id: 35, public_url: "https://content-api.darbujan.com/media/35" }],
          created_at: "2026-08-01T00:00:00Z",
          updated_at: "2026-08-01T00:00:00Z",
        },
      });
    },
    () => getAssetById(45)
  );

  assert.match(seenUrl, /\/api\/v1\/projects\/howtofish\/collections\/assets\/records\/45$/);
  assert.equal(seenMethod, "GET");
  assert.deepEqual(asset, { id: 45, title: "multiplayer badge", imageUrl: "https://content-api.darbujan.com/media/35" });
});

test("getAssetById: poslední médium vyhrává, když má record víc médií", async () => {
  const asset = await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: {
          id: 45,
          status: "approved",
          data: { title: "x" },
          media: [
            { id: 1, public_url: "https://content-api.darbujan.com/media/1" },
            { id: 2, public_url: "https://content-api.darbujan.com/media/2" },
          ],
          created_at: "2026-08-01T00:00:00Z",
          updated_at: "2026-08-01T00:00:00Z",
        },
      }),
    () => getAssetById(45)
  );
  assert.equal(asset?.imageUrl, "https://content-api.darbujan.com/media/2");
});

test("getAssetById: null, když record nemá žádné médium (žádný placeholder/fake URL)", async () => {
  const asset = await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: {
          id: 45,
          status: "approved",
          data: {},
          media: [],
          created_at: "2026-08-01T00:00:00Z",
          updated_at: "2026-08-01T00:00:00Z",
        },
      }),
    () => getAssetById(45)
  );
  assert.equal(asset, null);
});

test("getAssetById: null (ne throw), když UCA vrátí chybu (404/nedostupné)", async () => {
  const asset = await withMockedFetch(
    async () => jsonResponse(404, { error: { message: "not_found" } }),
    () => getAssetById(45)
  );
  assert.equal(asset, null);
});

test("getAssetById: null (ne throw), když fetch selže síťově", async () => {
  const asset = await withMockedFetch(
    async () => {
      throw new Error("network down");
    },
    () => getAssetById(45)
  );
  assert.equal(asset, null);
});
