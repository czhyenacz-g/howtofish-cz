import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { computeAnyVisible, PROMOTION_BANNER_SELECTOR } from "../lib/character-callouts/banner-visibility.ts";

test("PROMOTION_BANNER_SELECTOR: cílí na data-promotion-banner=\"true\"", () => {
  assert.equal(PROMOTION_BANNER_SELECTOR, '[data-promotion-banner="true"]');
});

test("computeAnyVisible: false, když nic neprotíná viewport", () => {
  assert.equal(computeAnyVisible(0), false);
});

test("computeAnyVisible: true, když aspoň jeden element protíná viewport", () => {
  assert.equal(computeAnyVisible(1), true);
  assert.equal(computeAnyVisible(3), true);
});

// IntersectionObserver/document jsou DOM API bez jsdom v projektu přímo
// netestovatelné (a "use client" soubor s react importem nejde pod
// --conditions=react-server naimportovat) — zdrojová kontrola stejným
// vzorem jako ostatní framework-vázané testy v repu (viz test/ad-slot.test.ts).
const source = readFileSync(fileURLToPath(new URL("../app/components/useBannerVisible.ts", import.meta.url)), "utf8");

test("useBannerVisible.ts: je 'use client' (potřebuje document/IntersectionObserver)", () => {
  const firstLine = source.trimStart().split("\n")[0];
  assert.match(firstLine, /^["']use client["']/);
});

test("useBannerVisible.ts: čistou logiku (computeAnyVisible/selector) importuje z banner-visibility.ts, nezavádí duplicitní pravidla", () => {
  assert.match(source, /from "\.\.\/\.\.\/lib\/character-callouts\/banner-visibility"/);
});

test("useBannerVisible.ts: žádný polling (setInterval) — jen IntersectionObserver", () => {
  assert.doesNotMatch(source, /setInterval/);
  assert.match(source, /IntersectionObserver/);
});

test("useBannerVisible.ts: observer se odpojuje v cleanup funkci (disconnect)", () => {
  assert.match(source, /return\s*\(\)\s*=>\s*observer\.disconnect\(\)/);
});

test("useBannerVisible.ts: znovu se napojuje při změně pathname (deps obsahují pathname)", () => {
  assert.match(source, /\},\s*\[pathname\]\);/);
});
