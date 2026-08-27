import { test } from "node:test";
import assert from "node:assert/strict";
import { isPageViewRoute } from "../lib/analytics/page-view-routes.ts";

test("isPageViewRoute: hlavní veřejné stránky ze zadání jsou povolené", () => {
  for (const path of [
    "/",
    "/ryby",
    "/predmety",
    "/bossove",
    "/lokace",
    "/navody",
    "/achievementy",
    "/stream",
    "/hra",
    "/multiplayer",
    "/o-hre",
  ]) {
    assert.equal(isPageViewRoute(path), true, `${path} by mělo být povolené`);
  }
});

test("isPageViewRoute: dynamické detaily ryb/návodů jsou povolené", () => {
  assert.equal(isPageViewRoute("/ryby/spider-crab"), true);
  assert.equal(isPageViewRoute("/navody/jak-chytit-parazita"), true);
});

test("isPageViewRoute: submission utility stránky (/navrhnout) jsou vyloučené", () => {
  assert.equal(isPageViewRoute("/ryby/navrhnout"), false);
  assert.equal(isPageViewRoute("/navody/navrhnout"), false);
  assert.equal(isPageViewRoute("/predmety/navrhnout"), false);
  assert.equal(isPageViewRoute("/bossove/navrhnout"), false);
  assert.equal(isPageViewRoute("/lokace/navrhnout"), false);
});

test("isPageViewRoute: API routes, auth callbacky, statické assety, admin jsou vyloučené", () => {
  assert.equal(isPageViewRoute("/api/events"), false);
  assert.equal(isPageViewRoute("/api/auth/steam/callback"), false);
  assert.equal(isPageViewRoute("/api/og"), false);
  assert.equal(isPageViewRoute("/robots.txt"), false);
  assert.equal(isPageViewRoute("/sitemap.xml"), false);
});

test("isPageViewRoute: neexistující/neznámé cesty jsou vyloučené", () => {
  assert.equal(isPageViewRoute("/neco-neexistujiciho"), false);
  assert.equal(isPageViewRoute("/ochrana-soukromi"), false);
  assert.equal(isPageViewRoute("/pravni-informace"), false);
});
