import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../app/components/AdSlot.tsx", import.meta.url)), "utf8");

test("AdSlot.tsx: je Server Component (žádná 'use client' direktiva) — výběr promotion se děje jen server-side", () => {
  const firstLine = source.trimStart().split("\n")[0];
  assert.doesNotMatch(firstLine, /^["']use client["']/);
});

test("AdSlot.tsx: AdPlaceholder je fallback jen pro chybějící obrázek, ne pro chybějící href", () => {
  assert.match(source, /AffiliateBanner/);
  assert.match(source, /AdPlaceholder/);

  // Guard podmínka (if (!promotion || !promotion.imageUrl) return <AdPlaceholder />)
  // nesmí obsahovat `promotion.href` — banner bez href se má renderovat
  // normálně jako neklikací obrázek, ne spadnout do placeholderu.
  const guardMatch = /if\s*\(([^)]*)\)\s*{\s*return <AdPlaceholder \/>;/.exec(source);
  assert.ok(guardMatch, "nepodařilo se najít guard podmínku před <AdPlaceholder />");
  assert.match(guardMatch[1], /promotion\.imageUrl/);
  assert.doesNotMatch(guardMatch[1], /promotion\.href/);

  // href se pořád předává dál do AffiliateBanner (teď jako volitelný prop).
  assert.match(source, /href=\{promotion\.href\}/);
});

test("AdSlot.tsx: nepadá, když je UCA nedostupné (graceful fallback)", () => {
  assert.match(source, /\.catch\(\(\) => null\)/);
});
