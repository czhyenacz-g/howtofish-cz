import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sitemap from "../app/sitemap.ts";
import { SITE_URL } from "../app/config/site.ts";
import { COMMUNITY_CONTRIBUTIONS_ENABLED, MULTIPLAYER_ENABLED } from "../app/config/features.ts";
import {
  AFFILIATE_DISCLOSURE,
  FIRST_FISHING_DESCRIPTION,
  FIRST_FISHING_FAQ,
  FIRST_FISHING_H1,
  FIRST_FISHING_PATH,
  FIRST_FISHING_SOURCES,
  FIRST_FISHING_TITLE,
  FIRST_FISHING_UPDATED_AT,
} from "../data/first-fishing.ts";
import { DOGNET_CONFIG } from "../lib/affiliate/dognet.ts";
import { MAX_STARTER_KITS, getStarterKitAffiliateUrl, starterKits } from "../data/starter-kits.ts";
import { isPageViewRoute } from "../lib/analytics/page-view-routes.ts";
import {
  REAL_FISHING_PROMO_COPY,
  REAL_FISHING_PROMO_EXCLUDED_PATHS,
  REAL_FISHING_PROMO_HREF,
} from "../app/components/real-fishing-promo.ts";

const APP_DIR = fileURLToPath(new URL("../app", import.meta.url));
const read = (rel: string) => readFileSync(join(APP_DIR, rel), "utf8");
const PAGE = "(sections)/prvni-rybareni/page.tsx";

function listTsx(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return listTsx(full);
    return full.endsWith(".tsx") ? [full] : [];
  });
}

describe("/prvni-rybareni — metadata a SEO", () => {
  const source = read(PAGE);

  test("title, H1 a description přesně podle zadání", () => {
    assert.equal(FIRST_FISHING_TITLE, "Jak začít rybařit? První výbava, povolenka a rybářský set | HowToFish.cz");
    assert.equal(FIRST_FISHING_H1, "První rybaření: Co potřebuješ a jak začít?");
    assert.equal(
      FIRST_FISHING_DESCRIPTION,
      "Chceš poprvé na ryby? Zjisti, co potřebuješ, jak funguje rybářský lístek a povolenka a jak vybrat první rybářský set pro začátečníka."
    );
    assert.match(source, /title: \{ absolute: FIRST_FISHING_TITLE \}/);
    assert.match(source, /description: FIRST_FISHING_DESCRIPTION/);
    assert.match(source, /<h1[^>]*>\{FIRST_FISHING_H1\}<\/h1>/);
  });

  test("canonical je /prvni-rybareni (absolutní díky metadataBase) a stránka nemá noindex", () => {
    assert.equal(FIRST_FISHING_PATH, "/prvni-rybareni");
    assert.match(source, /alternates: \{ canonical: FIRST_FISHING_PATH \}/);
    assert.doesNotMatch(source, /index:\s*false/);
  });

  test("sitemap obsahuje stránku s ručním datem změny, ne časem buildu", () => {
    const entry = sitemap().find((e) => e.url === `${SITE_URL}/prvni-rybareni`);
    assert.ok(entry, "chybí v sitemap");
    assert.equal(new Date(entry.lastModified!).toISOString().slice(0, 10), FIRST_FISHING_UPDATED_AT);
    assert.match(FIRST_FISHING_UPDATED_AT, /^\d{4}-\d{2}-\d{2}$/);
  });

  test("obsahuje všech 10 sekcí ze zadání", () => {
    for (const id of ["jak-zacit", "rybarsky-listek", "povolenka", "bez-listku", "zpusob-lovu", "vybaveni", "startovaci-set", "dokoupit", "chovani", "faq"]) {
      assert.match(source, new RegExp(`<Section id="${id}"`), id);
    }
  });

  test("právní přesnost: netvrdí, že na soukromém rybníku jde lovit vždy bez lístku a souhlasu", () => {
    assert.match(source, /souhlas provozovatele/);
    assert.match(source, /<strong className="text-white">Neplatí<\/strong>, že na každém soukromém rybníku se smí lovit bez lístku/);
  });

  test("JSON-LD: Breadcrumb, Article a FAQPage — žádný Product/Offer/Review/Rating", () => {
    assert.match(source, /"@type": "Article"/);
    assert.match(source, /"@type": "FAQPage"/);
    assert.match(source, /buildBreadcrumbJsonLd/);
    assert.doesNotMatch(source, /"@type": "(Product|Offer|Review|AggregateRating)"/);
  });

  test("FAQ a zdroje: oficiální zdroje (MZe, rybsvaz.cz) jsou uvedené", () => {
    assert.ok(FIRST_FISHING_FAQ.length >= 4);
    assert.ok(FIRST_FISHING_SOURCES.some((s) => s.url.startsWith("https://mze.gov.cz/")));
    assert.ok(FIRST_FISHING_SOURCES.some((s) => s.url.startsWith("https://www.rybsvaz.cz/")));
  });

  test("page_view se měří i pro novou stránku", () => {
    assert.equal(isPageViewRoute("/prvni-rybareni"), true);
  });
});

