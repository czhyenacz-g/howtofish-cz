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

describe("druhá vlna nových CZ tvůrců (2026-09-09): dzeryyy21, kingosfn, Malej_Erik, POtkanzoR, xdamkiraly, dajinka, Goldyjede", () => {
  const NEW_SLUGS = ["dzeryyy21", "kingosfn", "malej_erik", "potkanzor", "xdamkiraly", "dajinka", "goldyjede"];

  test("všech 7 nových profilů existuje pod očekávanými slugy", () => {
    for (const slug of NEW_SLUGS) {
      assert.ok(getCreatorProfile(slug), `chybí profil ${slug}`);
    }
  });

  test("žádný duplicitní profil pod jiným casingem/aliasem (Malej_erik/malej-erik, Potkanzor/POTKANZOR, Goldyjede/GoldyJede)", () => {
    for (const bad of ["Malej_erik", "malej-erik", "MalejErik", "Potkanzor", "POTKANZOR", "GoldyJede", "GOLDYJEDE", "goldyjede21"]) {
      assert.equal(getCreatorProfile(bad), undefined, `neočekávaný duplicitní slug "${bad}"`);
    }
    // Přesně 7 nových slugů, žádný navíc kvůli náhodné duplicitě.
    const slugs = creatorProfiles.map((c) => c.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  test("všech 7 je country CZ", () => {
    for (const slug of NEW_SLUGS) {
      assert.equal(getCreatorProfile(slug)?.country, "CZ", `${slug} by měl mít country CZ`);
    }
  });

  test("zobrazované jméno zachovává stylizovaný casing (POtkanzoR, Malej_Erik, Goldyjede), slug je normalizovaný", () => {
    assert.equal(getCreatorProfile("potkanzor")?.name, "POtkanzoR");
    assert.equal(getCreatorProfile("malej_erik")?.name, "Malej_Erik");
    assert.equal(getCreatorProfile("goldyjede")?.name, "Goldyjede");
  });

  test("dzeryyy21 je jediný z nové vlny s videos.length > 0 (carousel-eligible, viz creator-videos.ts)", () => {
    assert.ok((getCreatorProfile("dzeryyy21")?.videos.length ?? 0) > 0);
    for (const slug of NEW_SLUGS.filter((s) => s !== "dzeryyy21")) {
      assert.equal(getCreatorProfile(slug)?.videos.length, 0, `${slug} by neměl mít žádné video (žádný ověřený VOD)`);
    }
  });

  test("dzeryyy21 bio zmiňuje kingosfn, datum a kategorii, ale ŽÁDNÉ viewer statistiky (zadání bod 23)", () => {
    const bio = getCreatorProfile("dzeryyy21")?.bio ?? "";
    assert.match(bio, /kingosfn/);
    assert.match(bio, /2\. 9\. 2026/);
    assert.doesNotMatch(bio, /\d+[\s,.]?\d*\s*(peak|average|zhlédnutí|views|followers?|sledujících)/i);
  });

  test("kingosfn bio říká 'zahrál si společně s', NIKDY 'streamoval How to Fish' (zadání bod 7 — nemá vlastní ověřený stream)", () => {
    const bio = getCreatorProfile("kingosfn")?.bio ?? "";
    assert.match(bio, /zahrál.*společně s dzeryyy21/);
    assert.doesNotMatch(bio, /kingosfn streamoval/i);
  });

  test("kingosfn -> dzeryyy21 vazba existuje obousměrně (relatedCreatorSlug + mentionedBy na dzeryyy21 stránce)", () => {
    assert.equal(getCreatorProfile("kingosfn")?.relatedCreatorSlug, "dzeryyy21");
    const mentionedBy = creatorProfiles.filter((c) => c.relatedCreatorSlug === "dzeryyy21");
    assert.ok(mentionedBy.some((c) => c.slug === "kingosfn"));
  });

  test("jen dzeryyy21 má streamerSetupSlug (jediný se smysluplným obsahem/gearem na StreamerSetup.cz, zadání bod 21/22)", () => {
    assert.equal(getCreatorProfile("dzeryyy21")?.streamerSetupSlug, "dzeryyy21");
    for (const slug of NEW_SLUGS.filter((s) => s !== "dzeryyy21")) {
      assert.equal(getCreatorProfile(slug)?.streamerSetupSlug, undefined, `${slug} by neměl mít streamerSetupSlug (žádný gear na StreamerSetup.cz)`);
    }
  });

  test("Malej_Erik/POtkanzoR/Goldyjede bio zmiňuje konkrétní stream titulek(y) a datum, ne obecnou frázi", () => {
    assert.match(getCreatorProfile("malej_erik")?.bio ?? "", /UČÍM SE RYBAŘIT/);
    assert.match(getCreatorProfile("potkanzor")?.bio ?? "", /Rybaříme s homies/);
    const goldyjedeBio = getCreatorProfile("goldyjede")?.bio ?? "";
    assert.match(goldyjedeBio, /HOW TO FISH/);
    assert.match(goldyjedeBio, /JDEME LOVIT RYBY/);
  });

  test("xdamkiraly/dajinka mají opatrnější (obecnější) formulaci — žádný konkrétní stream titulek k dispozici", () => {
    assert.doesNotMatch(getCreatorProfile("xdamkiraly")?.bio ?? "", /„.+“/);
    assert.doesNotMatch(getCreatorProfile("dajinka")?.bio ?? "", /„.+“/);
  });

  test("žádný z nových profilů netvrdí konkrétní viewer/follower statistiky v bio", () => {
    for (const slug of NEW_SLUGS) {
      const bio = getCreatorProfile(slug)?.bio ?? "";
      assert.doesNotMatch(bio, /\d+[\s,.]?\d*\s*(peak|average|zhlédnutí|views|followers?|sledujících|tisíc)/i);
    }
  });

  test("externalLink (Kick/Twitch) směřuje na skutečný handle uvedený v zadání, žádná vymyšlená URL", () => {
    assert.equal(getCreatorProfile("kingosfn")?.externalLink?.href, "https://kick.com/kingosfn");
    assert.equal(getCreatorProfile("malej_erik")?.externalLink?.href, "https://www.twitch.tv/malej_erik");
    assert.equal(getCreatorProfile("potkanzor")?.externalLink?.href, "https://www.twitch.tv/potkanzor");
    assert.equal(getCreatorProfile("xdamkiraly")?.externalLink?.href, "https://kick.com/xdamkiraly");
    assert.equal(getCreatorProfile("dajinka")?.externalLink?.href, "https://kick.com/dajinka");
    assert.equal(getCreatorProfile("goldyjede")?.externalLink?.href, "https://www.twitch.tv/goldyjede");
  });

  test("intro texty nejsou identická věta s vyměněným jménem (individuální fakta pro každého)", () => {
    const texts = NEW_SLUGS.map((slug) => getCreatorProfile(slug)?.bio).filter((bio): bio is string => Boolean(bio));
    assert.equal(new Set(texts).size, texts.length, "dva noví tvůrci mají doslova stejný bio text");
  });
});

describe("třetí vlna nových CZ tvůrců (2026-09-13): katulinkaaa, oskartommy, Nedric_, luckycharlie23", () => {
  const NEW_SLUGS = ["katulinkaaa", "oskartommy", "nedric_", "luckycharlie23"];

  test("všechny 4 profily existují pod očekávanými slugy", () => {
    for (const slug of NEW_SLUGS) {
      assert.ok(getCreatorProfile(slug), `chybí profil ${slug}`);
    }
  });

  test("žádný duplicitní profil pod jiným casingem/spellingem", () => {
    for (const bad of ["Katulinkaaa", "oskarTommy", "oskar-tommy", "nedric", "Nedric", "LuckyCharlie23"]) {
      assert.equal(getCreatorProfile(bad), undefined, `neočekávaný duplicitní slug "${bad}"`);
    }
    const slugs = creatorProfiles.map((c) => c.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  test("všichni 4 jsou country CZ", () => {
    for (const slug of NEW_SLUGS) {
      assert.equal(getCreatorProfile(slug)?.country, "CZ");
    }
  });

  test("Nedric_ zachovává koncové podtržítko ve slugu i jméně (skutečný Twitch handle)", () => {
    assert.equal(getCreatorProfile("nedric_")?.name, "Nedric_");
    assert.equal(getCreatorProfile("nedric"), undefined);
  });

  test("žádný z nových profilů nemá vymyšlené video záznamy (žádný ověřený VOD/YouTube ID)", () => {
    for (const slug of NEW_SLUGS) {
      assert.equal(getCreatorProfile(slug)?.videos.length, 0, `${slug} by neměl mít žádné video`);
    }
  });

  test("externalLink směřuje na skutečný handle, platforma odpovídá zadání (Twitch/Twitch/Twitch/Kick)", () => {
    assert.equal(getCreatorProfile("katulinkaaa")?.externalLink?.href, "https://www.twitch.tv/katulinkaaa");
    assert.equal(getCreatorProfile("nedric_")?.externalLink?.href, "https://www.twitch.tv/nedric_");
    assert.equal(getCreatorProfile("luckycharlie23")?.externalLink?.href, "https://www.twitch.tv/luckycharlie23");
    assert.equal(getCreatorProfile("oskartommy")?.externalLink?.href, "https://kick.com/oskartommy");
    assert.equal(getCreatorProfile("oskartommy")?.externalLink?.label, "Profil na Kicku");
  });

  test("žádný z nových profilů netvrdí konkrétní viewer/peak/average statistiky v bio", () => {
    for (const slug of NEW_SLUGS) {
      const bio = getCreatorProfile(slug)?.bio ?? "";
      assert.doesNotMatch(bio, /\d+[\s,.]?\d*\s*(peak|average|zhlédnutí|views|followers?|sledujících|tisíc)/i);
    }
  });

  test("žádný z nových profilů nemá streamerSetupSlug (žádný ověřený gear na StreamerSetup.cz)", () => {
    for (const slug of NEW_SLUGS) {
      assert.equal(getCreatorProfile(slug)?.streamerSetupSlug, undefined, `${slug} by neměl mít streamerSetupSlug`);
    }
  });

  test("intro texty nejsou identická věta s vyměněným jménem", () => {
    const texts = NEW_SLUGS.map((slug) => getCreatorProfile(slug)?.bio).filter((bio): bio is string => Boolean(bio));
    assert.equal(new Set(texts).size, texts.length, "dva noví tvůrci mají doslova stejný bio text");
  });

  test("seoTitle je nastavený a odlišný od generické šablony pro každého", () => {
    assert.equal(getCreatorProfile("katulinkaaa")?.seoTitle, "katulinkaaa hraje How to Fish");
    assert.equal(getCreatorProfile("oskartommy")?.seoTitle, "oskartommy hraje How to Fish");
    assert.equal(getCreatorProfile("nedric_")?.seoTitle, "Nedric_ hraje How to Fish");
    assert.equal(getCreatorProfile("luckycharlie23")?.seoTitle, "luckycharlie23 hraje How to Fish");
  });
});

describe("čtvrtá vlna nových CZ tvůrců (2026-09-16): Trychta, Cre_ator, Strelec07", () => {
  const NEW_SLUGS = ["trychta", "cre_ator", "strelec07"];

  test("všichni 3 existují pod očekávanými slugy", () => {
    for (const slug of NEW_SLUGS) {
      assert.ok(getCreatorProfile(slug), `chybí profil ${slug}`);
    }
  });

  test("žádný duplicitní profil pod jiným casingem/aliasem (Cre_ator/creator/cre-ator, Strelec-07)", () => {
    for (const bad of ["Cre_ator", "CRE_ATOR", "cre-ator", "creator", "Creator", "Trychta", "strelec-07", "Strelec_07", "Strelec07"]) {
      assert.equal(getCreatorProfile(bad), undefined, `neočekávaný duplicitní slug "${bad}"`);
    }
    const slugs = creatorProfiles.map((c) => c.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  test("zobrazované jméno zachovává reálný handle (Cre_ator s podtržítkem), slug je lowercase", () => {
    assert.equal(getCreatorProfile("cre_ator")?.name, "Cre_ator");
    assert.equal(getCreatorProfile("trychta")?.name, "Trychta");
    assert.equal(getCreatorProfile("strelec07")?.name, "Strelec07");
  });

  test("všichni 3 jsou country CZ", () => {
    for (const slug of NEW_SLUGS) {
      assert.equal(getCreatorProfile(slug)?.country, "CZ", `${slug} by měl mít country CZ`);
    }
  });

  test("externalLink směřuje na skutečný profil (Twitch/Kick), žádná vymyšlená URL", () => {
    assert.equal(getCreatorProfile("trychta")?.externalLink?.href, "https://www.twitch.tv/trychta");
    assert.equal(getCreatorProfile("cre_ator")?.externalLink?.href, "https://kick.com/cre_ator");
    assert.equal(getCreatorProfile("strelec07")?.externalLink?.href, "https://kick.com/strelec07");
  });

  test("platforma se odvodí z externalLink (trychta = twitch, cre_ator/strelec07 = kick)", () => {
    assert.equal(getCreatorProfile("trychta")?.externalLink?.href.includes("twitch.tv"), true);
    assert.equal(getCreatorProfile("cre_ator")?.externalLink?.href.startsWith("https://kick.com/"), true);
    assert.equal(getCreatorProfile("strelec07")?.externalLink?.href.startsWith("https://kick.com/"), true);
  });

  test("nikdo z nových nemá vymyšlené video (žádný ověřený VOD) ani streamerSetupSlug bez profilu", () => {
    for (const slug of NEW_SLUGS) {
      assert.equal(getCreatorProfile(slug)?.videos.length, 0, `${slug} by neměl mít vymyšlené video`);
      assert.equal(getCreatorProfile(slug)?.streamerSetupSlug, slug, `${slug}: streamerSetupSlug by měl odpovídat vlastnímu slugu`);
    }
  });

  test("seoTitle/seoDescription jsou nastavené a bez follower/viewer statistik v bio", () => {
    for (const slug of NEW_SLUGS) {
      assert.ok(getCreatorProfile(slug)?.seoTitle, `${slug} nemá seoTitle`);
      assert.ok(getCreatorProfile(slug)?.seoDescription, `${slug} nemá seoDescription`);
      const bio = getCreatorProfile(slug)?.bio ?? "";
      assert.doesNotMatch(bio, /\d+[\s,.]?\d*\s*(peak|average|zhlédnutí|views|followers?|sledujících|tisíc)/i);
    }
  });

  test("Trychta bio zmiňuje opakovaný návrat v září 2026, ne statistiky", () => {
    const bio = getCreatorProfile("trychta")?.bio ?? "";
    assert.match(bio, /září 2026/);
    assert.match(bio, /opakovaně/);
  });

  test("Cre_ator bio zmiňuje speedrun a NETVRDÍ rekord/personal best", () => {
    const bio = getCreatorProfile("cre_ator")?.bio ?? "";
    assert.match(bio, /speedrun/);
    assert.doesNotMatch(bio, /(světový|český)\s+rekord|personal best|osobní rekord/i);
  });

  test("Strelec07 NEUVÁDÍ konkrétní model webkamery (žádné vymyšlené vybavení)", () => {
    const bio = getCreatorProfile("strelec07")?.bio ?? "";
    assert.doesNotMatch(bio, /logitech|elgato|razer kiyo|c920|facecam/i);
  });

  test("intro texty nových tvůrců nejsou identická věta s vyměněným jménem", () => {
    const texts = NEW_SLUGS.map((slug) => getCreatorProfile(slug)?.bio).filter((bio): bio is string => Boolean(bio));
    assert.equal(new Set(texts).size, texts.length, "dva noví tvůrci mají doslova stejný bio text");
  });

  test("H1 override ('X a How to Fish') je nastavený pro každého", () => {
    assert.equal(getCreatorProfile("trychta")?.heading, "Trychta a How to Fish");
    assert.equal(getCreatorProfile("cre_ator")?.heading, "Cre_ator a How to Fish");
    assert.equal(getCreatorProfile("strelec07")?.heading, "Strelec07 a How to Fish");
  });
});

describe("pátá vlna nových CZ/SK tvůrců (2026-09-19): Brejla, tada2015AA, Krteuk, Pivko6654, Skiller_cz22, Bobarix", () => {
  const NEW_SLUGS = ["brejla", "tada2015aa", "krteuk", "pivko6654", "skiller_cz22", "bobarix"];

  test("všech 6 existuje pod očekávanými slugy", () => {
    for (const slug of NEW_SLUGS) {
      assert.ok(getCreatorProfile(slug), `chybí profil ${slug}`);
    }
  });

  test("žádný duplicitní profil pod jiným casingem/aliasem", () => {
    for (const bad of ["Brejla", "tada2015AA", "TADA2015AA", "Krteuk", "PIVKO6654", "Skiller_cz22", "SkillerCZ22", "skiller-cz22", "Bobarix"]) {
      assert.equal(getCreatorProfile(bad), undefined, `neočekávaný duplicitní slug "${bad}"`);
    }
    const slugs = creatorProfiles.map((c) => c.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  test("country CZ/SK dle ověření (Pivko6654 = SK, ostatní CZ)", () => {
    for (const slug of NEW_SLUGS) {
      const expected = slug === "pivko6654" ? "SK" : "CZ";
      assert.equal(getCreatorProfile(slug)?.country, expected, `${slug}: country`);
    }
  });

  test("zobrazované jméno zachovává reálný casing (tada2015AA, Skiller_cz22), slug je lowercase", () => {
    assert.equal(getCreatorProfile("tada2015aa")?.name, "tada2015AA");
    assert.equal(getCreatorProfile("skiller_cz22")?.name, "Skiller_cz22");
    assert.equal(getCreatorProfile("brejla")?.name, "Brejla");
  });

  test("externalLink míří na ověřený profil, vč. reálného Kick handlu u Skillera (pomlčka)", () => {
    assert.equal(getCreatorProfile("brejla")?.externalLink?.href, "https://kick.com/brejla");
    assert.equal(getCreatorProfile("tada2015aa")?.externalLink?.href, "https://kick.com/tada2015aa");
    assert.equal(getCreatorProfile("krteuk")?.externalLink?.href, "https://kick.com/krteuk");
    assert.equal(getCreatorProfile("pivko6654")?.externalLink?.href, "https://www.twitch.tv/pivko6654");
    assert.equal(getCreatorProfile("skiller_cz22")?.externalLink?.href, "https://kick.com/skiller-cz22");
    assert.equal(getCreatorProfile("bobarix")?.externalLink?.href, "https://kick.com/bobarix");
  });

  test("nikdo nemá vymyšlené video (žádný ověřený VOD)", () => {
    for (const slug of NEW_SLUGS) {
      assert.equal(getCreatorProfile(slug)?.videos.length, 0, `${slug} by neměl mít vymyšlené video`);
    }
  });

  test("všichni mají streamerSetupSlug (profil existuje i na StreamerSetup.cz)", () => {
    for (const slug of NEW_SLUGS) {
      assert.equal(getCreatorProfile(slug)?.streamerSetupSlug, slug, `${slug}: streamerSetupSlug`);
    }
  });

  test("H1 heading override je nastavený pro každého", () => {
    for (const slug of NEW_SLUGS) {
      assert.match(getCreatorProfile(slug)?.heading ?? "", /How to Fish/, `${slug}: heading`);
    }
  });

  test("bio ani meta description neobsahují follower/viewer statistiky", () => {
    for (const slug of NEW_SLUGS) {
      const profile = getCreatorProfile(slug);
      const text = `${profile?.bio ?? ""} ${profile?.seoDescription ?? ""}`;
      assert.doesNotMatch(text, /\d+[\s,.]?\d*\s*(peak|average|zhlédnutí|views|followers?|sledujících|tisíc)/i);
    }
  });

  test("bio hlavních tvůrců zmiňuje konkrétní ověřený fakt, ne obecnou frázi", () => {
    assert.match(getCreatorProfile("brejla")?.bio ?? "", /jedné hodiny/);
    assert.match(getCreatorProfile("tada2015aa")?.bio ?? "", /rybareni/);
    assert.match(getCreatorProfile("krteuk")?.bio ?? "", /Jirkou/);
    assert.match(getCreatorProfile("pivko6654")?.bio ?? "", /slovenský/);
  });
});

describe("šestá vlna nových CZ tvůrců (2026-09-21): Klukbezkacek, Tomasekqw, Miwaldo, ThatVace, Kubex_27, Mlynek1", () => {
  const NEW_SLUGS = ["klukbezkacek", "tomasekqw", "miwaldo", "thatvace", "kubex_27", "mlynek1"];

  test("všech 6 existuje pod očekávanými slugy", () => {
    for (const slug of NEW_SLUGS) {
      assert.ok(getCreatorProfile(slug), `chybí profil ${slug}`);
    }
  });

  test("žádný duplicitní profil pod jiným casingem/aliasem (Kubex_27 vs kubex-27)", () => {
    for (const bad of ["Klukbezkacek", "Tomasekqw", "Miwaldo", "ThatVace", "Kubex_27", "kubex-27", "Kubex27", "Mlynek1"]) {
      assert.equal(getCreatorProfile(bad), undefined, `neočekávaný duplicitní slug "${bad}"`);
    }
    const slugs = creatorProfiles.map((c) => c.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  test("všichni jsou country CZ", () => {
    for (const slug of NEW_SLUGS) {
      assert.equal(getCreatorProfile(slug)?.country, "CZ", `${slug}: country`);
    }
  });

  test("externalLink míří na ověřený profil (Kick/Twitch), vč. Kubex_27 s podtržítkem", () => {
    assert.equal(getCreatorProfile("klukbezkacek")?.externalLink?.href, "https://kick.com/klukbezkacek");
    assert.equal(getCreatorProfile("tomasekqw")?.externalLink?.href, "https://kick.com/tomasekqw");
    assert.equal(getCreatorProfile("miwaldo")?.externalLink?.href, "https://kick.com/miwaldo");
    assert.equal(getCreatorProfile("thatvace")?.externalLink?.href, "https://kick.com/thatvace");
    assert.equal(getCreatorProfile("kubex_27")?.externalLink?.href, "https://www.twitch.tv/kubex_27");
    assert.equal(getCreatorProfile("mlynek1")?.externalLink?.href, "https://www.twitch.tv/mlynek1");
  });

  test("nikdo nemá vymyšlené video a všichni mají streamerSetupSlug", () => {
    for (const slug of NEW_SLUGS) {
      assert.equal(getCreatorProfile(slug)?.videos.length, 0);
      assert.equal(getCreatorProfile(slug)?.streamerSetupSlug, slug);
    }
  });

  test("bio i meta jsou unikátní a obsahují konkrétní fakt (ne jen vyměněné jméno)", () => {
    const bios = NEW_SLUGS.map((s) => getCreatorProfile(s)?.bio).filter((b): b is string => Boolean(b));
    assert.equal(new Set(bios).size, bios.length);
    assert.match(getCreatorProfile("tomasekqw")?.bio ?? "", /rybaření/);
    assert.match(getCreatorProfile("miwaldo")?.bio ?? "", /CS2/);
    assert.match(getCreatorProfile("thatvace")?.bio ?? "", /opakovaně/);
    assert.match(getCreatorProfile("kubex_27")?.bio ?? "", /speedrun/);
    assert.match(getCreatorProfile("mlynek1")?.bio ?? "", /novější/);
  });

  test("H1 heading override + žádné follower/viewer statistiky", () => {
    for (const slug of NEW_SLUGS) {
      const profile = getCreatorProfile(slug);
      assert.match(profile?.heading ?? "", /How to Fish/);
      const text = `${profile?.bio ?? ""} ${profile?.seoDescription ?? ""}`;
      assert.doesNotMatch(text, /\d+[\s,.]?\d*\s*(peak|average|zhlédnutí|views|followers?|sledujících|tisíc)/i);
    }
  });

  test("Kubex_27 bio netvrdí vítězství/rekord v speedrunu", () => {
    const bio = getCreatorProfile("kubex_27")?.bio ?? "";
    assert.match(bio, /speedrun/);
    assert.doesNotMatch(bio, /vyhrál|rekord|světový|oficiální/i);
  });
});
