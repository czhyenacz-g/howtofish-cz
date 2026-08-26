import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// "use client" — zdrojová kontrola, stejný vzor jako ostatní
// framework-vázané testy v repu (viz test/ad-slot.test.ts).
const source = readFileSync(fileURLToPath(new URL("../app/ryby/FishBrowser.tsx", import.meta.url)), "utf8");

test("FishBrowser.tsx: bez aktivní banner promotion se nezobrazuje žádný 'Reklamní prostor' placeholder", () => {
  assert.doesNotMatch(source, /AdPlaceholder/);
});

test("FishBrowser.tsx: banner se renderuje jen když má bannerPromotion imageUrl", () => {
  assert.match(source, /\{bannerPromotion\?\.imageUrl && \(/);
  assert.match(source, /<AffiliateBanner/);
});
