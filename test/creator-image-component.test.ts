import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

function readSource(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

describe("CreatorImage.tsx", () => {
  const source = readSource("../app/components/CreatorImage.tsx");

  test("je 'use client' (onError handler + useState)", () => {
    assert.match(source, /^"use client";/);
  });

  test("index je vždy clampnutý na chain.length - 1 — žádná nekonečná fallback smyčka", () => {
    assert.match(source, /Math\.min\(i \+ 1, chain\.length - 1\)/);
  });

  test("video varianta bleeduje přes padding karty (záporný margin) a nechává object-cover ořezat 16:9", () => {
    assert.match(source, /aspect-video/);
    assert.match(source, /object-cover/);
    assert.match(source, /-mx-4 -mt-4/);
  });

  test("obrázek má vždy alt (žádné generické alt=\"image\")", () => {
    assert.doesNotMatch(source, /alt="image"/i);
    assert.match(source, /alt=\{current\.alt\}/);
  });

  test("'initial' fallback (bez src) používá existující CreatorAvatar, ne duplicitní iniciálovou logiku", () => {
    assert.match(source, /CreatorAvatar/);
  });

  test("lazy loading pro obrázky pod foldem", () => {
    assert.match(source, /loading="lazy"/);
  });

  test("children (jméno/vlajka/platform badge) se vykreslí v obou layoutech", () => {
    const occurrences = source.match(/\{children\}/g) ?? [];
    assert.equal(occurrences.length, 2);
  });
});
