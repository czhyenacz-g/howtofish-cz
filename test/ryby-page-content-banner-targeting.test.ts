import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// `/` a `/ryby` renderují STEJNOU RybyPageContent (viz test/seo-metadata.test.ts)
// — banner targeting proto řeší RybyPageContent samotná přes jeden pevný
// PATHNAME="/ryby" (server i pak client-side v FishBrowser/AffiliateBannerSlot),
// místo dvou promotion records nebo speciálního "/" === "/ryby" pravidla
// v pickPromotion (viz zadání "Řeš to lokálně pro shared homepage/fish content").
const source = readFileSync(fileURLToPath(new URL("../app/ryby/RybyPageContent.tsx", import.meta.url)), "utf8");

test("RybyPageContent.tsx: PATHNAME je pevně '/ryby' (canonical), sdílené pro server pickPromotion i client banner targeting", () => {
  assert.match(source, /const PATHNAME = "\/ryby";/);
});

test("RybyPageContent.tsx: server-side pickPromotion i FishBrowser dostávají stejný PATHNAME (žádné dvě různé cílové cesty pro / a /ryby)", () => {
  assert.match(source, /pickPromotion\(bannerCandidates, PATHNAME\)/);
});
