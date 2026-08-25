import { test } from "node:test";
import assert from "node:assert/strict";

process.env.UNIVERSAL_CONTENT_API_URL = "https://content-api.example.test";
process.env.UNIVERSAL_CONTENT_API_TOKEN = "uca_test_token_not_real";

const { createSuggestionRecord, uploadSuggestionImage, getMyPendingSuggestions, checkSuggestionRateLimit } =
  await import("../lib/universal-content-api/suggestions.ts");
const { UcaError } = await import("../lib/universal-content-api/client.ts");

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

function suggestionRecord({
  id,
  steamId,
  nickname,
  name = "Golden Crab",
  createdAt,
  withMedia = true,
}: {
  id: number;
  steamId: string;
  nickname: string;
  name?: string;
  createdAt: string;
  withMedia?: boolean;
}) {
  return {
    id,
    status: "pending",
    data: { name, type: "creature", location: "Ostrov 4", steam_id: steamId, nickname },
    media: withMedia
      ? [{ id: id * 10, public_url: `https://x/media/${id * 10}`, original_filename: "a.jpg", mime_type: "image/jpeg", size_bytes: 1, width: 800, height: 600, created_at: "" }]
      : [],
    created_at: createdAt,
    updated_at: "",
  };
}

test("createSuggestionRecord: posílá do collection fish_suggestions a mapuje id z odpovědi", async () => {
  let seenUrl = "";
  await withMockedFetch(
    async (url) => {
      seenUrl = String(url);
      return jsonResponse(201, { data: { id: 55, status: "pending" } });
    },
    async () => {
      const result = await createSuggestionRecord({
        name: "Golden Crab",
        type: "creature",
        location: "Ostrov 4",
        steam_id: "765",
        nickname: "Agraelus",
        rights_confirmed: true,
      });
      assert.equal(result.id, 55);
    }
  );
  assert.match(seenUrl, /\/api\/v1\/projects\/howtofish\/collections\/fish_suggestions\/records$/);
});

test("uploadSuggestionImage: posílá record_id ve FormData", async () => {
  let seenFormData: FormData | null = null;
  await withMockedFetch(
    async (_url, init) => {
      seenFormData = init?.body as FormData;
      return jsonResponse(201, { data: { id: 7, public_url: "https://content-api.example.test/media/7" } });
    },
    async () => {
      const file = new File([new Uint8Array(10)], "shot.jpg", { type: "image/jpeg" });
      await uploadSuggestionImage(55, file);
    }
  );
  assert.equal((seenFormData as unknown as FormData).get("record_id"), "55");
});

test("getMyPendingSuggestions: request obsahuje status=pending A filter[steam_id] (server-side, ne client filtr)", async () => {
  let seenUrl = "";
  await withMockedFetch(
    async (url) => {
      seenUrl = String(url);
      return jsonResponse(200, { data: [] });
    },
    async () => {
      await getMyPendingSuggestions("76561198012345678");
    }
  );
  assert.match(seenUrl, /collections\/fish_suggestions\/records/);
  assert.match(seenUrl, /status=pending/);
  assert.match(seenUrl, /filter%5Bsteam_id%5D=76561198012345678|filter\[steam_id\]=76561198012345678/);
});

test("getMyPendingSuggestions: vrací jen záznamy patřící danému steam_id (server odpověď respektuje filtr, žádné doplňkové client-side filtrování jiných uživatelů)", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [suggestionRecord({ id: 1, steamId: "111", nickname: "Já", createdAt: "2026-09-01T08:00:00+02:00" })],
      }),
    async () => {
      const mine = await getMyPendingSuggestions("111");
      assert.equal(mine.length, 1);
      assert.equal(mine[0].nickname, "Já");
    }
  );
});

test("getMyPendingSuggestions: jiný přihlášený uživatel (jiné steam_id) dostane prázdný výsledek, když UCA vrátí prázdná data pro jeho filtr", async () => {
  await withMockedFetch(
    async (url) => {
      // Simuluje reálné chování UCA — filtr na steam_id jiného uživatele nenajde nic.
      const u = String(url);
      if (u.includes("filter%5Bsteam_id%5D=222") || u.includes("filter[steam_id]=222")) {
        return jsonResponse(200, { data: [] });
      }
      return jsonResponse(200, { data: [suggestionRecord({ id: 1, steamId: "111", nickname: "Já", createdAt: "" })] });
    },
    async () => {
      const other = await getMyPendingSuggestions("222");
      assert.equal(other.length, 0);
    }
  );
});

test("getMyPendingSuggestions: záznam bez média má image: null (fallback na placeholder v UI), ne pád", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [suggestionRecord({ id: 1, steamId: "111", nickname: "Já", createdAt: "", withMedia: false })],
      }),
    async () => {
      const mine = await getMyPendingSuggestions("111");
      assert.equal(mine[0].image, null);
    }
  );
});

test("checkSuggestionRateLimit: povolí, když je pod limitem", async () => {
  await withMockedFetch(
    async () => jsonResponse(200, { data: [] }),
    async () => {
      const result = await checkSuggestionRateLimit("111");
      assert.equal(result.allowed, true);
    }
  );
});

test("checkSuggestionRateLimit: zamítne po dosažení hodinového limitu", async () => {
  const now = Date.now();
  const records = Array.from({ length: 5 }, (_, i) =>
    suggestionRecord({ id: i + 1, steamId: "111", nickname: "Já", createdAt: new Date(now - i * 1000).toISOString() })
  );
  await withMockedFetch(
    async () => jsonResponse(200, { data: records }),
    async () => {
      const result = await checkSuggestionRateLimit("111");
      assert.equal(result.allowed, false);
    }
  );
});

test("UCA token/URL chybí -> kontrolovaná chyba (UcaError), ne pád procesu", async () => {
  const originalToken = process.env.UNIVERSAL_CONTENT_API_TOKEN;
  delete process.env.UNIVERSAL_CONTENT_API_TOKEN;
  try {
    await assert.rejects(getMyPendingSuggestions("111"), UcaError);
  } finally {
    process.env.UNIVERSAL_CONTENT_API_TOKEN = originalToken;
  }
});
