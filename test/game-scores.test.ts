import { test } from "node:test";
import assert from "node:assert/strict";

process.env.UNIVERSAL_CONTENT_API_URL = "https://content-api.example.test";
process.env.UNIVERSAL_CONTENT_API_TOKEN = "uca_test_token_not_real";

const { submitGameScore, getLeaderboard } = await import("../lib/universal-content-api/scores.ts");

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

function scoreRecord({
  id,
  game,
  steamId,
  nickname,
  score,
  round,
  createdAt,
}: {
  id: number;
  game: string;
  steamId: string;
  nickname: string;
  score: number;
  round: number;
  createdAt: string;
}) {
  return {
    id,
    status: "pending",
    data: { game, steam_id: steamId, nickname, score, round, kills: 10, best_combo: 2 },
    media: [],
    created_at: createdAt,
    updated_at: "",
  };
}

test("submitGameScore: posílá do collection game_scores a mapuje id z odpovědi", async () => {
  let seenUrl = "";
  await withMockedFetch(
    async (url) => {
      seenUrl = String(url);
      return jsonResponse(201, { data: { id: 9, status: "pending" } });
    },
    async () => {
      const result = await submitGameScore({
        game: "crab-rush",
        steam_id: "765",
        nickname: "Agraelus",
        score: 1240,
        round: 4,
        kills: 37,
        best_combo: 8,
      });
      assert.equal(result.id, 9);
    }
  );
  assert.match(seenUrl, /\/api\/v1\/projects\/howtofish\/collections\/game_scores\/records$/);
});

test("getLeaderboard: request obsahuje filter[game], NE status filtr (skóre není moderované)", async () => {
  let seenUrl = "";
  await withMockedFetch(
    async (url) => {
      seenUrl = String(url);
      return jsonResponse(200, { data: [] });
    },
    async () => {
      await getLeaderboard("crab-rush");
    }
  );
  assert.match(seenUrl, /collections\/game_scores\/records/);
  assert.match(seenUrl, /filter%5Bgame%5D=crab-rush|filter\[game\]=crab-rush/);
  assert.doesNotMatch(seenUrl, /[?&]status=/);
});

test("getLeaderboard: jeden hráč = jeden řádek, vezme jeho nejvyšší skóre", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [
          scoreRecord({ id: 1, game: "crab-rush", steamId: "1", nickname: "Agraelus", score: 500, round: 3, createdAt: "2026-09-01T08:00:00+02:00" }),
          scoreRecord({ id: 2, game: "crab-rush", steamId: "1", nickname: "Agraelus", score: 1200, round: 5, createdAt: "2026-09-02T08:00:00+02:00" }),
          scoreRecord({ id: 3, game: "crab-rush", steamId: "1", nickname: "Agraelus", score: 300, round: 2, createdAt: "2026-09-03T08:00:00+02:00" }),
        ],
      }),
    async () => {
      const leaderboard = await getLeaderboard("crab-rush");
      assert.equal(leaderboard.length, 1);
      assert.equal(leaderboard[0].score, 1200);
      assert.equal(leaderboard[0].round, 5);
    }
  );
});

test("getLeaderboard: seřazeno sestupně podle skóre a omezeno limitem", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [
          scoreRecord({ id: 1, game: "crab-rush", steamId: "1", nickname: "A", score: 100, round: 1, createdAt: "" }),
          scoreRecord({ id: 2, game: "crab-rush", steamId: "2", nickname: "B", score: 900, round: 6, createdAt: "" }),
          scoreRecord({ id: 3, game: "crab-rush", steamId: "3", nickname: "C", score: 400, round: 3, createdAt: "" }),
        ],
      }),
    async () => {
      const leaderboard = await getLeaderboard("crab-rush", 2);
      assert.equal(leaderboard.length, 2);
      assert.equal(leaderboard[0].nickname, "B");
      assert.equal(leaderboard[1].nickname, "C");
    }
  );
});

test("getLeaderboard: záznamy bez potřebných polí se přeskočí, ne pád", async () => {
  await withMockedFetch(
    async () =>
      jsonResponse(200, {
        data: [
          { id: 1, status: "pending", data: { game: "crab-rush" }, media: [], created_at: "", updated_at: "" },
          scoreRecord({ id: 2, game: "crab-rush", steamId: "1", nickname: "Valid", score: 50, round: 1, createdAt: "" }),
        ],
      }),
    async () => {
      const leaderboard = await getLeaderboard("crab-rush");
      assert.equal(leaderboard.length, 1);
      assert.equal(leaderboard[0].nickname, "Valid");
    }
  );
});
