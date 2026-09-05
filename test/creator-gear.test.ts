import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { creatorGear, getPublicGearForCreator } from "../data/creator-gear.ts";
import type { CreatorGearItem } from "../data/creator-gear.ts";
import { creatorProfiles } from "../data/creators.ts";

function gearItem(overrides: Partial<CreatorGearItem> = {}): CreatorGearItem {
  return {
    creatorSlug: "agraelus",
    category: "sluchátka",
    productName: "Test Product",
    sourceUrl: "https://example.com/video",
    sourceType: "video",
    verifiedAt: "2026-09-05",
    confidence: "verified",
    active: true,
    ...overrides,
  };
}

describe("data/creator-gear.ts — technika streamerů, jen dohledaná/ověřená data (zadání bod 5C)", () => {
  test("getPublicGearForCreator vrací prázdné pole pro tvůrce bez public gearu", () => {
    assert.deepEqual(getPublicGearForCreator("agraelus"), []);
    assert.deepEqual(getPublicGearForCreator("nonexistent"), []);
  });

  test("HouseBox má veřejný historical gear (10 položek, gameo.cz zdroj)", () => {
    const gear = getPublicGearForCreator("housebox");
    assert.equal(gear.length, 10);
    assert.ok(gear.every((item) => item.confidence === "historical"));
  });

  test("integrita reálných dat: žádný záznam v creatorGear není probable/unverified (ty se nikam nepublikují, viz zadání)", () => {
    for (const item of creatorGear) {
      assert.ok(
        item.confidence === "verified" || item.confidence === "historical",
        `${item.creatorSlug}/${item.productName} má confidence "${item.confidence}" — do creatorGear patří jen verified/historical`
      );
    }
  });

  test("integrita reálných dat: každý sourceUrl je skutečná https URL (žádný vymyšlený/placeholder odkaz)", () => {
    for (const item of creatorGear) {
      assert.match(item.sourceUrl, /^https:\/\//, `${item.creatorSlug}/${item.productName} nemá platnou sourceUrl`);
    }
  });

  test("integrita reálných dat: creatorSlug odpovídá existujícímu profilu v data/creators.ts", () => {
    const knownSlugs = new Set(creatorProfiles.map((c) => c.slug));
    for (const item of creatorGear) {
      assert.ok(knownSlugs.has(item.creatorSlug), `${item.creatorSlug} není mezi creatorProfiles`);
    }
  });

  test("getPublicGearForCreator (nad testovacími daty) zobrazí 'verified' a 'historical', ne 'probable'/'unverified'", () => {
    const items: CreatorGearItem[] = [
      gearItem({ productName: "A", confidence: "verified" }),
      gearItem({ productName: "B", confidence: "historical" }),
      gearItem({ productName: "C", confidence: "probable" }),
      gearItem({ productName: "D", confidence: "unverified" }),
    ];
    const visible = items.filter((item) => item.active && (item.confidence === "verified" || item.confidence === "historical"));
    assert.deepEqual(
      visible.map((i) => i.productName),
      ["A", "B"]
    );
  });

  test("neaktivní záznam (active: false) se nezobrazí, i kdyby byl verified", () => {
    const items: CreatorGearItem[] = [gearItem({ productName: "Neaktivní", confidence: "verified", active: false })];
    const visible = items.filter((item) => item.active && (item.confidence === "verified" || item.confidence === "historical"));
    assert.deepEqual(visible, []);
  });

  test("filtr respektuje creatorSlug — vybavení jiného tvůrce se nezobrazí", () => {
    const items: CreatorGearItem[] = [gearItem({ creatorSlug: "herdyn" })];
    const visible = items.filter((item) => item.creatorSlug === "agraelus" && item.active && (item.confidence === "verified" || item.confidence === "historical"));
    assert.deepEqual(visible, []);
  });
});
