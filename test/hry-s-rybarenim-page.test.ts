import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Zdrojová kontrola .tsx souborů — stejný přístup jako
// test/seo-metadata.test.ts (Node test runner neumí .tsx přímo importovat).
function readSource(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const PAGE = "../app/(sections)/hry-s-rybarenim/page.tsx";
const ROTATING_QUOTE = "../app/(sections)/hry-s-rybarenim/RotatingQuote.tsx";
const FORM = "../app/(sections)/hry-s-rybarenim/GameSuggestForm.tsx";
const ACTION = "../app/(sections)/hry-s-rybarenim/submit-game-suggestion-action.ts";
const CARD = "../app/components/GameCard.tsx";
const COVER = "../app/components/GameCover.tsx";

describe("/hry-s-rybarenim — metadata a obsah", () => {
  const source = readSource(PAGE);

  test("veřejná URL je přesně /hry-s-rybarenim (route group (sections) ji nemění)", () => {
    assert.match(source, /const PATHNAME = "\/hry-s-rybarenim"/);
    assert.match(source, /alternates:\s*\{\s*canonical:\s*PATHNAME\s*\}/);
  });

  test("title obsahuje 'Hry, ve kterých se rybaří' a je absolute (bez zdvojené značky)", () => {
    assert.match(source, /Hry, ve kterých se rybaří \| HowToFish\.cz/);
    assert.match(source, /title:\s*\{\s*absolute:\s*TITLE\s*\}/);
  });

  test("description odpovídá zadání", () => {
    assert.match(source, /Objev hry, ve kterých se dá rybařit\./);
  });

  test("OG obrázek jde přes existující /api/og endpoint", () => {
    assert.match(source, /\/api\/og\?title=/);
  });

  test("má H1 s rybařením a podnadpis ze zadání", () => {
    assert.match(source, /Hry, ve kterých se rybaří 🎣/);
    assert.match(source, /Od Minecraftu přes Stardew Valley až po Pokémony\./);
  });

  test("vykresluje rotující citát, katalog i CTA formulář", () => {
    assert.match(source, /<RotatingQuote quotes=\{QUOTES\}/);
    assert.match(source, /<GameCard entry=\{game\} \/>/);
    assert.match(source, /<GameSuggestForm \/>/);
  });

  test("CTA blok má nadpis i text ze zadání", () => {
    assert.match(source, /Chybí tu tvoje oblíbená hra\?/);
    assert.match(source, /Znáš hru, ve které se dá rybařit, ale v seznamu ji nevidíš\? Napiš nám ji\./);
  });

  test("JSON-LD: BreadcrumbList + ItemList (url mají jen hry s reálným detailem)", () => {
    assert.match(source, /buildBreadcrumbJsonLd/);
    assert.match(source, /"@type": "ItemList"/);
    assert.match(source, /game\.detailHref \? \{ url: `\$\{SITE_URL\}\$\{game\.detailHref\}` \} : \{\}/);
  });
});

describe("rotující citát", () => {
  const source = readSource(ROTATING_QUOTE);

  test("je klientská komponenta bez jakékoli animační knihovny", () => {
    assert.match(source, /^"use client";/);
    assert.doesNotMatch(source, /from ["'](framer-motion|react-transition-group|swiper|embla)/);
  });

  test("respektuje prefers-reduced-motion — při omezeném pohybu se rotace vůbec nespustí", () => {
    assert.match(source, /prefers-reduced-motion: reduce/);
    assert.match(source, /motion-reduce:transition-none/);
  });

  test("fade efekt je jen CSS transition opacity (žádný posun/animace prvků)", () => {
    assert.match(source, /transition-opacity duration-700/);
    assert.doesNotMatch(source, /translate-x|animate-\[/);
  });

  test("rotace je v rozumném intervalu 6–8 s", () => {
    const match = source.match(/const ROTATE_MS = (\d+);/);
    assert.ok(match, "chybí ROTATE_MS");
    const ms = Number(match[1]);
    assert.ok(ms >= 6000 && ms <= 8000, `ROTATE_MS=${ms} mimo 6000–8000`);
  });

  test("interval se vždy uklidí (clearInterval) — žádný leak při odmountování", () => {
    assert.match(source, /clearInterval/);
  });
});

describe("karty her", () => {
  test("karta bez detailu je neklikací (žádný odkaz na neexistující stránku)", () => {
    const source = readSource(CARD);
    assert.match(source, /const clickable = entry\.hasDetail && Boolean\(entry\.detailHref\)/);
    assert.match(source, /if \(!clickable\) \{\s*return <article/);
    assert.doesNotMatch(source, /href=\{`\/hry-s-rybarenim/);
  });

  test("placeholder cover je jednotný a počítá s pozdějším skutečným obrázkem", () => {
    const source = readSource(COVER);
    assert.match(source, /if \(image\)/);
    assert.match(source, /role="img"/);
    assert.doesNotMatch(source, /https?:\/\//);
  });
});

describe("návrh nové hry", () => {
  test("formulář má povinný název, nepovinnou poznámku a success state", () => {
    const source = readSource(FORM);
    assert.match(source, /name="gameName"[\s\S]*?required/);
    assert.match(source, /name="note"/);
    assert.match(source, /state\.status === "success"/);
    assert.match(source, /role="status"/);
  });

  test("formulář má honeypot pole proti spamu", () => {
    assert.match(readSource(FORM), /name="website"/);
  });

  test("server action validuje, hlídá rate limit a ukládá do DB (best-effort)", () => {
    const source = readSource(ACTION);
    assert.match(source, /^"use server";/);
    assert.match(source, /evaluateGameSuggestion\(formData\)/);
    assert.match(source, /checkGameSuggestionRateLimit/);
    assert.match(source, /createGameSuggestion\(evaluation\.payload\)/);
    assert.match(source, /status: "success"/);
  });

  test("server action nikdy neposílá text návrhu do analytics (jen typ)", () => {
    const source = readSource(ACTION);
    assert.match(source, /metadata: \{ type: "game" \}/);
    assert.doesNotMatch(source, /gameName.*metadata/);
  });
});
