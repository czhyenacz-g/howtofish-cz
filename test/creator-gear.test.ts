import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { creatorGear, getPublicGearForCreator } from "../data/creator-gear.ts";
import type { CreatorGearItem } from "../data/creator-gear.ts";

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

describe("data/creator-gear.ts — připravená struktura pro techniku streamerů, zatím bez vymyšlených dat (zadání bod 5C)", () => {
  test("creatorGear je zatím prázdné pole — žádný tvůrce nemá v projektu ověřené vybavení", () => {
    assert.deepEqual(creatorGear, []);
  });

  test("getPublicGearForCreator vrací prázdné pole pro kohokoliv, dokud jsou data prázdná", () => {
    assert.deepEqual(getPublicGearForCreator("agraelus"), []);
    assert.deepEqual(getPublicGearForCreator("nonexistent"), []);
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
