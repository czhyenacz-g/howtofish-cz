import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Stejný přístup jako test/db-upsert.test.ts: DB modul vyžaduje reálné
// připojení, takže se ověřuje přesný tvar SQL dotazů staticky.
function readSource(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const DB = "../lib/games/game-videos.ts";
const PAGE = "../app/(sections)/games/[slug]/page.tsx";
const SECTION = "../app/components/GameVideosSection.tsx";
const DISCOVERY = "../lib/games/video-discovery.ts";

describe("lib/games/game-videos.ts — pravidla ukládání a zobrazování", () => {
  const source = readSource(DB);

  test("je server-only (nikdy se nedostane do klientského bundlu)", () => {
    assert.match(source, /^import "server-only";/);
    assert.doesNotMatch(source, /"use client"/);
  });

  test("veřejné čtení vrací POUZE schválená a aktivní videa", () => {
    const match = /getApprovedGameVideos[\s\S]*?LIMIT \$\{limit\}/.exec(source);
    assert.ok(match, "nenašel jsem dotaz getApprovedGameVideos");
    const query = match[0];
    assert.match(query, /is_approved = true/);
    assert.match(query, /is_active = true/);
    assert.match(query, /platform = 'youtube'/);
  });

  test("veřejné čtení řadí nejdřív podle relevance, datum je jen druhý klíč", () => {
    assert.match(source, /ORDER BY relevance_score DESC, published_at DESC NULLS LAST/);
  });

  test("veřejný limit je max 6 videí (konstanta se používá jako výchozí)", () => {
    assert.match(source, /export const MAX_PUBLIC_GAME_VIDEOS = 6;/);
    assert.match(source, /limit: number = MAX_PUBLIC_GAME_VIDEOS/);
  });

  test("upsert deduplikuje podle (platform, external_id)", () => {
    assert.match(source, /ON CONFLICT \(platform, external_id\) DO UPDATE/);
  });

  test("upsert přebírá nejnovější skóre (re-run po změně filtru přepíše staré)", () => {
    assert.match(source, /relevance_score = EXCLUDED\.relevance_score/);
    assert.doesNotMatch(source, /GREATEST\(game_videos\.relevance_score/);
  });

  test("upsert NIKDY nepublikuje — is_approved se v INSERTu nenastavuje", () => {
    const insert = /INSERT INTO game_videos \(([\s\S]*?)\) VALUES/.exec(source);
    assert.ok(insert, "nenašel jsem INSERT INTO game_videos");
    assert.doesNotMatch(insert[1], /is_approved/);
    assert.doesNotMatch(insert[1], /is_active/);
  });

  test("schválení/odmítnutí mění jen is_approved/is_active", () => {
    assert.match(source, /SET is_approved = true, is_active = true/);
    assert.match(source, /SET is_approved = false, is_active = false/);
  });

  test("kandidáti se řadí podle skóre (nejlepší první) a jen aktivní", () => {
    assert.match(source, /is_active = true[\s\S]*?ORDER BY relevance_score DESC/);
  });
});

describe("discovery a veřejný detail — žádné volání YouTube při renderu", () => {
  test("discovery modul se o stránky nestará a je popsaný jako ruční", () => {
    const source = readSource(DISCOVERY);
    assert.match(source, /search\.list stojí 100/);
    assert.doesNotMatch(source, /"use client"/);
  });

  test("stránka detailu čte jen schválená videa z DB a má fail-soft catch", () => {
    const source = readSource(PAGE);
    assert.match(source, /getApprovedGameVideos\(game\.slug\)\.catch\(\(\) => \[\]\)/);
    assert.doesNotMatch(source, /discoverVideosForGame/);
    assert.doesNotMatch(source, /fetch\(/);
  });

  test("stránka má ISR revalidaci (cached data, ne DB čtení na každý request)", () => {
    assert.match(readSource(PAGE), /export const revalidate = 600;/);
  });

  test("sekce s videi se bez schválených videí vůbec nevykreslí", () => {
    const source = readSource(SECTION);
    assert.match(source, /if \(videos\.length === 0\) return null;/);
  });

  test("sekce videa jen deleguje na sdílenou kartu a nikdy nevkládá iframe/embed", () => {
    const source = readSource(SECTION);
    assert.match(source, /<GameVideoCard video=\{video\} \/>/);
    assert.doesNotMatch(source, /<iframe/);
    assert.doesNotMatch(source, /youtube-nocookie/);
    assert.doesNotMatch(source, /\/embed\//);
  });

  test("karta videa odkazuje na YouTube přes watch URL (žádný embed)", () => {
    const source = readSource("../app/components/GameVideoCard.tsx");
    assert.match(source, /https:\/\/www\.youtube\.com\/watch\?v=/);
    assert.doesNotMatch(source, /<iframe/);
    assert.doesNotMatch(source, /\/embed\//);
  });

  test("klientské komponenty nikdy neimportují DB vrstvu s videi", () => {
    for (const path of ["../app/(sections)/hry-s-rybarenim/GameSuggestForm.tsx", "../app/components/RotatingQuote.tsx"]) {
      const source = readSource(path);
      assert.doesNotMatch(source, /game-videos|video-discovery/);
    }
  });
});
