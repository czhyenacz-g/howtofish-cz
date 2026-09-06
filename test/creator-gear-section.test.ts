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

  test("badge label/tooltip jde přes centrální lib/creators/gear-confidence.ts, ne natvrdo v komponentě", () => {
    assert.match(source, /getGearConfidenceLabel/);
    assert.match(source, /getGearConfidenceTooltip/);
    assert.doesNotMatch(source, />\s*historické\s*</i);
  });

  test("formulace u historical je 'dříve používal/a', nikdy 'používá'", () => {
    assert.match(source, /dříve používal\/a/);
  });

  test("estimated položka má viditelný ' — odhad' přímo u názvu (hard rule, zadání bod 3)", () => {
    assert.match(source, /— odhad/);
  });

  test("estimated má vlastní disclaimer větu 'Možná alternativa'", () => {
    assert.match(source, /Možná alternativa/);
  });

  test("estimated NIKDY nerenderuje source link (zadání bod 26)", () => {
    assert.match(source, /!isEstimated && item\.sourceUrl/);
  });

  test("čistě odhadovaný profil dostane heading 'Jakou techniku může {jméno} používat?' (hard rule, zadání bod 22)", () => {
    assert.match(source, /Jakou techniku může \$\{creatorName\} používat\?/);
  });

  test("profil s doloženým gearem dostane heading 'Setup a technika'", () => {
    assert.match(source, /Setup a technika/);
  });

  test("mix confidence: verified/historical se řadí před estimated (zadání bod 23)", () => {
    assert.match(source, /CONFIDENCE_ORDER/);
    assert.match(source, /verified:\s*0/);
    assert.match(source, /historical:\s*1/);
    assert.match(source, /estimated:\s*2/);
  });

  test("odhady jsou vizuálně oddělené pod 'Možné alternativy', jen když jsou zamíchané s doloženými", () => {
    assert.match(source, /Možné alternativy/);
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

  test("badge má i ikonu, ne jen text/barvu (zadání bod 4)", () => {
    assert.match(source, /CONFIDENCE_ICON/);
    assert.match(source, /CheckIcon/);
    assert.match(source, /ClockIcon/);
  });

  test("responzivní grid bez fixních šířek — karty nesmí přetékat na mobilu (zadání bod 27)", () => {
    assert.match(source, /grid gap-4 sm:grid-cols-2/);
    assert.doesNotMatch(source, /w-\[\d+px\]/);
  });

  test("CTA má dostatečnou výšku pro tapnutí na mobilu (min-h)", () => {
    const cta = readSource("../app/components/GearAffiliateCta.tsx");
    assert.match(cta, /min-h-\[36px\]/);
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

  test("CTA text je 'Najít na Allegro' nebo 'Zobrazit nabídku' (konzistentní copy, zadání bod 25)", () => {
    assert.match(source, /getGearCtaLabel/);
  });

  test("loguje gear_affiliate_click při kliknutí", () => {
    assert.match(source, /gear_affiliate_click/);
  });

  test("href se počítá přes centrální getGearAffiliateLink (ne duplicitní logika)", () => {
    assert.match(source, /getGearAffiliateLink/);
  });
});
