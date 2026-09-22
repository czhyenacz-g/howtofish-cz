import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gameEntries, getGamesWithGameDetailPage } from "../data/games.ts";

// Vlastní artworky pro 12 hlavních her (public/images/games/*.webp).
// Ostatní hry musí bezpečně zůstat na stylovém placeholderu.

const EXPECTED_COVERS: Record<string, string> = {
  minecraft: "/images/games/minecraft.webp",
  "stardew-valley": "/images/games/stardew-valley.webp",
  "pokemon-brilliant-diamond-shining-pearl": "/images/games/pokemon-brilliant-diamond-shining-pearl.webp",
  terraria: "/images/games/terraria.webp",
  "sea-of-thieves": "/images/games/sea-of-thieves.webp",
  "final-fantasy-xiv": "/images/games/final-fantasy-xiv.webp",
  "world-of-warcraft": "/images/games/world-of-warcraft.webp",
  "old-school-runescape": "/images/games/old-school-runescape.webp",
  "fallout-76": "/images/games/fallout-76.webp",
  palia: "/images/games/palia.webp",
  "fishing-planet": "/images/games/fishing-planet.webp",
  warframe: "/images/games/warframe.webp",
};

describe("covers 12 hlavních her", () => {
  test("každý známý slug má přesně očekávanou image cestu", () => {
    for (const [slug, image] of Object.entries(EXPECTED_COVERS)) {
      const game = gameEntries.find((g) => g.slug === slug);
      assert.ok(game, `chybí hra ${slug}`);
      assert.equal(game?.image, image, `${slug}: image`);
    }
  });

  test("všech 12 mělo i vlastní detail (jinak by artwork neměl kde být vidět)", () => {
    const withDetail = new Set(getGamesWithGameDetailPage().map((g) => g.slug));
    for (const slug of Object.keys(EXPECTED_COVERS)) {
      assert.ok(withDetail.has(slug), `${slug}: chybí /games detail`);
    }
  });

  test("každá image vede na existující lokální asset přiměřené velikosti", () => {
    for (const game of gameEntries) {
      if (!game.image) continue;
      assert.match(game.image, /^\/images\/[a-z0-9/_-]+\.webp$/, `${game.slug}: neočekávaný tvar cesty`);
      const file = fileURLToPath(new URL(`../public${game.image}`, import.meta.url));
      assert.ok(existsSync(file), `${game.slug}: soubor ${game.image} neexistuje`);
      const bytes = statSync(file).size;
      assert.ok(bytes > 20_000, `${game.slug}: asset je podezřele malý (${bytes} B)`);
      assert.ok(bytes < 700_000, `${game.slug}: asset je moc velký (${Math.round(bytes / 1024)} kB)`);
    }
  });

  test("žádná image není externí URL (žádné hotlinky na cizí CDN)", () => {
    for (const game of gameEntries) {
      if (!game.image) continue;
      assert.ok(!/^https?:\/\//.test(game.image), `${game.slug}: externí URL`);
    }
  });

  test("katalog kombinuje vlastní artworky i placeholder (zbytek her zůstává bez image)", () => {
    const withImage = gameEntries.filter((g) => g.image).map((g) => g.slug).sort();
    assert.deepEqual(withImage, [...Object.keys(EXPECTED_COVERS), "how-to-fish"].sort());
    const withoutImage = gameEntries.filter((g) => !g.image);
    assert.ok(withoutImage.length >= 30, `čekám většinu her bez artworku, je jich ${withoutImage.length}`);
  });

  test("homepage (hry s vlastním detailem) mají všechny artwork", () => {
    for (const game of getGamesWithGameDetailPage()) {
      assert.ok(game.image, `${game.slug}: homepage karta by měla mít artwork`);
    }
  });
});
