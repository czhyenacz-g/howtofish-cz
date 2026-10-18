import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sitemap from "../app/sitemap.ts";
import { SITE_URL } from "../app/config/site.ts";
import { getGameBySlug, hasGameDetailPage } from "../data/games.ts";
import { getGameDetailContent } from "../data/game-details.ts";

const minecraft = getGameBySlug("minecraft")!;
const content = getGameDetailContent("minecraft")!;
const pageSource = readFileSync(fileURLToPath(new URL("../app/(sections)/games/[slug]/page.tsx", import.meta.url)), "utf8");

test("URL /games/minecraft zůstává: detail, canonical i sitemap", () => {
  assert.equal(minecraft.detailHref, "/games/minecraft");
  assert.equal(hasGameDetailPage(minecraft), true);
  assert.match(pageSource, /alternates: \{ canonical: `\/games\/\$\{game\.slug\}` \}/);
  const entry = sitemap().find((e) => e.url === `${SITE_URL}/games/minecraft`);
  assert.ok(entry);
  assert.equal(new Date(entry.lastModified!).toISOString().slice(0, 10), content.lastReviewed);
});

test("SEO title, H1 a description cílí na české vyhledávání", () => {
  assert.equal(content.seoTitle, "Rybaření v Minecraftu – prut, ryby, poklady a očarování | HowToFish.cz");
  assert.equal(content.h1, "Jak rybařit v Minecraftu");
  assert.ok(content.metaDescription && content.metaDescription.length <= 300);
  assert.match(pageSource, /\{content\?\.h1 \?\? game\.name\}/);
});

test("průvodce má všechny požadované části", () => {
  const ids = (content.guide ?? []).map((s) => s.id);
  assert.deepEqual(ids, ["jak-zacit", "druhy-ulovku", "ocarovani", "podminky", "afk-rybareni"]);
  const text = JSON.stringify(content.guide);
  for (const term of ["Luck of the Sea", "Lure", "Unbreaking", "Mending", "Java Edition", "Bedrock Edition", "otevřen", "prší"]) {
    assert.ok(text.includes(term), `chybí ${term}`);
  }
});

test("FAQ odpovídá zadání a vykresluje se i jako FAQPage JSON-LD", () => {
  const questions = (content.faq ?? []).map((f) => f.question);
  assert.equal(questions.length, 6);
  for (const fragment of ["prut", "poklady", "očarování", "jezírku", "déšť", "AFK"]) {
    assert.ok(questions.some((q) => q.includes(fragment)), fragment);
  }
  assert.match(pageSource, /"@type": "FAQPage"/);
});

test("pravděpodobnosti odpovídají Minecraft Wiki (základ 85/10/5, Luck of the Sea III 11,34 %)", () => {
  const text = JSON.stringify(content.guide);
  assert.ok(text.includes("85 % ryby, 10 % junk a 5 % poklady"));
  assert.ok(text.includes("11,34 %"));
});

test("zdroje jsou z minecraft.wiki", () => {
  assert.ok((content.sources ?? []).length >= 3);
  for (const source of content.sources ?? []) assert.match(source.url, /^https:\/\/minecraft\.wiki\//);
});

test("ostatní hry zůstávají beze změny struktury (bez guide/h1)", () => {
  const stardew = getGameDetailContent("stardew-valley")!;
  assert.equal(stardew.guide, undefined);
  assert.equal(stardew.h1, undefined);
});
