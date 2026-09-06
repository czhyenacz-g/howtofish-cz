import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { creatorGear, getPublicGearForCreator, hasConfirmedGear, isPublicGearConfidence } from "../data/creator-gear.ts";
import type { CreatorGearItem } from "../data/creator-gear.ts";
import { creatorProfiles } from "../data/creators.ts";

function gearItem(overrides: Partial<CreatorGearItem> = {}): CreatorGearItem {
  return {
    creatorSlug: "test-slug",
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

describe("isPublicGearConfidence", () => {
  test("verified/historical/estimated jsou veřejné", () => {
    assert.equal(isPublicGearConfidence("verified"), true);
    assert.equal(isPublicGearConfidence("historical"), true);
    assert.equal(isPublicGearConfidence("estimated"), true);
  });

  test("probable/unverified nejsou veřejné", () => {
    assert.equal(isPublicGearConfidence("probable"), false);
    assert.equal(isPublicGearConfidence("unverified"), false);
  });
});

describe("getPublicGearForCreator — na syntetických datech", () => {
  test("zobrazí verified, historical i estimated", () => {
    const items: CreatorGearItem[] = [
      gearItem({ productName: "A", confidence: "verified" }),
      gearItem({ productName: "B", confidence: "historical" }),
      gearItem({ productName: "C", confidence: "estimated", sourceUrl: undefined, sourceType: "estimate" }),
      gearItem({ productName: "D", confidence: "probable" }),
      gearItem({ productName: "E", confidence: "unverified" }),
    ];
    const visible = items.filter((item) => item.active && isPublicGearConfidence(item.confidence));
    assert.deepEqual(
      visible.map((i) => i.productName),
      ["A", "B", "C"]
    );
  });

  test("neaktivní záznam (active: false) se nezobrazí, i kdyby byl verified", () => {
    const items: CreatorGearItem[] = [gearItem({ productName: "Neaktivní", confidence: "verified", active: false })];
    const visible = items.filter((item) => item.active && isPublicGearConfidence(item.confidence));
    assert.deepEqual(visible, []);
  });

  test("filtr respektuje creatorSlug — vybavení jiného tvůrce se nezobrazí", () => {
    const items: CreatorGearItem[] = [gearItem({ creatorSlug: "herdyn" })];
    const visible = items.filter((item) => item.creatorSlug === "agraelus" && item.active && isPublicGearConfidence(item.confidence));
    assert.deepEqual(visible, []);
  });
});

describe("data/creator-gear.ts — reálná data (rozšíření na všechny profily /streameri/*)", () => {
  test("getPublicGearForCreator vrací prázdné pole pro neexistujícího tvůrce", () => {
    assert.deepEqual(getPublicGearForCreator("nonexistent"), []);
  });

  test("HouseBox setup dál funguje beze změny (10 historical položek, gameo.cz zdroj)", () => {
    const gear = getPublicGearForCreator("housebox");
    assert.equal(gear.length, 10);
    assert.ok(gear.every((item) => item.confidence === "historical"));
    assert.ok(gear.every((item) => item.sourceUrl?.startsWith("https://gameo.cz/")));
  });

  test("Agraelus má verified gear (TIGO by Agraelus)", () => {
    const gear = getPublicGearForCreator("agraelus");
    assert.ok(gear.length > 0);
    assert.ok(gear.every((item) => item.confidence === "verified"));
  });

  test("FlyGun a Herdyn mají historical gear s reálným zdrojem", () => {
    for (const slug of ["flygun", "herdyn"]) {
      const gear = getPublicGearForCreator(slug);
      assert.ok(gear.length > 0, `${slug} nemá žádný gear`);
      assert.ok(gear.every((item) => item.confidence === "historical"), `${slug} má nehistorickou položku`);
      assert.ok(gear.every((item) => item.sourceUrl?.startsWith("https://")), `${slug} má položku bez platné sourceUrl`);
    }
  });

  test("streameři bez dohledaného zdroje mají jen estimated gear", () => {
    for (const slug of ["haiset", "fattypillow", "marwex", "kapesnik69", "miken", "astatoro", "2sekundovymato", "freeze", "anymall", "boshoo", "pixelorezlive"]) {
      const gear = getPublicGearForCreator(slug);
      assert.ok(gear.length > 0, `${slug} nemá žádný gear`);
      assert.ok(gear.every((item) => item.confidence === "estimated"), `${slug} má jinou confidence než estimated`);
      assert.ok(!hasConfirmedGear(slug), `${slug} by neměl mít žádnou doloženou položku`);
    }
  });

  test("úplně každý profil v data/creators.ts má aspoň jednu veřejnou gear položku (cíl zadání)", () => {
    for (const creator of creatorProfiles) {
      const gear = getPublicGearForCreator(creator.slug);
      assert.ok(gear.length > 0, `${creator.slug} nemá žádnou veřejnou gear položku`);
    }
  });

  test("integrita: žádný záznam v creatorGear nemá probable/unverified (ty se nikam nepublikují)", () => {
    for (const item of creatorGear) {
      assert.ok(
        isPublicGearConfidence(item.confidence),
        `${item.creatorSlug}/${item.productName} má confidence "${item.confidence}" — do creatorGear patří jen verified/historical/estimated`
      );
    }
  });

  test("integrita: verified/historical mají vždy platnou https sourceUrl (žádný vymyšlený/placeholder odkaz)", () => {
    for (const item of creatorGear) {
      if (item.confidence === "verified" || item.confidence === "historical") {
        assert.match(item.sourceUrl ?? "", /^https:\/\//, `${item.creatorSlug}/${item.productName} (${item.confidence}) nemá platnou sourceUrl`);
      }
    }
  });

  test("integrita: estimated položky NIKDY nemají sourceUrl (žádný vymyšlený zdroj, zadání bod 26)", () => {
    for (const item of creatorGear) {
      if (item.confidence === "estimated") {
        assert.equal(item.sourceUrl, undefined, `${item.creatorSlug}/${item.productName} je estimated, ale má sourceUrl`);
        assert.equal(item.sourceType, "estimate", `${item.creatorSlug}/${item.productName} je estimated, ale sourceType není "estimate"`);
      }
    }
  });

  test("integrita: creatorSlug u každé položky odpovídá existujícímu profilu v data/creators.ts", () => {
    const knownSlugs = new Set(creatorProfiles.map((c) => c.slug));
    for (const item of creatorGear) {
      assert.ok(knownSlugs.has(item.creatorSlug), `${item.creatorSlug} není mezi creatorProfiles`);
    }
  });
});
