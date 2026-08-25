import { test } from "node:test";
import assert from "node:assert/strict";

process.env.UNIVERSAL_CONTENT_API_URL = "https://content-api.example.test";
process.env.UNIVERSAL_CONTENT_API_TOKEN = "uca_test_token_not_real";

const { getItemEntries, getMyPendingItems } = await import("../lib/universal-content-api/items.ts");
const { getBossEntries } = await import("../lib/universal-content-api/bosses.ts");
const { getLocationEntries } = await import("../lib/universal-content-api/locations.ts");
const { getGuideEntries } = await import("../lib/universal-content-api/guides.ts");

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

function communityRecord(id: number, data: Record<string, unknown>, withMedia = true) {
  return {
    id,
    status: "pending",
    data,
    media: withMedia ? [{ id: id * 10, public_url: `https://x/media/${id * 10}`, original_filename: "a.jpg", mime_type: "image/jpeg", size_bytes: 1, width: 100, height: 100, created_at: "" }] : [],
    created_at: "2026-09-01T08:00:00+02:00",
    updated_at: "",
  };
}

test("getItemEntries: sloučí curated (data/items.ts) + approved komunitní záznamy, curated má autora HowToFish.cz", async () => {
  await withMockedFetch(
    async () => jsonResponse(200, { data: [communityRecord(1, { kind: "new", name: "Silver Rod", steam_id: "1", nickname: "Agraelus" })] }),
    async () => {
      const entries = await getItemEntries();
      const curated = entries.find((e) => e.title === "Hot Dog");
      const community = entries.find((e) => e.title === "Silver Rod");
      assert.equal(curated?.authorName, "HowToFish.cz");
      assert.equal(curated?.source, "curated");
      assert.equal(community?.authorName, "Agraelus");
      assert.equal(community?.source, "community");
    }
  );
});

test("getItemEntries: curated záznam bez obrázku má imageUrl undefined (thumbnail fallback v UI)", async () => {
  await withMockedFetch(
    async () => jsonResponse(200, { data: [] }),
    async () => {
      const entries = await getItemEntries();
      assert.ok(entries.every((e) => e.imageUrl === undefined));
    }
  );
});

test("getItemEntries: 'correction' záznamy se nikdy nezobrazí ve veřejné tabulce", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [communityRecord(2, { kind: "correction", target: "Hot Dog", proposed_changes: "špatný typ", steam_id: "1", nickname: "Agraelus" })],
      }),
    async () => {
      const entries = await getItemEntries();
      assert.equal(entries.some((e) => e.source === "community"), false);
    }
  );
});

test("getMyPendingItems: mapované položky mají pending: true", async () => {
  await withMockedFetch(
    async () => jsonResponse(200, { data: [communityRecord(3, { kind: "new", name: "Bronze Rod", steam_id: "1", nickname: "Agraelus" })] }),
    async () => {
      const pending = await getMyPendingItems("1");
      assert.equal(pending.length, 1);
      assert.equal(pending[0].pending, true);
    }
  );
});

test("getBossEntries: curated boss má detailHref na /ryby/[slug], komunitní ne", async () => {
  await withMockedFetch(
    async () => jsonResponse(200, { data: [communityRecord(4, { kind: "new", name: "King Crab", steam_id: "1", nickname: "Agraelus" })] }),
    async () => {
      const entries = await getBossEntries();
      const curated = entries.find((e) => e.title === "Spider Crab");
      const community = entries.find((e) => e.title === "King Crab");
      assert.equal(curated?.detailHref, "/ryby/spider-crab");
      assert.equal(community?.detailHref, undefined);
    }
  );
});

test("getLocationEntries: curated ostrovy jsou přítomné a seřazené podle názvu", async () => {
  await withMockedFetch(
    async () => jsonResponse(200, { data: [] }),
    async () => {
      const entries = await getLocationEntries();
      assert.ok(entries.some((e) => e.title === "Ostrov 1 (Maják)"));
      const titles = entries.map((e) => e.title);
      const sorted = [...titles].sort((a, b) => a.localeCompare(b, "cs"));
      assert.deepEqual(titles, sorted);
    }
  );
});

test("getGuideEntries: komunitní návod dostane slug 'community-{id}' pro /navody/[slug]", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [communityRecord(7, { kind: "new", title: "Vlastní postup", summary: "Shrnutí", content: "Obsah", steam_id: "1", nickname: "Agraelus" }, false)],
      }),
    async () => {
      const entries = await getGuideEntries();
      const community = entries.find((e) => e.title === "Vlastní postup");
      assert.equal(community?.slug, "community-7");
      // Bez média -> imageUrl undefined (placeholder v UI), ne pád.
      assert.equal(community?.imageUrl, undefined);
    }
  );
});

test("getGuideEntries: curated návod má content pro detail stránku", async () => {
  await withMockedFetch(
    async () => jsonResponse(200, { data: [] }),
    async () => {
      const entries = await getGuideEntries();
      const guide = entries.find((e) => e.slug === "jak-porazit-spider-crab");
      assert.ok(guide?.content && guide.content.length > 0);
    }
  );
});