describe("startovací set — affiliate odkaz", () => {
  test("přesná Dognet URL ze zadání (chid zachován, d1=htf, d2=first-fishing)", () => {
    const url = getStarterKitAffiliateUrl(starterKits[0]);
    assert.equal(
      url,
      "https://go.dognet.com/?chid=rKROKhrd&d1=htf&d2=first-fishing&url=https%3A%2F%2Fwww.okfish.cz%2Ffeedrovy-set-delphin-yakuza"
    );
    const params = new URL(url).searchParams;
    assert.equal(params.get("chid"), "rKROKhrd");
    assert.equal(DOGNET_CONFIG.chid, "rKROKhrd");
    assert.equal(params.get("url"), "https://www.okfish.cz/feedrovy-set-delphin-yakuza");
  });

  test("max. 3 sety, každý s obsahem balení a omezením použití; bez ceny a skladovosti", () => {
    assert.ok(starterKits.length >= 1 && starterKits.length <= MAX_STARTER_KITS);
    for (const kit of starterKits) {
      assert.ok(kit.contents.length > 0, kit.id);
      assert.ok(kit.notSuitableFor.length > 0, kit.id);
      assert.doesNotMatch(JSON.stringify(kit), /Kč|skladem/i, kit.id);
    }
  });

  test("odkaz je označen jako sponzorovaný a otevírá se v nové kartě", () => {
    const link = read("components/StarterKitAffiliateLink.tsx");
    assert.match(link, /rel="sponsored noopener noreferrer"/);
    assert.match(link, /target="_blank"/);
    assert.match(link, /trackClientEvent\("starter_kit_affiliate_click"/);
  });

  test("stránka zobrazuje transparentní affiliate upozornění", () => {
    assert.match(AFFILIATE_DISCLOSURE, /Pokud přes ně nakoupíš, můžeme získat provizi\. Cena pro tebe se tím nemění\./);
    assert.match(read(PAGE), /\{AFFILIATE_DISCLOSURE\}/);
  });
});

describe("RealFishingPromo — interní banner", () => {
  test("vede na /prvni-rybareni s textem ze zadání a měří real_fishing_banner_click", () => {
    assert.equal(REAL_FISHING_PROMO_HREF, "/prvni-rybareni");
    assert.equal(REAL_FISHING_PROMO_COPY.title, "Rybaříš ve hrách? Zkus to i naživo.");
    assert.equal(REAL_FISHING_PROMO_COPY.text, "Zjisti, co potřebuješ k prvnímu rybaření, a vyber si základní výbavu.");
    assert.equal(REAL_FISHING_PROMO_COPY.cta, "Jak začít rybařit →");
    const link = read("components/RealFishingPromoLink.tsx");
    assert.match(link, /href=\{REAL_FISHING_PROMO_HREF\}/);
    assert.match(link, /trackClientEvent\("real_fishing_banner_click"/);
    assert.doesNotMatch(link, /sponsored|target="_blank"/);
  });

  test("je na homepage, detailu hry a pod návody How to Fish", () => {
    assert.match(read("page.tsx"), /<RealFishingPromo placement="homepage"/);
    assert.match(read("(sections)/games/[slug]/page.tsx"), /<RealFishingPromo placement="game"/);
    assert.match(read("(sections)/navody/HowToCatchGuide.tsx"), /<RealFishingPromo placement="guide"/);
  });

  test("max. jeden banner kampaně na stránku a žádný v layoutech", () => {
    for (const file of listTsx(APP_DIR)) {
      const count = (readFileSync(file, "utf8").match(/<RealFishingPromo /g) ?? []).length;
      assert.ok(count <= 1, `${file}: ${count}×`);
      if (/layout\.tsx$/.test(file)) assert.equal(count, 0, `${file}: banner nesmí být v layoutu`);
    }
  });

  test("není na /prvni-rybareni, právních stránkách ani 404", () => {
    assert.deepEqual([...REAL_FISHING_PROMO_EXCLUDED_PATHS].sort(), ["/ochrana-soukromi", "/pravni-informace", "/prvni-rybareni"]);
    for (const page of [PAGE, "(sections)/pravni-informace/page.tsx", "(sections)/ochrana-soukromi/page.tsx"]) {
      assert.doesNotMatch(read(page), /<RealFishingPromo/, page);
    }
    for (const notFound of listTsx(APP_DIR).filter((f) => /not-found\.tsx$/.test(f))) {
      assert.doesNotMatch(readFileSync(notFound, "utf8"), /<RealFishingPromo/, notFound);
    }
  });

  test("bez popupu, sticky pozice a zvuku", () => {
    const banner = read("components/RealFishingPromo.tsx");
    assert.doesNotMatch(banner, /className=\{?[`"][^`"]*\b(fixed|sticky)\b/);
    assert.doesNotMatch(banner, /<audio|role="dialog"/);
    assert.doesNotMatch(banner, /^"use client"/);
  });
});

test("režim minimální údržby: staré vypnuté funkce zůstávají vypnuté", () => {
  assert.equal(COMMUNITY_CONTRIBUTIONS_ENABLED, false);
  assert.equal(MULTIPLAYER_ENABLED, false);
  const layout = read("layout.tsx");
  assert.doesNotMatch(layout, /<CharacterCallout|<MultiplayerIslandTab|<AmbientAudioToggle/);
});
