import { test } from "node:test";
import assert from "node:assert/strict";

process.env.UNIVERSAL_CONTENT_API_URL = "https://content-api.example.test";
process.env.UNIVERSAL_CONTENT_API_TOKEN = "uca_test_token_not_real";

const { getActivePromotions } = await import("../lib/universal-content-api/promotions.ts");

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

function record(id: number, data: Record<string, unknown>, withMedia = false) {
  return {
    id,
    status: "approved",
    data,
    media: withMedia
      ? [{ id: id * 10, public_url: `https://x/media/${id * 10}`, original_filename: "a.webp", mime_type: "image/webp", size_bytes: 1, width: 800, height: 200, created_at: "" }]
      : [],
    created_at: "2026-09-01T08:00:00+02:00",
    updated_at: "",
  };
}

test("getActivePromotions: banner bez obrázku se přeskočí (nedává smysl zobrazit)", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [record(1, { placement: "banner", page_pattern: "/ryby", title: "No image", href: "https://x", active: true, weight: 1 }, false)],
      }),
    async () => {
      const promotions = await getActivePromotions("banner");
      assert.equal(promotions.length, 0);
    }
  );
});

test("getActivePromotions: banner bez href se NEpřeskočí — affiliate odkazy zatím nemusí existovat, zobrazí se jako neklikací", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [record(1, { placement: "banner", page_pattern: "/ryby", title: "No href", active: true, weight: 1 }, true)],
      }),
    async () => {
      const promotions = await getActivePromotions("banner");
      assert.equal(promotions.length, 1);
      assert.equal(promotions[0].title, "No href");
      assert.ok(promotions[0].imageUrl);
      assert.equal(promotions[0].href, undefined);
    }
  );
});

test("getActivePromotions: seller nepotřebuje obrázek ani href", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [record(1, { placement: "seller", page_pattern: "*", title: "Seller promo", active: true, weight: 1 }, false)],
      }),
    async () => {
      const promotions = await getActivePromotions("seller");
      assert.equal(promotions.length, 1);
      assert.equal(promotions[0].title, "Seller promo");
      assert.equal(promotions[0].imageUrl, undefined);
    }
  );
});

test("getActivePromotions: 'active: false' se nikdy nevrátí (i když je UCA record approved)", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [record(1, { placement: "banner", page_pattern: "*", title: "Disabled", href: "https://x", active: false, weight: 1 }, true)],
      }),
    async () => {
      const promotions = await getActivePromotions("banner");
      assert.equal(promotions.length, 0);
    }
  );
});

test("getActivePromotions: neplatný placement se přeskočí, ne pád", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [record(1, { placement: "carousel", page_pattern: "*", title: "Bad", active: true, weight: 1 })],
      }),
    async () => {
      const promotions = await getActivePromotions("banner");
      assert.equal(promotions.length, 0);
    }
  );
});

test("getActivePromotions: filtruje podle placementu — seller se nevrátí v banner výsledku", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [
          record(1, { placement: "banner", page_pattern: "/ryby", title: "Banner", href: "https://x", active: true, weight: 1 }, true),
          record(2, { placement: "seller", page_pattern: "/ryby", title: "Seller", active: true, weight: 1 }),
        ],
      }),
    async () => {
      const banners = await getActivePromotions("banner");
      assert.equal(banners.length, 1);
      assert.equal(banners[0].title, "Banner");
    }
  );
});

test("getActivePromotions: poslední navázané médium vyhrává (nový upload při editaci nahradí zobrazený obrázek)", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [
          {
            id: 1,
            status: "approved",
            data: { placement: "banner", page_pattern: "*", title: "T", href: "https://x", active: true, weight: 1 },
            media: [
              { id: 10, public_url: "https://x/media/10-old", original_filename: "old.webp", mime_type: "image/webp", size_bytes: 1, width: 1, height: 1, created_at: "" },
              { id: 11, public_url: "https://x/media/11-new", original_filename: "new.webp", mime_type: "image/webp", size_bytes: 1, width: 1, height: 1, created_at: "" },
            ],
            created_at: "",
            updated_at: "",
          },
        ],
      }),
    async () => {
      const promotions = await getActivePromotions("banner");
      assert.equal(promotions[0].imageUrl, "https://x/media/11-new");
    }
  );
});

test("getActivePromotions: request jde na správnou collection se status=approved", async () => {
  let seenUrl = "";
  await withMockedFetch(
    async (url) => {
      seenUrl = String(url);
      return jsonResponse(200, {
        data: [record(1, { placement: "banner", page_pattern: "/ryby", title: "Ryby banner", href: "https://x", active: true, weight: 1 }, true)],
      });
    },
    () => getActivePromotions("banner")
  );
  assert.match(seenUrl, /collections\/promotions\/records/);
  assert.match(seenUrl, /status=approved/);
});

test("UCA výpadek se nikdy nepropaguje jako neošetřená chyba (catch(() => []))", async () => {
  await withMockedFetch(
    async () => jsonResponse(500, { error: { message: "boom" } }),
    async () => {
      const promotions = await getActivePromotions("banner");
      assert.deepEqual(promotions, []);
    }
  );
});
