import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// "use client" — zdrojová kontrola, stejný vzor jako ostatní
// framework-vázané testy v repu (viz test/ad-slot.test.ts).
const source = readFileSync(fileURLToPath(new URL("../app/ryby/FishBrowser.tsx", import.meta.url)), "utf8");

test("FishBrowser.tsx: bez aktivní (nevyřazené) banner promotion se nezobrazuje žádný 'Reklamní prostor' placeholder", () => {
  assert.match(source, /placeholderOnEmpty=\{false\}/);
  assert.doesNotMatch(source, /AdPlaceholder/);
});

test("FishBrowser.tsx: banner výběr jde přes AffiliateBannerSlot (candidates + initialPick), ne přímo přes AffiliateBanner", () => {
  assert.match(source, /import AffiliateBannerSlot from "\.\.\/components\/AffiliateBannerSlot"/);
  assert.match(source, /<AffiliateBannerSlot/);
  assert.match(source, /candidates=\{bannerCandidates\}/);
  assert.match(source, /initialPick=\{bannerInitialPick\}/);
  assert.doesNotMatch(source, /<AffiliateBanner\b/);
});
