import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { creatorProfiles, getCreatorProfile } from "../data/creators.ts";

const NEW_CAUTIOUS_SLUGS = ["haiset", "kapesnik69", "fattypillow", "marwex"];
const EXISTING_VERIFIED_SLUGS = ["agraelus", "herdyn", "flygun", "freeze", "miken"];
const CZSK_EXPANSION_VERIFIED_SLUGS = ["housebox", "astatoro", "2sekundovymato"];
const CZSK_EXPANSION_CAUTIOUS_SLUGS = ["anymall", "boshoo"];
const SK_SLUGS = ["astatoro", "2sekundovymato", "anymall", "boshoo"];

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

describe("CZ/SK rozšíření creatorů (HouseBox + slovenští tvůrci)", () => {
  test("noví ověření tvůrci (HouseBox, astatoro, 2sekundovymato) existují pod očekávanými slugy", () => {
    for (const slug of CZSK_EXPANSION_VERIFIED_SLUGS) {
      assert.ok(getCreatorProfile(slug), `chybí nový profil ${slug}`);
    }
  });

  test("noví opatrní profilé (anymall, boshoo) existují pod očekávanými slugy", () => {
    for (const slug of CZSK_EXPANSION_CAUTIOUS_SLUGS) {
      assert.ok(getCreatorProfile(slug), `chybí nový profil ${slug}`);
    }
  });

  test("boshoo NENÍ vytvořen pod odhadovaným casingem/spellingem (bosho, boshooo)", () => {
    assert.equal(getCreatorProfile("bosho"), undefined);
    assert.equal(getCreatorProfile("boshooo"), undefined);
    assert.ok(getCreatorProfile("boshoo"));
  });

  test("touken NEMÁ vlastní indexovatelnou stránku (chybí ověřený důkaz)", () => {
    assert.equal(getCreatorProfile("touken"), undefined);
  });

  test("HouseBox má přesně 1 video v creator.videos (carousel highlight) — zbylá 2 jsou v data/how-to-fish-videos.ts", () => {
    const housebox = getCreatorProfile("housebox");
    assert.equal(housebox?.videos.length, 1);
    assert.equal(housebox?.videos[0]?.youtubeId, "aW5dkh1j_WM");
  });

  test("astatoro/2sekundovymato NEMAJÍ vymyšlený youtubeId ani konkrétní klip URL v carousel datech", () => {
    for (const slug of ["astatoro", "2sekundovymato"]) {
      const profile = getCreatorProfile(slug);
      assert.equal(profile?.videos[0]?.youtubeId, undefined);
      assert.ok(profile?.videos[0]?.url.startsWith("https://kick.com/"));
    }
  });

  test("anymall/boshoo mají prázdné videos a jen externalLink na skutečný Kick profil", () => {
    for (const slug of ["anymall", "boshoo"]) {
      const profile = getCreatorProfile(slug);
      assert.equal(profile?.videos.length, 0);
      assert.equal(profile?.externalLink?.href, `https://kick.com/${slug}`);
    }
  });

  test("country je CZ nebo SK pro každý profil, slovenští tvůrci mají SK", () => {
    for (const profile of creatorProfiles) {
      assert.ok(profile.country === "CZ" || profile.country === "SK", `${profile.slug}: neplatný country`);
    }
    for (const slug of SK_SLUGS) {
      assert.equal(getCreatorProfile(slug)?.country, "SK", `${slug} by měl mít country SK`);
    }
  });

  test("žádný nový profil netvrdí konkrétní viewer statistiky (peak/average/hodiny streamu)", () => {
    for (const slug of [...CZSK_EXPANSION_VERIFIED_SLUGS, ...CZSK_EXPANSION_CAUTIOUS_SLUGS]) {
      const text = getCreatorProfile(slug)?.bio ?? "";
      assert.doesNotMatch(text, /\d+[\s,.]?\d*\s*(peak|average|zhlédnutí|views|subscribers|h \d)/i);
    }
  });

  test("intro texty nových tvůrců nejsou identická věta s vyměněným jménem", () => {
    const texts = [...CZSK_EXPANSION_VERIFIED_SLUGS, ...CZSK_EXPANSION_CAUTIOUS_SLUGS]
      .map((slug) => getCreatorProfile(slug)?.bio)
      .filter((bio): bio is string => Boolean(bio));
    assert.equal(new Set(texts).size, texts.length, "dva noví tvůrci mají doslova stejný bio text");
  });
});

describe("PixelorezLIVE (nový CZ Twitch tvůrce)", () => {
  const pixelorez = getCreatorProfile("pixelorezlive");

  test("profil existuje pod očekávaným slugem", () => {
    assert.ok(pixelorez, "chybí profil pixelorezlive");
  });

  test("country CZ, platforma Twitch přes externalLink na skutečný profil", () => {
    assert.equal(pixelorez?.country, "CZ");
    assert.equal(pixelorez?.externalLink?.href, "https://www.twitch.tv/pixelorezlive");
    assert.equal(pixelorez?.externalLink?.label, "Otevřít Twitch profil");
  });

  test("nemá žádné vymyšlené video záznamy (žádný ověřený VOD)", () => {
    assert.equal(pixelorez?.videos.length, 0);
  });

  test("bio netvrdí pravidelnost, aktuální live stav ani konkrétní statistiky", () => {
    const bio = pixelorez?.bio ?? "";
    assert.doesNotMatch(bio.toLowerCase(), /pravidelně|právě (live|hraje)|teď hraje/);
    assert.doesNotMatch(bio, /\d+[\s,.]?\d*\s*(peak|average|zhlédnutí|views|followers?|sledujících)/i);
  });

  test("seoTitle/seoDescription jsou nastavené a odlišné od generické šablony ostatních tvůrců bez videa", () => {
    assert.equal(pixelorez?.seoTitle, "PixelorezLIVE hraje How to Fish");
    assert.equal(
      pixelorez?.seoDescription,
      "PixelorezLIVE patří mezi české Twitch tvůrce, kteří streamovali How to Fish. Podívej se na jeho profil a další CZ/SK tvůrce hry."
    );
  });

  test("slug je přesně 'pixelorezlive', ne odhadovaný casing/spelling", () => {
    assert.equal(getCreatorProfile("pixelorezLIVE"), undefined);
    assert.equal(getCreatorProfile("pixelorez"), undefined);
  });
});
