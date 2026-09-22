import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  AUDIENCE_TYPE_LABEL,
  FISHING_IMPORTANCE_LABEL,
  FISHING_IMPORTANCE_ORDER,
  GAME_STATUS_LABEL,
  GAME_STATUS_ORDER,
  MONITORING_PRIORITY_LABEL,
  PILOT_GAME_SLUGS,
  gameEntries,
  getGameBySlug,
  getGamesWithDetail,
  getGamesWithGameDetailPage,
  getOrderedGames,
  getPilotGames,
  hasGameDetailPage,
} from "../data/games.ts";
import { gameDetails, getGameDetailContent, getGameStreamers } from "../data/game-details.ts";

const IMPORTANCE_SET = new Set(FISHING_IMPORTANCE_ORDER);
const STATUS_SET = new Set(GAME_STATUS_ORDER);
const AUDIENCE_SET = new Set(Object.keys(AUDIENCE_TYPE_LABEL));
const PRIORITY_SET = new Set(Object.keys(MONITORING_PRIORITY_LABEL));

describe("data/games.ts — integrita katalogu", () => {
  test("obsahuje finálních 50 her/sérií", () => {
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

  test("každá hra má vyplněné všechny povinné enumy + labely", () => {
    for (const game of gameEntries) {
      assert.ok(IMPORTANCE_SET.has(game.fishingImportance), `${game.slug}: fishingImportance`);
      assert.ok(STATUS_SET.has(game.status), `${game.slug}: status`);
      assert.ok(AUDIENCE_SET.has(game.audienceType), `${game.slug}: audienceType`);
      assert.ok(PRIORITY_SET.has(game.monitoringPriority), `${game.slug}: monitoringPriority`);
      assert.ok(FISHING_IMPORTANCE_LABEL[game.fishingImportance], `${game.slug}: chybí label důležitosti`);
      assert.ok(GAME_STATUS_LABEL[game.status], `${game.slug}: chybí label stavu`);
      assert.ok(AUDIENCE_TYPE_LABEL[game.audienceType], `${game.slug}: chybí label publika`);
      assert.ok(MONITORING_PRIORITY_LABEL[game.monitoringPriority], `${game.slug}: chybí label priority`);
      assert.ok(game.tags.length > 0, `${game.slug}: chybí tags`);
      assert.ok(game.platforms.length > 0, `${game.slug}: chybí platforms`);
    }
  });

  test("žádná série nemá víc než jednu veřejnou kartu (zadání: max 1 na sérii)", () => {
    const countBySeries = new Map<string, string[]>();
    for (const game of gameEntries) {
      if (!game.series) continue;
      countBySeries.set(game.series, [...(countBySeries.get(game.series) ?? []), game.slug]);
    }
    for (const [series, slugs] of countBySeries) {
      assert.equal(slugs.length, 1, `série "${series}" má ${slugs.length} karty: ${slugs.join(", ")}`);
    }
  });

  test("Final Fantasy zastupuje FF XIV; FF XV je jen v relatedGames", () => {
    const ff = gameEntries.find((g) => g.series === "Final Fantasy");
    assert.equal(ff?.slug, "final-fantasy-xiv");
    assert.equal(ff?.name, "Final Fantasy XIV");
    assert.equal(ff?.fishingImportance, "major");
    assert.equal(ff?.monitoringPriority, "high");
    assert.ok(ff?.relatedGames?.includes("Final Fantasy XV"));
    assert.ok(!gameEntries.some((g) => g.slug === "final-fantasy-xv"), "FF XV nesmí být samostatná karta");
  });

  test("The Elder Scrolls Online není samostatná karta (je v relatedGames u Skyrimu)", () => {
    assert.ok(!gameEntries.some((g) => g.slug === "the-elder-scrolls-online"));
    const tes = gameEntries.find((g) => g.series === "The Elder Scrolls");
    assert.ok(tes?.relatedGames?.includes("The Elder Scrolls Online"));
  });

  test("Warframe je v katalogu s očekávanými metadaty", () => {
    const warframe = gameEntries.find((g) => g.slug === "warframe");
    assert.ok(warframe, "chybí Warframe");
    assert.equal(warframe?.series, "Warframe");
    assert.equal(warframe?.fishingImportance, "major");
    assert.equal(warframe?.monitoringPriority, "high");
    assert.deepEqual(warframe?.audienceType, "current");
    assert.ok((warframe?.searchKeywords?.length ?? 0) > 3, "Warframe má mít search keywords");
    assert.ok(warframe?.searchKeywords?.some((k) => /spear fishing/i.test(k)), "chybí spear fishing");
  });

  test("The Long Dark je v katalogu s očekávanými metadaty", () => {
    const tld = gameEntries.find((g) => g.slug === "the-long-dark");
    assert.ok(tld, "chybí The Long Dark");
    assert.equal(tld?.series, "The Long Dark");
    assert.equal(tld?.fishingImportance, "minor");
    assert.equal(tld?.monitoringPriority, "medium");
    assert.equal(tld?.audienceType, "evergreen");
    assert.ok(tld?.searchKeywords?.some((k) => /ice fishing/i.test(k)), "chybí ice fishing");
  });

  test("jen hry s hasDetail mají detailHref a naopak", () => {
    for (const game of gameEntries) {
      assert.equal(Boolean(game.detailHref), game.hasDetail, `${game.slug}: hasDetail vs detailHref`);
    }
  });

  test("každý detailHref míří na stránku, která v projektu skutečně existuje (žádné 404)", () => {
    for (const game of getGamesWithDetail()) {
      const href = game.detailHref!;
      // /games/<slug> obsluhuje jedna dynamická routa, ostatní odkazy jsou
      // statické stránky (např. How to Fish -> /ryby).
      const rel = href.startsWith("/games/") ? "../app/(sections)/games/[slug]/page.tsx" : `../app${href}/page.tsx`;
      assert.ok(existsSync(fileURLToPath(new URL(rel, import.meta.url))), `${game.slug}: ${rel} neexistuje`);
    }
  });

  test("vlastní /games/[slug] stránku mají jen hry s hasDetail + detailHref na tuhle routu (How to Fish ne — ten vede na /ryby)", () => {
    const withPage = getGamesWithGameDetailPage().map((g) => g.slug).sort();
    assert.deepEqual(withPage, [
      "fallout-76",
      "final-fantasy-xiv",
      "fishing-planet",
      "minecraft",
      "old-school-runescape",
      "palia",
      "pokemon-brilliant-diamond-shining-pearl",
      "sea-of-thieves",
      "stardew-valley",
      "terraria",
      "warframe",
      "world-of-warcraft",
    ]);
    assert.ok(!withPage.includes("how-to-fish"));
    assert.equal(gameEntries.find((g) => g.slug === "how-to-fish")?.detailHref, "/ryby");
  });

  test("hry bez dat nemají detail (DREDGE, No Man's Sky) — karta zůstává neklikací, žádná 404", () => {
    for (const slug of ["dredge", "no-mans-sky"]) {
      const game = gameEntries.find((g) => g.slug === slug);
      assert.ok(game, `chybí hra ${slug}`);
      assert.equal(game?.hasDetail, false, `${slug} by zatím neměl mít detail`);
      assert.equal(game?.detailHref, undefined, `${slug} by neměl mít detailHref`);
    }
  });

  test("hasGameDetailPage odpovídá detailHref (žádná hra bez hasDetail se sem nedostane)", () => {
    for (const game of gameEntries) {
      assert.equal(hasGameDetailPage(game), game.detailHref === `/games/${game.slug}`, `${game.slug}`);
    }
  });

  test("How to Fish je jediná hra se stavem 'available' a odkazem na /ryby", () => {
    const available = gameEntries.filter((g) => g.status === "available");
    assert.deepEqual(available.map((g) => g.slug), ["how-to-fish"]);
    assert.equal(available[0]?.detailHref, "/ryby");
  });

  test("cover mají jen hry s reálným (vlastním) assetem a ten na disku existuje", () => {
    const withImage = gameEntries.filter((g) => g.image);
    assert.deepEqual(withImage.map((g) => g.slug), ["how-to-fish"]);
    for (const game of withImage) {
      assert.match(game.image!, /^\/[a-z0-9/_-]+\.(webp|avif|png|jpg)$/i, `${game.slug}: podezřelá cesta k obrázku`);
      assert.ok(existsSync(fileURLToPath(new URL(`../public${game.image}`, import.meta.url))), `${game.slug}: ${game.image} neexistuje`);
      assert.doesNotMatch(game.image!, /^https?:/, `${game.slug}: žádné externí hotlinky`);
    }
  });

  test("žádná hra nemá vymyšlený externí obrázek (placeholder řeší GameCover)", () => {
    for (const game of gameEntries) {
      if (game.image === undefined) continue;
      assert.ok(!/^https?:/.test(game.image), `${game.slug}: externí URL místo lokálního assetu`);
    }
  });
});

describe("pilotní hry (zadání bod 4)", () => {
  const pilots = getPilotGames();

  test("je jich přesně 5 a odpovídají PILOT_GAME_SLUGS", () => {
    assert.equal(pilots.length, 5);
    assert.deepEqual(pilots.map((g) => g.slug).sort(), [...PILOT_GAME_SLUGS].sort());
  });

  test("každá má kompletní metadata pro další fázi (series, aliases, searchKeywords, audienceType, monitoringPriority)", () => {
    for (const game of pilots) {
      assert.ok(game.series, `${game.slug}: chybí series`);
      assert.ok((game.aliases?.length ?? 0) > 0, `${game.slug}: chybí aliases`);
      assert.ok((game.searchKeywords?.length ?? 0) > 2, `${game.slug}: chybí searchKeywords`);
      assert.ok(game.audienceType, `${game.slug}: chybí audienceType`);
      assert.equal(game.monitoringPriority, "high", `${game.slug}: pilot má mít vysokou prioritu`);
    }
  });

  test("searchKeywords nejsou duplicitní a jsou neprázdné", () => {
    for (const game of pilots) {
      const keywords = game.searchKeywords ?? [];
      assert.equal(new Set(keywords).size, keywords.length, `${game.slug}: duplicitní keyword`);
      for (const keyword of keywords) {
        assert.ok(keyword.trim().length > 1, `${game.slug}: prázdný keyword`);
      }
    }
  });

  test("How to Fish má searchKeywords odvozené z reálného obsahu webu (ryby z data/fish.ts)", () => {
    const howToFish = pilots.find((g) => g.slug === "how-to-fish");
    const keywords = howToFish?.searchKeywords ?? [];
    assert.ok(keywords.includes("Spider Crab"));
    assert.ok(keywords.includes("Giant Piranha"));
  });

  test("žádná pilotní hra nemá vymyšlený cover — jen How to Fish má vlastní asset", () => {
    assert.deepEqual(pilots.filter((g) => g.image).map((g) => g.slug), ["how-to-fish"]);
  });
});

describe("detaily her (data/game-details.ts + /games/[slug])", () => {
  test("každá hra s vlastní /games stránkou má editorský obsah", () => {
    for (const game of getGamesWithGameDetailPage()) {
      const content = getGameDetailContent(game.slug);
      assert.ok(content, `${game.slug}: chybí obsah v game-details.ts`);
      assert.ok(content.tagline.length > 20, `${game.slug}: tagline`);
      assert.ok(content.fishing.length >= 2, `${game.slug}: málo odstavců`);
      assert.ok((content.metaDescription?.length ?? 0) > 40, `${game.slug}: metaDescription`);
    }
  });

  test("editorský obsah existuje jen pro hry s vlastní /games stránkou", () => {
    const withPage = new Set(getGamesWithGameDetailPage().map((g) => g.slug));
    for (const detail of gameDetails) {
      assert.ok(withPage.has(detail.slug), `${detail.slug}: obsah bez vlastní stránky`);
    }
  });

  test("citáty mají jen pilotní hry, jsou krátké a neopakují se", () => {
    const pilots = new Set<string>(PILOT_GAME_SLUGS);
    const allQuotes: string[] = [];
    for (const game of gameEntries) {
      if (!game.quotes) continue;
      assert.ok(pilots.has(game.slug), `${game.slug}: citát mimo pilotní hry`);
      for (const quote of game.quotes) {
        assert.ok(quote.length > 10 && quote.length <= 120, `${game.slug}: nevhodná délka citátu (${quote.length})`);
        allQuotes.push(quote);
      }
    }
    assert.equal(new Set(allQuotes).size, allQuotes.length, "duplicitní citáty");
    for (const slug of PILOT_GAME_SLUGS) {
      assert.ok((getGameBySlug(slug)?.quotes?.length ?? 0) >= 1, `${slug}: chybí citát`);
    }
  });

  test("getGameBySlug vrací hru i undefined pro neexistující slug", () => {
    assert.equal(getGameBySlug("minecraft")?.name, "Minecraft");
    assert.equal(getGameBySlug("neexistujici-hra"), undefined);
  });

  test("sekce se streamery zatím vrací prázdno (monitoring streamerů neběží)", () => {
    for (const game of getGamesWithGameDetailPage()) {
      assert.deepEqual(getGameStreamers(game), []);
    }
  });
});

describe("getOrderedGames", () => {
  test("vrací všechny hry a žádnou neztratí", () => {
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
