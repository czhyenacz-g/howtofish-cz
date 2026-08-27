import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// "use client" — zdrojová kontrola, stejný vzor jako ostatní
// framework-vázané testy v repu (viz test/ad-slot.test.ts).
const source = readFileSync(fileURLToPath(new URL("../app/stream/StreamBrowser.tsx", import.meta.url)), "utf8");

test("StreamBrowser.tsx: banner výběr jde přes AffiliateBannerSlot (candidates + initialPick), fallback na AdPlaceholder zůstává výchozí", () => {
  assert.match(source, /import AffiliateBannerSlot from "\.\.\/components\/AffiliateBannerSlot"/);
  assert.match(source, /<AffiliateBannerSlot key=\{PATHNAME\} candidates=\{bannerCandidates\} pathname=\{PATHNAME\} initialPick=\{bannerInitialPick\} \/>/);
  assert.doesNotMatch(source, /placeholderOnEmpty/);
  assert.doesNotMatch(source, /<AffiliateBanner\b/);
  assert.doesNotMatch(source, /<AdPlaceholder\b/);
});
