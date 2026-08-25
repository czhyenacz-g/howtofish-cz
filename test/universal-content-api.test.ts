import { test } from "node:test";
import assert from "node:assert/strict";

process.env.UNIVERSAL_CONTENT_API_URL = "https://content-api.example.test";
process.env.UNIVERSAL_CONTENT_API_TOKEN = "uca_test_token_not_real";

const { createCatchRecord, uploadCatchImage, getApprovedCatches, getApprovedCatchCovers, selectFeaturedCatch } =
  await import("../lib/universal-content-api/catches.ts");
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

test("createCatchRecord: posílá Bearer token a mapuje id z odpovědi", async () => {
  let seenUrl = "";
  let seenAuth = "";
  await withMockedFetch(
    async (url, init) => {
      seenUrl = String(url);
      seenAuth = (init?.headers as Record<string, string>)?.Authorization ?? "";
      return jsonResponse(201, { data: { id: 42, status: "pending" } });
    },
    async () => {
      const result = await createCatchRecord({
        fish_slug: "pufferfish",
        steam_id: "765",
        nickname: "Agraelus",
        caught_at: "2026-09-02T08:00:00+02:00",
        rights_confirmed: true,
      });
      assert.equal(result.id, 42);
    }
  );
  assert.match(seenUrl, /\/api\/v1\/projects\/howtofish\/collections\/catches\/records$/);
  assert.equal(seenAuth, "Bearer uca_test_token_not_real");
});

test("createCatchRecord: chyba UCA se projeví jako UcaError, ne raw exception", async () => {
  await withMockedFetch(
    async () => jsonResponse(422, { error: { message: "Neplatná data." } }),
    async () => {
      await assert.rejects(
        createCatchRecord({
          fish_slug: "pufferfish",
          steam_id: "765",
          nickname: "Agraelus",
          caught_at: "2026-09-02T08:00:00+02:00",
          rights_confirmed: true,
        }),
        UcaError
      );
    }
  );
});

test("uploadCatchImage: posílá record_id ve FormData", async () => {
  let seenFormData: FormData | null = null;
  await withMockedFetch(
    async (_url, init) => {
      seenFormData = init?.body as FormData;
      return jsonResponse(201, { data: { id: 7, public_url: "https://content-api.example.test/media/7" } });
    },
    async () => {
      const file = new File([new Uint8Array(10)], "catch.jpg", { type: "image/jpeg" });
      const media = await uploadCatchImage(42, file);
      assert.equal(media.id, 7);
    }
  );
  assert.equal((seenFormData as unknown as FormData).get("record_id"), "42");
});

test("getApprovedCatches: request vždy obsahuje status=approved a filter[fish_slug]", async () => {
  let seenUrl = "";
  await withMockedFetch(
    async (url) => {
      seenUrl = String(url);
      return jsonResponse(200, { data: [] });
    },
    async () => {
      await getApprovedCatches("pufferfish");
    }
  );
  assert.match(seenUrl, /status=approved/);
  assert.match(seenUrl, /filter%5Bfish_slug%5D=pufferfish|filter\[fish_slug\]=pufferfish/);
});

test("getApprovedCatches: mapuje jen validní záznamy s médiem, seřazené od nejstaršího", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [
          {
            id: 2,
            status: "approved",
            data: { fish_slug: "pufferfish", steam_id: "1", nickname: "B", caught_at: "2026-09-03T10:00:00+02:00" },
            media: [{ id: 20, public_url: "https://x/media/20", original_filename: "b.jpg", mime_type: "image/jpeg", size_bytes: 1, width: null, height: null, created_at: "" }],
            created_at: "2026-09-03T10:00:05+02:00",
            updated_at: "",
          },
          {
            id: 1,
            status: "approved",
            data: { fish_slug: "pufferfish", steam_id: "2", nickname: "A", caught_at: "2026-09-01T08:00:00+02:00" },
            media: [{ id: 10, public_url: "https://x/media/10", original_filename: "a.jpg", mime_type: "image/jpeg", size_bytes: 1, width: null, height: null, created_at: "" }],
            created_at: "2026-09-01T08:00:05+02:00",
            updated_at: "",
          },
          {
            // bez média (např. selhaný upload) -> nesmí projít
            id: 3,
            status: "approved",
            data: { fish_slug: "pufferfish", steam_id: "3", nickname: "C", caught_at: "2026-09-04T08:00:00+02:00" },
            media: [],
            created_at: "2026-09-04T08:00:05+02:00",
            updated_at: "",
          },
        ],
      }),
    async () => {
      const catches = await getApprovedCatches("pufferfish");
      assert.equal(catches.length, 2);
      assert.equal(catches[0].nickname, "A");
      assert.equal(catches[1].nickname, "B");
    }
  );
});

