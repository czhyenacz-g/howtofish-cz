import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// MutationObserver/document jsou DOM API — "use client" soubor s react
// importem nejde pod --conditions=react-server přímo naimportovat, viz
// test/use-banner-visible.test.ts pro stejný důvod a vzor.
const source = readFileSync(
  fileURLToPath(new URL("../app/components/useCharacterCalloutOpen.ts", import.meta.url)),
  "utf8"
);

test("useCharacterCalloutOpen.ts: je 'use client'", () => {
  const firstLine = source.trimStart().split("\n")[0];
  assert.match(firstLine, /^["']use client["']/);
});

test("useCharacterCalloutOpen.ts: čistou logiku (selector/computeCalloutOpen) importuje z callout-open-state.ts", () => {
  assert.match(source, /from "\.\.\/\.\.\/lib\/character-callouts\/callout-open-state"/);
});

test("useCharacterCalloutOpen.ts: žádný polling (setInterval) — jen MutationObserver", () => {
  assert.doesNotMatch(source, /setInterval/);
  assert.match(source, /MutationObserver/);
});

test("useCharacterCalloutOpen.ts: observer se odpojuje v cleanup funkci (disconnect)", () => {
  assert.match(source, /return\s*\(\)\s*=>\s*observer\.disconnect\(\)/);
});
