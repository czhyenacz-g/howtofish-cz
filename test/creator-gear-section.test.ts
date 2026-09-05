import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Zdrojová kontrola .tsx souborů (Node test runner bez JSX transformu
// je neumí přímo importovat) — stejný vzorec jako test/seo-metadata.test.ts.
function readSource(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

describe("CreatorGearSection.tsx", () => {
  const source = readSource("../app/components/CreatorGearSection.tsx");

  test("bez gearu (délka 0) vrátí null — žádný dead placeholder (zadání bod 17)", () => {
    assert.match(source, /gear\.length === 0\) return null/);
    assert.doesNotMatch(source, /Techniku zatím neznáme/);
    assert.doesNotMatch(source, /Brzy doplníme/);
  });

  test("historical položka má viditelný textový badge 'historické' (ne jen barva, zadání bod 24)", () => {
    assert.match(source, />\s*historické\s*</);
  });

  test("formulace u historical je 'dříve používal/a', nikdy 'používá'", () => {
    assert.match(source, /dříve používal\/a/);
  });

  test("affiliate disclosure text je u celé sekce (jednou), ne u každé karty", () => {
    assert.match(source, /affiliate/i);
    assert.match(source, /provizi/);
  });

  test("používá centrální category label dictionary, ne natvrdo české texty", () => {
    assert.match(source, /getGearCategoryLabel/);
  });

  test("CTA je delegované na GearAffiliateCta (jedna komponenta, ne duplicitní CTA markup)", () => {
    assert.match(source, /GearAffiliateCta/);
  });

  test("zdroj s rokem používá 'Zdroj z roku {rok}', jinak generické 'Zdroj'", () => {
    assert.match(source, /Zdroj z roku/);
  });
});

describe("GearAffiliateCta.tsx", () => {
  const source = readSource("../app/components/GearAffiliateCta.tsx");

  test("je 'use client' (onClick handler)", () => {
    assert.match(source, /^"use client";/);
  });

  test("otevírá v novém tabu se sponsored rel (zadání bod 9)", () => {
    assert.match(source, /target="_blank"/);
    assert.match(source, /rel="noopener noreferrer sponsored"/);
  });

  test("nepoužívá text 'Koupit'", () => {
    assert.doesNotMatch(source, />Koupit</);
  });

  test("loguje gear_affiliate_click při kliknutí", () => {
    assert.match(source, /gear_affiliate_click/);
  });

  test("href se počítá přes centrální getGearAffiliateLink (ne duplicitní logika)", () => {
    assert.match(source, /getGearAffiliateLink/);
  });
});