function approvedRecord({
  id,
  fishSlug,
  nickname,
  createdAt,
}: {
  id: number;
  fishSlug: string;
  nickname: string;
  createdAt: string;
}) {
  return {
    id,
    status: "approved",
    data: { fish_slug: fishSlug, steam_id: String(id), nickname, caught_at: createdAt },
    media: [
      {
        id: id * 10,
        public_url: `https://x/media/${id * 10}`,
        original_filename: "a.jpg",
        mime_type: "image/jpeg",
        size_bytes: 1,
        width: 800,
        height: 600,
        created_at: "",
      },
    ],
    created_at: createdAt,
    updated_at: "",
  };
}

test("getApprovedCatchCovers: pro každou rybu vybere nejstarší approved úlovek jako featured cover, s nickname a obrázkem", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [
          approvedRecord({ id: 1, fishSlug: "pufferfish", nickname: "Starší", createdAt: "2026-09-01T08:00:05+02:00" }),
          approvedRecord({ id: 2, fishSlug: "pufferfish", nickname: "Novější", createdAt: "2026-09-05T08:00:05+02:00" }),
        ],
      }),
    async () => {
      const covers = await getApprovedCatchCovers();
      const cover = covers.get("pufferfish");
      assert.equal(cover?.nickname, "Starší");
      assert.equal(cover?.image.url, "https://x/media/10");
      assert.equal(cover?.fishSlug, "pufferfish");
    }
  );
});

test("getApprovedCatchCovers: jeden batch request pokryje víc ryb najednou (bez N+1)", async () => {
  let fetchCallCount = 0;
  let seenUrl = "";
  await withMockedFetch(
    async (url) => {
      fetchCallCount++;
      seenUrl = String(url);
      return jsonResponse(200, {
        data: [
          approvedRecord({ id: 1, fishSlug: "pufferfish", nickname: "A", createdAt: "2026-09-01T08:00:05+02:00" }),
          approvedRecord({ id: 2, fishSlug: "giant-piranha", nickname: "B", createdAt: "2026-09-02T08:00:05+02:00" }),
          approvedRecord({ id: 3, fishSlug: "spider-crab", nickname: "C", createdAt: "2026-09-03T08:00:05+02:00" }),
        ],
      });
    },
    async () => {
      const covers = await getApprovedCatchCovers();
      assert.equal(covers.size, 3);
      assert.ok(covers.has("pufferfish"));
      assert.ok(covers.has("giant-piranha"));
      assert.ok(covers.has("spider-crab"));
    }
  );
  assert.equal(fetchCallCount, 1);
  assert.match(seenUrl, /status=approved/);
});

test("selectFeaturedCatch: prázdný seznam (žádný approved catch) vrátí null", () => {
  assert.equal(selectFeaturedCatch([]), null);
});

test("selectFeaturedCatch: vybere první (nejstarší) záznam ze seřazeného seznamu", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [
          approvedRecord({ id: 2, fishSlug: "pufferfish", nickname: "Novější", createdAt: "2026-09-05T08:00:05+02:00" }),
          approvedRecord({ id: 1, fishSlug: "pufferfish", nickname: "Starší", createdAt: "2026-09-01T08:00:05+02:00" }),
        ],
      }),
    async () => {
      const catches = await getApprovedCatches("pufferfish");
      const featured = selectFeaturedCatch(catches);
      assert.equal(featured?.nickname, "Starší");
    }
  );
});

test("UCA token/URL chybí -> kontrolovaná chyba, ne pád procesu", async () => {
  const originalToken = process.env.UNIVERSAL_CONTENT_API_TOKEN;
  delete process.env.UNIVERSAL_CONTENT_API_TOKEN;
  try {
    await assert.rejects(getApprovedCatches("pufferfish"), UcaError);
  } finally {
    process.env.UNIVERSAL_CONTENT_API_TOKEN = originalToken;
  }
});
