import { test } from "node:test";
import assert from "node:assert/strict";

process.env.STEAM_API_KEY = "steam_test_key_not_real";

const { getSteamAchievements } = await import("../lib/steam/achievements.ts");

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

const SCHEMA_BODY = {
  game: {
    availableGameStats: {
      achievements: [
        { name: "A01_FirstCreature", displayName: "First Catch", description: "Catch your first creature.", icon: "https://x/a01.jpg", hidden: 0 },
        { name: "A27_Speedrunner", displayName: "Speedrunner", description: "Finish the game fast.", icon: "https://x/a27.jpg", hidden: 0 },
      ],
    },
  },
};

const PERCENTAGES_BODY = {
  achievementpercentages: {
    achievements: [
      { name: "A01_FirstCreature", percent: "100.0" },
      { name: "A27_Speedrunner", percent: "0.9" },
    ],
  },
};

function mockFetchFor(urlToBody: Record<string, { status: number; body: unknown }>) {
  return async (url: string | URL) => {
    const u = String(url);
    if (u.includes("GetSchemaForGame")) return jsonResponse(urlToBody.schema.status, urlToBody.schema.body);
    if (u.includes("GetGlobalAchievementPercentagesForApp"))
      return jsonResponse(urlToBody.percentages.status, urlToBody.percentages.body);
    throw new Error("unexpected fetch: " + u);
  };
}

test("getSteamAchievements: schema + percentages dostupné -> namapuje name/description/icon/globalPercent", async () => {
  await withMockedFetch(
    mockFetchFor({ schema: { status: 200, body: SCHEMA_BODY }, percentages: { status: 200, body: PERCENTAGES_BODY } }),
    async () => {
      const achievements = await getSteamAchievements();
      assert.ok(achievements);
      assert.equal(achievements!.length, 2);
      const first = achievements!.find((a) => a.apiName === "A01_FirstCreature");
      assert.equal(first?.name, "First Catch");
      assert.equal(first?.description, "Catch your first creature.");
      assert.equal(first?.iconUrl, "https://x/a01.jpg");
      assert.equal(first?.globalPercent, 100);
      const rare = achievements!.find((a) => a.apiName === "A27_Speedrunner");
      assert.equal(rare?.globalPercent, 0.9);
    }
  );
});

test("getSteamAchievements: schema chybí/selže -> null (žádná fabrikovaná data)", async () => {
  await withMockedFetch(
    mockFetchFor({ schema: { status: 403, body: {} }, percentages: { status: 200, body: PERCENTAGES_BODY } }),
    async () => {
      const achievements = await getSteamAchievements();
      assert.equal(achievements, null);
    }
  );
});

test("getSteamAchievements: schema prázdné pole -> null", async () => {
  await withMockedFetch(
    mockFetchFor({
      schema: { status: 200, body: { game: { availableGameStats: { achievements: [] } } } },
      percentages: { status: 200, body: PERCENTAGES_BODY },
    }),
    async () => {
      const achievements = await getSteamAchievements();
      assert.equal(achievements, null);
    }
  );
});

test("getSteamAchievements: percentages selžou -> achievementy se vrátí bez globalPercent, ne pád", async () => {
  await withMockedFetch(
    mockFetchFor({ schema: { status: 200, body: SCHEMA_BODY }, percentages: { status: 500, body: {} } }),
    async () => {
      const achievements = await getSteamAchievements();
      assert.ok(achievements);
      assert.equal(achievements!.length, 2);
      assert.ok(achievements!.every((a) => a.globalPercent === undefined));
    }
  );
});

test("getSteamAchievements: bez STEAM_API_KEY vrátí null (graceful fallback, ne pád)", async () => {
  const original = process.env.STEAM_API_KEY;
  delete process.env.STEAM_API_KEY;
  try {
    await withMockedFetch(
      mockFetchFor({ schema: { status: 200, body: SCHEMA_BODY }, percentages: { status: 200, body: PERCENTAGES_BODY } }),
      async () => {
        const achievements = await getSteamAchievements();
        assert.equal(achievements, null);
      }
    );
  } finally {
    process.env.STEAM_API_KEY = original;
  }
});

test("getSteamAchievements: chybějící apiName v položce schema se přeskočí, ne pád", async () => {
  await withMockedFetch(
    mockFetchFor({
      schema: {
        status: 200,
        body: { game: { availableGameStats: { achievements: [{ displayName: "Bez name" }, ...SCHEMA_BODY.game.availableGameStats.achievements] } } },
      },
      percentages: { status: 200, body: PERCENTAGES_BODY },
    }),
    async () => {
      const achievements = await getSteamAchievements();
      assert.equal(achievements!.length, 2);
    }
  );
});
