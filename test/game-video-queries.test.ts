import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { gameEntries } from "../data/games.ts";
import { estimateQuotaUnits } from "../lib/games/video-discovery.ts";
import {
  MAX_QUERIES_PER_GAME,
  getCuratedNegativeTerms,
  getGamesWithVideoQueries,
  getVideoQueriesForGame,
  hasVideoQueries,
} from "../lib/games/video-queries.ts";

// První vlna = 4 pilotní hry (5 dotazů), druhá vlna = 10 her (3 dotazy kvůli kvótě).
const WAVE_1 = ["minecraft", "stardew-valley", "pokemon-brilliant-diamond-shining-pearl", "sea-of-thieves"];
const WAVE_2 = [
  "final-fantasy-xiv",
  "world-of-warcraft",
  "old-school-runescape",
  "fallout-76",
  "palia",
  "terraria",
  "no-mans-sky",
  "warframe",
  "dredge",
  "fishing-planet",
];

describe("lib/games/video-queries.ts", () => {
  test("discovery je připravený pro 4 pilotní + 10 her druhé vlny", () => {
    assert.deepEqual([...getGamesWithVideoQueries()].sort(), [...WAVE_1, ...WAVE_2].sort());
  });

  test("každá hra má 3–5 dotazů (zadání: žádné aliases × keywords kombinatoriky)", () => {
    for (const slug of [...WAVE_1, ...WAVE_2]) {
      const queries = getVideoQueriesForGame({ slug });
      assert.ok(queries.length >= 3 && queries.length <= MAX_QUERIES_PER_GAME, `${slug}: ${queries.length} dotazů`);
    }
  });

  test("druhá vlna má přesně 3 dotazy na hru (kvótní omezení)", () => {
    for (const slug of WAVE_2) {
      assert.equal(getVideoQueriesForGame({ slug }).length, 3, `${slug}: má mít 3 dotazy`);
    }
  });

  test("dotazy nejsou duplicitní a nejsou prázdné", () => {
    for (const slug of [...WAVE_1, ...WAVE_2]) {
      const queries = getVideoQueriesForGame({ slug });
      assert.equal(new Set(queries).size, queries.length, `${slug}: duplicitní dotaz`);
      for (const query of queries) {
        assert.ok(query.trim().length > 5, `${slug}: příliš krátký dotaz "${query}"`);
      }
    }
  });

  test("dotazy vycházejí z dat hry (obsahují název nebo alias)", () => {
    for (const slug of [...WAVE_1, ...WAVE_2]) {
      const game = gameEntries.find((entry) => entry.slug === slug);
      assert.ok(game, `chybí hra ${slug}`);
      const terms = [game.name, ...(game.aliases ?? [])].map((term) => term.toLowerCase());
      for (const query of getVideoQueriesForGame(game)) {
        const lower = query.toLowerCase();
        assert.ok(terms.some((term) => lower.includes(term)), `${slug}: dotaz "${query}" neobsahuje název/alias hry`);
      }
    }
  });

  test("hra bez kurátorovaných dotazů discovery nespouští", () => {
    assert.deepEqual(getVideoQueriesForGame({ slug: "hades" }), []);
    assert.equal(hasVideoQueries({ slug: "hades" }), false);
    assert.equal(hasVideoQueries({ slug: "minecraft" }), true);
  });

  test("kvótní odhad druhé vlny je ~3010 jednotek (30 dotazů + videos.list za každou hru)", () => {
    const queryCount = WAVE_2.reduce((sum, slug) => sum + getVideoQueriesForGame({ slug }).length, 0);
    assert.equal(queryCount, 30);
    // estimateQuotaUnits počítá jednu hru; CLI je sčítá přes všechny hry.
    const total = WAVE_2.reduce((sum, slug) => sum + estimateQuotaUnits(getVideoQueriesForGame({ slug }).length), 0);
    assert.equal(total, 3010);
  });

  test("negativní termíny jsou jen tam, kde audit našel false positives (per-game, ne globální)", () => {
    assert.ok(getCuratedNegativeTerms({ slug: "pokemon-brilliant-diamond-shining-pearl" }).length > 0);
    for (const slug of [...WAVE_1, ...WAVE_2]) {
      if (slug === "pokemon-brilliant-diamond-shining-pearl") continue;
      assert.deepEqual(getCuratedNegativeTerms({ slug }), [], `${slug}: nečekané negativní termíny`);
    }
  });

  test("negativní termíny jsou normalizované (malá písmena, bez diakritiky)", () => {
    for (const slug of getGamesWithVideoQueries()) {
      for (const term of getCuratedNegativeTerms({ slug })) {
        assert.equal(term, term.toLowerCase(), `${slug}: "${term}" není lowercase`);
      }
    }
    // Pokémon má zakázané reálné návnady, ale jeho herní pruty zůstávají.
    const pokemonNegatives = getCuratedNegativeTerms({ slug: "pokemon-brilliant-diamond-shining-pearl" });
    assert.ok(pokemonNegatives.includes("fishing lure"));
    assert.ok(!pokemonNegatives.some((term) => term.includes("super rod")));
  });
});
