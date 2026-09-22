import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { getGameBySlug } from "../data/games.ts";
import { dedupeVideos, discoverVideosForGame, estimateQuotaUnits, type RawVideo } from "../lib/games/video-discovery.ts";

// Discovery volá YouTube přes lib/youtube/client.ts — v testech mockujeme
// globalThis.fetch, takže se nikdy nevolá reálné API ani se nespotřebuje
// kvóta.

const minecraft = getGameBySlug("minecraft")!;
const ORIGINAL_FETCH = globalThis.fetch;
const ORIGINAL_KEY = process.env.YOUTUBE_API_KEY;

let responder: (url: string) => { status: number; json: unknown };

beforeEach(() => {
  process.env.YOUTUBE_API_KEY = "test-key";
  responder = () => ({ status: 200, json: { items: [] } });
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const { status, json } = responder(String(input));
    return new Response(JSON.stringify(json), { status, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  if (ORIGINAL_KEY === undefined) delete process.env.YOUTUBE_API_KEY;
  else process.env.YOUTUBE_API_KEY = ORIGINAL_KEY;
});

function searchItem(videoId: string, title: string) {
  return {
    id: { videoId },
    snippet: {
      title,
      description: "",
      channelId: "chan-1",
      channelTitle: "Test Channel",
      publishedAt: "2026-01-01T00:00:00Z",
      thumbnails: { medium: { url: "https://img.youtube.com/vi/" + videoId + "/mqdefault.jpg" } },
    },
  };
}

function details(url: string): unknown {
  const ids = new URL(url).searchParams.get("id")?.split(",") ?? [];
  return {
    items: ids.map((id) => ({
      id,
      contentDetails: { duration: "PT12M30S" },
      statistics: { viewCount: "1234" },
    })),
  };
}

describe("video-discovery — deduplikace", () => {
  test("stejné video z více dotazů zůstane jednou (první dotaz vyhrává)", () => {
    const videos: RawVideo[] = [
      { videoId: "a", title: "A", description: "", channelId: "c", channelTitle: "C", publishedAt: "", query: "q1" },
      { videoId: "b", title: "B", description: "", channelId: "c", channelTitle: "C", publishedAt: "", query: "q1" },
      { videoId: "a", title: "A", description: "", channelId: "c", channelTitle: "C", publishedAt: "", query: "q2" },
    ];
    const deduped = dedupeVideos(videos);
    assert.deepEqual(
      deduped.map((video) => video.videoId),
      ["a", "b"]
    );
    assert.equal(deduped[0]?.query, "q1");
  });

  test("odhad kvóty: 5 dotazů = 501 jednotek", () => {
    assert.equal(estimateQuotaUnits(5), 501);
    assert.equal(estimateQuotaUnits(0), 0);
  });
});

describe("video-discovery — discovery run", () => {
  test("ohodnotí relevantní videa a irelevantní zahodí", async () => {
    responder = (url) => {
      if (url.includes("/videos")) return { status: 200, json: details(url) };
      const q = new URL(url).searchParams.get("q");
      if (q === "Minecraft fishing") {
        return { status: 200, json: { items: [searchItem("vid1", "Minecraft fishing guide"), searchItem("vid2", "Minecraft survival episode 5")] } };
      }
      return { status: 200, json: { items: [] } };
    };

    const result = await discoverVideosForGame(minecraft);

    assert.equal(result.gameSlug, "minecraft");
    assert.equal(result.queries.length, 5);
    assert.equal(result.rawCount, 2);
    assert.deepEqual(result.candidates.map((candidate) => candidate.videoId), ["vid1"]);
    const candidate = result.candidates[0]!;
    assert.ok(candidate.relevanceScore >= 60);
    assert.equal(candidate.viewCount, 1234);
    assert.equal(candidate.durationSeconds, 750);
    assert.equal(candidate.thumbnailUrl, "https://img.youtube.com/vi/vid1/mqdefault.jpg");
    assert.deepEqual(result.errors, []);
  });

  test("stejné video z více dotazů se v kandidátech objeví jen jednou", async () => {
    responder = (url) => {
      if (url.includes("/videos")) return { status: 200, json: details(url) };
      return { status: 200, json: { items: [searchItem("vid-shared", "Minecraft fishing tips")] } };
    };

    const result = await discoverVideosForGame(minecraft);
    assert.equal(result.rawCount, 5);
    assert.equal(result.candidates.length, 1);
    assert.equal(result.candidates[0]!.videoId, "vid-shared");
  });

  test("chyba jednoho dotazu je fail-soft — ostatní dotazy pokračují", async () => {
    responder = (url) => {
      if (url.includes("/videos")) return { status: 200, json: details(url) };
      const q = new URL(url).searchParams.get("q") ?? "";
      if (q.includes("guide")) return { status: 500, json: { error: "boom" } };
      return { status: 200, json: { items: [searchItem("vid3", "Minecraft fishing challenge")] } };
    };

    const result = await discoverVideosForGame(minecraft);
    assert.equal(result.errors.length >= 1, true);
    assert.match(result.errors.join(" "), /500/);
    assert.equal(result.candidates.length, 1);
  });

  test("bez YOUTUBE_API_KEY se nic nevolá a vrátí se vysvětlující chyba", async () => {
    delete process.env.YOUTUBE_API_KEY;
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response("{}", { status: 200 });
    }) as typeof fetch;

    const result = await discoverVideosForGame(minecraft);
    assert.equal(called, false);
    assert.deepEqual(result.candidates, []);
    assert.match(result.errors.join(" "), /YOUTUBE_API_KEY/);
  });

  test("vyčerpaný denní limit YouTube search (429) se ohlásí a další dotazy se už nezkouší", async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response(JSON.stringify({ error: { code: 429, status: "RESOURCE_EXHAUSTED" } }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const result = await discoverVideosForGame(minecraft);
    assert.equal(result.quotaExceeded, true);
    assert.equal(calls, 1, "po kvótní chybě se nesmí pokračovat dalšími dotazy");
    assert.deepEqual(result.candidates, []);
    assert.match(result.errors.join(" "), /429/);
  });

  test("hra bez kurátorovaných dotazů nic nehledá", async () => {
    const hades = getGameBySlug("hades")!;
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response("{}", { status: 200 });
    }) as typeof fetch;

    const result = await discoverVideosForGame(hades);
    assert.equal(called, false);
    assert.deepEqual(result.queries, []);
    assert.deepEqual(result.candidates, []);
  });
});
