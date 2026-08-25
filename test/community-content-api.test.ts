import { test } from "node:test";
import assert from "node:assert/strict";

process.env.UNIVERSAL_CONTENT_API_URL = "https://content-api.example.test";
process.env.UNIVERSAL_CONTENT_API_TOKEN = "uca_test_token_not_real";

const {
  createCommunityRecord,
  uploadCommunityImage,
  getApprovedCommunityRecords,
  getMyPendingCommunityRecords,
  checkCommunityRateLimit,
} = await import("../lib/universal-content-api/community.ts");

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

test("createCommunityRecord: posílá do libovolné collection a mapuje id z odpovědi", async () => {
  let seenUrl = "";
  await withMockedFetch(
    async (url) => {
      seenUrl = String(url);
      return jsonResponse(201, { data: { id: 11, status: "pending" } });
    },
    async () => {
      const result = await createCommunityRecord("item_suggestions", { kind: "new", name: "Golden Rod" });
      assert.equal(result.id, 11);
    }
  );
  assert.match(seenUrl, /\/api\/v1\/projects\/howtofish\/collections\/item_suggestions\/records$/);
});

test("uploadCommunityImage: posílá record_id ve FormData", async () => {
  let seenFormData: FormData | null = null;
  await withMockedFetch(
    async (_url, init) => {
      seenFormData = init?.body as FormData;
      return jsonResponse(201, { data: { id: 5, public_url: "https://x/media/5" } });
    },
    async () => {
      const file = new File([new Uint8Array(10)], "shot.jpg", { type: "image/jpeg" });
      await uploadCommunityImage(42, file);
    }
  );
  assert.equal((seenFormData as unknown as FormData).get("record_id"), "42");
});

test("getApprovedCommunityRecords: request obsahuje status=approved pro danou collection", async () => {
  let seenUrl = "";
  await withMockedFetch(
    async (url) => {
      seenUrl = String(url);
      return jsonResponse(200, { data: [] });
    },
    async () => {
      await getApprovedCommunityRecords("boss_suggestions");
    }
  );
  assert.match(seenUrl, /collections\/boss_suggestions\/records/);
  assert.match(seenUrl, /status=approved/);
});

test("getMyPendingCommunityRecords: request obsahuje status=pending A filter[steam_id]", async () => {
  let seenUrl = "";
  await withMockedFetch(
    async (url) => {
      seenUrl = String(url);
      return jsonResponse(200, { data: [] });
    },
    async () => {
      await getMyPendingCommunityRecords("location_suggestions", "76561198000000001");
    }
  );
  assert.match(seenUrl, /collections\/location_suggestions\/records/);
  assert.match(seenUrl, /status=pending/);
  assert.match(seenUrl, /filter%5Bsteam_id%5D=76561198000000001|filter\[steam_id\]=76561198000000001/);
});

function suggestionRecord(steamId: string, createdAt: string) {
  return {
    id: 1,
    status: "pending",
    data: { name: "X", steam_id: steamId, nickname: "N" },
    media: [],
    created_at: createdAt,
    updated_at: "",
  };
}

test("checkCommunityRateLimit: povolí pod limitem, výchozí limit 10/hod a 30/den", async () => {
  await withMockedFetch(
    async () => jsonResponse(200, { data: [] }),
    async () => {
      const result = await checkCommunityRateLimit("item_suggestions", "1");
      assert.equal(result.allowed, true);
    }
  );
});

test("checkCommunityRateLimit: zamítne po dosažení hodinového limitu (výchozí 10)", async () => {
  const now = Date.now();
  const records = Array.from({ length: 10 }, () => suggestionRecord("1", new Date(now).toISOString()));
  await withMockedFetch(
    async () => jsonResponse(200, { data: records }),
    async () => {
      const result = await checkCommunityRateLimit("item_suggestions", "1");
      assert.equal(result.allowed, false);
    }
  );
});

test("checkCommunityRateLimit: respektuje vlastní hourlyMax/dailyMax", async () => {
  const now = Date.now();
  const records = Array.from({ length: 3 }, () => suggestionRecord("1", new Date(now).toISOString()));
  await withMockedFetch(
    async () => jsonResponse(200, { data: records }),
    async () => {
      const result = await checkCommunityRateLimit("item_suggestions", "1", { hourlyMax: 3, dailyMax: 30 });
      assert.equal(result.allowed, false);
    }
  );
});
