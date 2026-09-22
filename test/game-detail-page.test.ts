import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Zdrojová kontrola .tsx souborů — stejný přístup jako
// test/hry-s-rybarenim-page.test.ts (Node test runner neumí .tsx přímo
// importovat). Samotná data a logika (kdo má detail, jaké má citáty) se
// testují v test/games-catalog.test.ts přes import data/games.ts.
function readSource(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const PAGE = "../app/(sections)/games/[slug]/page.tsx";
const STREAMERS = "../app/components/GameStreamersSection.tsx";
const VIDEOS = "../app/components/GameVideosSection.tsx";

describe("route /games/[slug]", () => {
  test("existuje jako univerzální detail hry v (sections) groupě", () => {
    assert.ok(existsSync(fileURLToPath(new URL(PAGE, import.meta.url))), "chybí page.tsx");
  });

  const source = readSource(PAGE);

  test("generuje stránky jen pro hry s vlastní /games routou a ostatní sluhy odmítá", () => {
    assert.match(source, /export const dynamicParams = false;/);
    assert.match(source, /generateStaticParams[\s\S]*?getGamesWithGameDetailPage\(\)/);
    assert.match(source, /notFound\(\)/);
    assert.match(source, /hasGameDetailPage\(game\)/);
  });

  test("canonical míří na /games/[slug]", () => {
    assert.match(source, /alternates:\s*\{\s*canonical:\s*`\/games\/\$\{game\.slug\}`\s*\}/);
  });

  test("má breadcrumb + odpovídající JSON-LD", () => {
    assert.match(source, /<Breadcrumbs items=\{breadcrumbItems\} \/>/);
    assert.match(source, /buildBreadcrumbJsonLd\(breadcrumbItems, SITE_URL, pageUrl\)/);
    assert.match(source, /label: "Hry", href: "\/hry-s-rybarenim"/);
  });

  test("má odkaz zpět na katalog", () => {
    assert.match(source, /← Všechny hry s rybařením/);
  });

  test("obsahuje všechny sekce zadání (rybaření, co hledat, další hry ze série, streamery, videa)", () => {
    assert.match(source, /Rybaření v této hře/);
    assert.match(source, /Co hledat/);
    assert.match(source, /Další hry ze série/);
    assert.match(source, /<GameStreamersSection streamers=\{streamers\} \/>/);
    assert.match(source, /<GameVideosSection videos=\{videos\} \/>/);
  });

  test("hero má cover, badge publika, důležitost rybaření, platformy a citát", () => {
    assert.match(source, /<GameCover name=\{game\.name\} slug=\{game\.slug\} image=\{game\.image\}/);
    assert.match(source, /AUDIENCE_TYPE_LABEL\[game\.audienceType\]/);
    assert.match(source, /FISHING_IMPORTANCE_LABEL\[game\.fishingImportance\]/);
    assert.match(source, /game\.platforms\.join/);
    assert.match(source, /<blockquote/);
  });

  test("metadata hry nejsou natvrdo v komponentě — čtou se z data/games.ts a data/game-details.ts", () => {
    assert.match(source, /from "\.\.\/\.\.\/\.\.\/\.\.\/data\/games\.ts"/);
    assert.match(source, /from "\.\.\/\.\.\/\.\.\/\.\.\/data\/game-details\.ts"/);
    assert.doesNotMatch(source, /Minecraft|Stardew|Pokémon|Sea of Thieves/);
  });

  test("relatedGames se vykreslují jako text, ne jako odkazy (žádné fake routy)", () => {
    assert.doesNotMatch(source, /href=\{[^}]*related/);
    assert.doesNotMatch(source, /href=\{`\/games\/\$\{/);
  });

  test("žádný crawler ani API volání — jen statická data", () => {
    assert.doesNotMatch(source, /fetch\(/);
    assert.doesNotMatch(source, /api\/youtube|api\/twitch|api\/kick/i);
  });
});

describe("připravené sekce (bez dat se nevykreslí)", () => {
  test("GameStreamersSection vrací null při prázdném seznamu", () => {
    const source = readSource(STREAMERS);
    assert.match(source, /if \(streamers\.length === 0\) return null;/);
    assert.match(source, /Streameři, kteří tuhle hru hrají/);
  });

  test("GameVideosSection vrací null při prázdném seznamu", () => {
    const source = readSource(VIDEOS);
    assert.match(source, /if \(videos\.length === 0\) return null;/);
    assert.match(source, /Rybářská videa z této hry/);
  });
});
