import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../app/components/AdSlot.tsx", import.meta.url)), "utf8");

test("AdSlot.tsx: je Server Component (žádná 'use client' direktiva) — výběr promotion se děje jen server-side", () => {
  const firstLine = source.trimStart().split("\n")[0];
  assert.doesNotMatch(firstLine, /^["']use client["']/);
});

test("AdSlot.tsx: renderuje AffiliateBanner jen s reálným obrázkem+odkazem, jinak AdPlaceholder", () => {
  assert.match(source, /AffiliateBanner/);
  assert.match(source, /AdPlaceholder/);
  assert.match(source, /promotion\.imageUrl/);
  assert.match(source, /promotion\.href/);
});

test("AdSlot.tsx: nepadá, když je UCA nedostupné (graceful fallback)", () => {
  assert.match(source, /\.catch\(\(\) => null\)/);
});
