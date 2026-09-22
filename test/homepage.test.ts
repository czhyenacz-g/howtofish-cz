import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gameEntries } from "../data/games.ts";
import { HOMEPAGE_GAME_VIDEOS_LIMIT, selectDiverseVideos } from "../lib/games/video-selection.ts";

// Zdrojová kontrola homepage (Node test runner neumí .tsx importovat) +
// čisté testy výběru videí.

function readSource(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const PAGE = "../app/page.tsx";

describe("homepage — positioning a obsah", () => {
  const source = readSource(PAGE);

  test("H1 a podnadpis odpovídají novému směru (rybaření ve hrách)", () => {
    assert.match(source, /Rybaření ve hrách\./);
    assert.match(source, /Od Magikarpů přes Stardew Valley až po Sea of Thieves\./);
  });

  test("má CTA na katalog her i na živé streamy", () => {
    assert.match(source, /href="\/hry-s-rybarenim"/);
    assert.match(source, /Prozkoumat hry/);
    assert.match(source, /href="\/streameri"/);
    assert.match(source, /href="\/stream"/);
  });

  test("featured hry bere z existujících dat (žádný druhý dataset)", () => {
    assert.match(source, /getGamesWithGameDetailPage\(\)/);
    assert.match(source, /<GameCard entry=\{game\} \/>/);
  });

  test("video sekce čte jen schválená videa z DB a je fail-soft", () => {
    assert.match(source, /getHomepageGameVideos\(\)\.catch\(\(\) => \[\]\)/);
    assert.match(source, /<GameVideoCard video=\{video\}/);
    assert.doesNotMatch(source, /fetch\(/);
    assert.doesNotMatch(source, /youtube\.googleapis\.com/);
  });

  test("rotující citáty jdou z dat her a jsou klikací na detail", () => {
    assert.match(source, /getGameQuotes\(\)/);
    assert.match(source, /<RotatingQuote quotes=\{quotes\}/);
  });

  test("sekce Streameři používá existující CreatorCard a netvrdí, že jde jen o How to Fish", () => {
    assert.match(source, /<CreatorCard creator=\{creator\} liveStream=\{liveStream\} \/>/);
    assert.match(source, /Sleduj hráče, kteří hrají How to Fish i další hry/);
  });

  test("původní How to Fish má vlastní blok s odkazem na existující hub", () => {
    assert.match(source, /Původní How to Fish/);
    assert.match(source, /Tady to celé začalo/);
    assert.match(source, /href="\/o-hre"/);
    assert.match(source, /WORLD_CARDS/);
  });

  test("multiplayer a krabí hra jsou jen vedlejší blok", () => {
    assert.match(source, /Zahraj si/);
    assert.match(source, /href="\/hra"/);
    assert.match(source, /href="\/multiplayer"/);
  });

  test("canonical, title a description odpovídají novému positioningu", () => {
    assert.match(source, /alternates:\s*\{\s*canonical:\s*["']\/["']\s*\}/);
    assert.match(source, /HowToFish\.cz – rybaření ve hrách/);
    assert.match(source, /Hry, ve kterých se rybaří, návody, videa a streamers\./);
    assert.match(source, /title:\s*\{\s*absolute:\s*TITLE\s*\}/);
  });

  test("všechny interní odkazy na homepage vedou na existující routy", () => {
    const routes = ["hry-s-rybarenim", "streameri", "stream", "o-hre", "hra", "multiplayer"];
    for (const route of routes) {
      assert.ok(
        existsSync(fileURLToPath(new URL(`../app/(sections)/${route}/page.tsx`, import.meta.url))) ||
          existsSync(fileURLToPath(new URL(`../app/${route}/page.tsx`, import.meta.url))),
        `odkazovaná routa /${route} neexistuje`
      );
    }
  });
});

describe("homepage — výběr videí", () => {
  type V = { gameSlug: string; id: number };
  const video = (gameSlug: string, id: number): V => ({ gameSlug, id });

  test("limit je 6", () => {
    assert.equal(HOMEPAGE_GAME_VIDEOS_LIMIT, 6);
  });

  test("max 6 videí, i když je kandidátů víc", () => {
    const videos = Array.from({ length: 20 }, (_, i) => video(`g${i}`, i));
    assert.equal(selectDiverseVideos(videos, HOMEPAGE_GAME_VIDEOS_LIMIT).length, 6);
  });

  test("diverzita: z dostatku her vybere max 1 video na hru", () => {
    const videos = [
      video("minecraft", 1),
      video("minecraft", 2),
      video("stardew-valley", 3),
      video("stardew-valley", 4),
      video("terraria", 5),
      video("warframe", 6),
      video("palia", 7),
      video("dredge", 8),
    ];
    const picked = selectDiverseVideos(videos, 6);
    assert.deepEqual(
      picked.map((v) => v.id),
      [1, 3, 5, 6, 7, 8]
    );
    assert.equal(new Set(picked.map((v) => v.gameSlug)).size, 6);
  });

  test("když je her málo, doplní druhé video od stejné hry (max 2)", () => {
    const videos = [
      video("minecraft", 1),
      video("stardew-valley", 2),
      video("minecraft", 3),
      video("stardew-valley", 4),
      video("minecraft", 5),
      video("minecraft", 6),
    ];
    const picked = selectDiverseVideos(videos, 6);
    assert.deepEqual(
      picked.map((v) => v.id),
      [1, 2, 3, 4]
    );
    const counts = picked.reduce<Record<string, number>>((acc, v) => ({ ...acc, [v.gameSlug]: (acc[v.gameSlug] ?? 0) + 1 }), {});
    assert.equal(counts.minecraft, 2);
    assert.equal(counts["stardew-valley"], 2);
  });

  test("prázdný vstup i limit 0 vrací prázdno", () => {
    assert.deepEqual(selectDiverseVideos([], 6), []);
    assert.deepEqual(selectDiverseVideos([video("minecraft", 1)], 0), []);
  });
});

describe("homepage — konzistence s katalogem", () => {
  test("katalog her (zdroj homepage sekce) obsahuje všech 50 her", () => {
    assert.equal(gameEntries.length, 50);
  });
});
