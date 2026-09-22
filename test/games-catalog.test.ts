import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  FISHING_IMPORTANCE_LABEL,
  FISHING_IMPORTANCE_ORDER,
  GAME_STATUS_LABEL,
  GAME_STATUS_ORDER,
  gameEntries,
  getGamesWithDetail,
  getOrderedGames,
} from "../data/games.ts";

const IMPORTANCE_SET = new Set(FISHING_IMPORTANCE_ORDER);
const STATUS_SET = new Set(GAME_STATUS_ORDER);

// Zadání: "MAXIMÁLNĚ JEDNU reprezentativní položku za herní sérii" — seed
// ale obsahuje dvě dvojice ze stejné série (Final Fantasy XIV + XV,
// Skyrim + The Elder Scrolls Online). Držíme je viditelné tady: jakákoli
// DALŠÍ kolize série test shodí. Rozhodnutí, kterou z dvojice nechat, je
// na zadavateli (viz report).
const KNOWN_SERIES_EXCEPTIONS = new Set(["Final Fantasy", "The Elder Scrolls"]);

describe("data/games.ts — integrita katalogu", () => {
  test("obsahuje naplněný katalog (50 her ze seedu)", () => {
    assert.equal(gameEntries.length, 50);
  });

  test("každý slug je unikátní a ve tvaru pro URL", () => {
    const slugs = gameEntries.map((g) => g.slug);
    assert.equal(new Set(slugs).size, slugs.length, "duplicitní slug");
    for (const slug of slugs) {
      assert.match(slug, /^[a-z0-9-]+$/, `neplatný slug "${slug}"`);
    }
  });

  test("žádné dva záznamy nemají stejné jméno", () => {
    const names = gameEntries.map((g) => g.name);
    assert.equal(new Set(names).size, names.length, "duplicitní jméno hry");
  });

  test("každá hra má platnou důležitost rybaření, stav, štítky i platformy", () => {
    for (const game of gameEntries) {
      assert.ok(IMPORTANCE_SET.has(game.fishingImportance), `${game.slug}: neplatná fishingImportance`);
      assert.ok(STATUS_SET.has(game.status), `${game.slug}: neplatný status`);
      assert.ok(game.tags.length > 0, `${game.slug}: chybí tags`);
      assert.ok(game.platforms.length > 0, `${game.slug}: chybí platforms`);
      assert.ok(FISHING_IMPORTANCE_LABEL[game.fishingImportance], `${game.slug}: chybí label důležitosti`);
      assert.ok(GAME_STATUS_LABEL[game.status], `${game.slug}: chybí label stavu`);
    }
  });

  test("každá série má nejvýš jednu reprezentativní položku (kromě zdokumentovaných výjimek)", () => {
    const countBySeries = new Map<string, string[]>();
    for (const game of gameEntries) {
      if (!game.series) continue;
      countBySeries.set(game.series, [...(countBySeries.get(game.series) ?? []), game.slug]);
    }
    for (const [series, slugs] of countBySeries) {
      const max = KNOWN_SERIES_EXCEPTIONS.has(series) ? 2 : 1;
      assert.ok(
        slugs.length <= max,
        `série "${series}" má ${slugs.length} položek (${slugs.join(", ")}) — max ${max}`
      );
    }
  });

  test("jen hry s hasDetail mají detailHref a naopak (žádná karta bez cíle ani odkaz bez obsahu)", () => {
    for (const game of gameEntries) {
      assert.equal(
        Boolean(game.detailHref),
        game.hasDetail,
        `${game.slug}: hasDetail a detailHref musí platit společně`
      );
    }
  });

  test("každý detailHref míří na stránku, která v projektu skutečně existuje (žádné 404)", () => {
    for (const game of getGamesWithDetail()) {
      const rel = `../app${game.detailHref}/page.tsx`;
      assert.ok(existsSync(fileURLToPath(new URL(rel, import.meta.url))), `${game.slug}: ${rel} neexistuje`);
    }
  });

  test("How to Fish je jediná hra se stavem 'available' (máme k ní reálný obsah)", () => {
    const available = gameEntries.filter((g) => g.status === "available");
    assert.deepEqual(available.map((g) => g.slug), ["how-to-fish"]);
    assert.equal(available[0]?.detailHref, "/ryby");
  });

  test("žádná hra nemá vymyšlený cover obrázek (image je zatím prázdné — placeholder řeší GameCover)", () => {
    for (const game of gameEntries) {
      assert.equal(game.image, undefined, `${game.slug}: neočekávaný image`);
    }
  });
});

describe("getOrderedGames", () => {
  test("vrací všech 50 her a žádnou neztratí", () => {
    const ordered = getOrderedGames();
    assert.equal(ordered.length, gameEntries.length);
    assert.equal(new Set(ordered.map((g) => g.slug)).size, gameEntries.length);
  });

  test("hry s obsahem (available, preparing) jsou první, zbytek zůstává v pořadí seedu", () => {
    const ordered = getOrderedGames();
    const firstPlannedIndex = ordered.findIndex((g) => g.status === "planned");
    assert.ok(firstPlannedIndex > 0, "očekávám aspoň jednu hru s obsahem na začátku");
    for (const game of ordered.slice(0, firstPlannedIndex)) {
      assert.notEqual(game.status, "planned", `${game.slug} by měl být před planned sekcí`);
    }
    assert.equal(ordered[0].slug, "how-to-fish", "available hra má být první");
  });

  test("nezavádí ranking kvality — pořadí v rámci stejného stavu je pořadí seedu", () => {
    const ordered = getOrderedGames().filter((g) => g.status === "planned");
    const seedPlanned = gameEntries.filter((g) => g.status === "planned");
    assert.deepEqual(
      ordered.map((g) => g.slug),
      seedPlanned.map((g) => g.slug)
    );
  });
});
