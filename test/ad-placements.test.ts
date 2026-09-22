import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Kontrola, že každá hlavní veřejná stránka má reklamní slot a že
// placeholder cover zůstává bezpečný (žádné cizí artworky).

function readSource(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const PAGES: { path: string; label: string }[] = [
  { path: "../app/page.tsx", label: "homepage" },
  { path: "../app/(sections)/hry-s-rybarenim/page.tsx", label: "/hry-s-rybarenim" },
  { path: "../app/(sections)/games/[slug]/page.tsx", label: "/games/[slug]" },
  { path: "../app/streameri/page.tsx", label: "/streameri" },
  { path: "../app/(sections)/o-hre/page.tsx", label: "/o-hre" },
  { path: "../app/hra/page.tsx", label: "/hra" },
  { path: "../app/(sections)/multiplayer/page.tsx", label: "/multiplayer" },
];

describe("reklamní sloty na hlavních stránkách", () => {
  for (const { path, label } of PAGES) {
    test(`${label} má aspoň jeden AdSlot`, () => {
      const source = readSource(path);
      assert.match(source, /import AdSlot from /, `${label}: chybí import AdSlot`);
      assert.match(source, /<AdSlot pathname=/, `${label}: chybí <AdSlot pathname=...>`);
    });
  }

  test("/stream má banner přes StreamBrowser (stávající mechanismus)", () => {
    const source = readSource("../app/stream/StreamBrowser.tsx");
    assert.match(source, /AffiliateBannerSlot/);
  });

  test("AdSlot je fail-soft — výpadek promotions vrací prázdno, ne pád", () => {
    const source = readSource("../app/components/AdSlot.tsx");
    assert.match(source, /getActivePromotions\("banner"\)\.catch\(\(\) => \[\]\)/);
    assert.match(source, /pickPromotion\(candidates, pathname\)/);
  });

  test("kontext banneru se předává jako pathname (page_pattern matching)", () => {
    assert.match(readSource("../app/(sections)/games/[slug]/page.tsx"), /<AdSlot pathname=\{`\/games\/\$\{game\.slug\}`\}/);
    assert.match(readSource("../app/(sections)/o-hre/page.tsx"), /<AdSlot pathname="\/o-hre"/);
    assert.match(readSource("../app/(sections)/multiplayer/page.tsx"), /<AdSlot pathname="\/multiplayer"/);
  });

  test("bez promotion se vykreslí bezpečný placeholder, ne rozbitý layout", () => {
    const slot = readSource("../app/components/AffiliateBannerSlot.tsx");
    assert.match(slot, /placeholderOnEmpty \? <AdPlaceholder \/> : null/);
    assert.match(slot, /if \(!promotion \|\| !promotion\.imageUrl\)/);
    assert.match(readSource("../app/components/AdPlaceholder.tsx"), /aspect-\[4\/1\]/);
  });
});

describe("cover placeholder zůstává bez licenčního rizika", () => {
  const source = readSource("../app/components/GameCover.tsx");

  test("nepoužívá žádné externí obrázky (jen lokální asset z dat)", () => {
    assert.doesNotMatch(source, /https?:\/\//);
    assert.doesNotMatch(source, /steamcdn|wikimedia|cloudflare\.steamstatic|igdb\.com/i);
  });

  test("placeholder má vlastní dekorativní vrstvy a iniciálu hry", () => {
    assert.match(source, /role="img"/);
    assert.match(source, /COVER_PALETTES/);
    assert.match(source, /pattern id=/);
    assert.match(source, /const initial = name\.trim\(\)\.charAt\(0\)\.toUpperCase\(\)/);
  });

  test("když je v datech image, použije se next/image (žádný placeholder)", () => {
    assert.match(source, /if \(image\) \{[\s\S]*?<Image src=\{image\}/);
    assert.match(source, /alt=\{`\$\{name\} – rybaření ve hře`\}/);
    assert.match(source, /sizes=/);
  });
});
