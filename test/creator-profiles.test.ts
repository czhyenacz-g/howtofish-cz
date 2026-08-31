import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { creatorProfiles, getCreatorProfile } from "../data/creators.ts";

const NEW_CAUTIOUS_SLUGS = ["haiset", "kapesnik69", "fattypillow", "marwex"];
const EXISTING_VERIFIED_SLUGS = ["agraelus", "herdyn", "flygun", "freeze", "miken"];

describe("creatorProfiles", () => {
  test("existující ověření tvůrci zůstávají beze změny slugů", () => {
    for (const slug of EXISTING_VERIFIED_SLUGS) {
      assert.ok(getCreatorProfile(slug), `chybí existující tvůrce ${slug}`);
    }
  });

  test("nové profily existují pod očekávanými slugy", () => {
    for (const slug of NEW_CAUTIOUS_SLUGS) {
      assert.ok(getCreatorProfile(slug), `chybí nový profil ${slug}`);
    }
  });

  test("slugy jsou unikátní", () => {
    const slugs = creatorProfiles.map((c) => c.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  test("nové profily nemají žádné vymyšlené video záznamy (prázdné pole videos)", () => {
    for (const slug of NEW_CAUTIOUS_SLUGS) {
      const profile = getCreatorProfile(slug);
      assert.equal(profile?.videos.length, 0, `${slug} by neměl mít vymyšlená videa`);
    }
  });

  test("existující ověření tvůrci mají dál svá videa beze změny", () => {
    for (const slug of EXISTING_VERIFIED_SLUGS) {
      const profile = getCreatorProfile(slug);
      assert.ok(profile && profile.videos.length > 0, `${slug} by měl mít aspoň jedno video`);
    }
  });

  test("Kapesník69 text netvrdí nic silnějšího než 'součástí scény' — žádné 'pravidelně streamuje'", () => {
    const kapesnik = getCreatorProfile("kapesnik69");
    assert.ok(kapesnik?.bio);
    assert.doesNotMatch(kapesnik.bio!.toLowerCase(), /pravidelně/);
  });

  test("Kapesník69 → FlyGun vazba existuje v datech (relatedCreatorSlug)", () => {
    const kapesnik = getCreatorProfile("kapesnik69");
    assert.equal(kapesnik?.relatedCreatorSlug, "flygun");
  });

  test("žádný nový profil netvrdí konkrétní statistiky (hodiny, pořadí, rekordy)", () => {
    for (const slug of NEW_CAUTIOUS_SLUGS) {
      const profile = getCreatorProfile(slug);
      const text = profile?.bio ?? "";
      assert.doesNotMatch(text, /\d+\s*(hodin|hodiny|hodin\.|views|zhlédnutí)/i);
    }
  });
});
