import { test } from "node:test";
import assert from "node:assert/strict";
import { getAchievementRarity, sortByRarest } from "../app/(sections)/achievementy/achievement-utils.ts";
import type { SteamAchievement } from "../lib/steam/achievements.ts";

function achievement(overrides: Partial<SteamAchievement> = {}): SteamAchievement {
  return {
    apiName: "A01_Test",
    name: "Test Achievement",
    hidden: false,
    ...overrides,
  };
}

test("getAchievementRarity: pod 20 % je 'rare'", () => {
  assert.equal(getAchievementRarity(achievement({ globalPercent: 19.9 })), "rare");
  assert.equal(getAchievementRarity(achievement({ globalPercent: 0.9 })), "rare");
});

test("getAchievementRarity: 20 % a víc je 'common'", () => {
  assert.equal(getAchievementRarity(achievement({ globalPercent: 20 })), "common");
  assert.equal(getAchievementRarity(achievement({ globalPercent: 100 })), "common");
});

test("getAchievementRarity: bez globalPercent je 'unknown'", () => {
  assert.equal(getAchievementRarity(achievement({ globalPercent: undefined })), "unknown");
});

test("sortByRarest: seřadí od nejnižšího procenta (nejvzácnější) po nejvyšší", () => {
  const list = [
    achievement({ apiName: "common", globalPercent: 90 }),
    achievement({ apiName: "rare", globalPercent: 1.3 }),
    achievement({ apiName: "mid", globalPercent: 40 }),
  ];
  const sorted = sortByRarest(list);
  assert.deepEqual(sorted.map((a) => a.apiName), ["rare", "mid", "common"]);
});

test("sortByRarest: achievementy bez procenta jdou na konec, ne na začátek", () => {
  const list = [
    achievement({ apiName: "unknown", globalPercent: undefined }),
    achievement({ apiName: "rare", globalPercent: 1.3 }),
  ];
  const sorted = sortByRarest(list);
  assert.deepEqual(sorted.map((a) => a.apiName), ["rare", "unknown"]);
});

test("sortByRarest: nemutuje původní pole", () => {
  const list = [achievement({ apiName: "a", globalPercent: 50 }), achievement({ apiName: "b", globalPercent: 10 })];
  const original = [...list];
  sortByRarest(list);
  assert.deepEqual(list, original);
});
