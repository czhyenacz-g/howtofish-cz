import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// "use client" chybí zde (server component), ale JSX/TSX se stejně
// neimportuje přímo do node --test — zdrojová kontrola, stejný vzor
// jako ostatní framework-vázané testy v repu (viz test/ad-slot.test.ts).
const source = readFileSync(fileURLToPath(new URL("../app/hra/page.tsx", import.meta.url)), "utf8");

test("HraPage: challenge badge je <p> (lidská výzva), ne <h2> — obsahuje krabí emoji a přesný text", () => {
  assert.doesNotMatch(source, /<h2[^>]*>\s*🦀/);
  assert.match(source, /<span aria-hidden="true">🦀<\/span> Dá si někdo se mnou soutěž v mlácení krabů\?/);
});

test("HraPage: badge je vykreslený PŘED Leaderboard (nad ním v JSX stromu)", () => {
  const badgeIndex = source.indexOf("Dá si někdo se mnou soutěž v mlácení krabů?");
  const leaderboardIndex = source.indexOf("<Leaderboard");
  assert.ok(badgeIndex !== -1 && leaderboardIndex !== -1);
  assert.ok(badgeIndex < leaderboardIndex, "badge musí být před Leaderboard komponentou");
});

test("HraPage: badge používá existující žlutou/písčitou paletu s tmavým outline (bg-amber-400 + border-[#3a2a1a]), žádná nová barva", () => {
  const badgeLine = /<p className="[^"]*rounded-full border-2 border-\[#3a2a1a\] bg-amber-400[^"]*">/;
  assert.match(source, badgeLine);
});

test("HraPage: SEO description (meta description) zůstává informativní, beze změny", () => {
  assert.match(
    source,
    /const DESCRIPTION = "Rychlá arkádová minihra Krabí invaze — zastav kraby dřív, než utečou do moře, a dostaň se do žebříčku\.";/
  );
  assert.match(source, /description: DESCRIPTION,/);
});

test("HraPage: openGraph.description je jiný text (výzva) než SEO description, žádné vlastní twitter pole (padá zpět na openGraph)", () => {
  assert.match(source, /const CHALLENGE_MESSAGE = "Dá si někdo se mnou soutěž v mlácení krabů\? 🦀";/);
  assert.match(source, /openGraph:\s*\{\s*description:\s*CHALLENGE_MESSAGE,/);
  assert.doesNotMatch(source, /twitter:\s*\{/);
});

test("HraPage: title zůstává 'Krabí invaze' (template v root layoutu ho doplní na 'Krabí invaze | HowToFish.cz')", () => {
  assert.match(source, /const TITLE = "Krabí invaze";/);
  assert.match(source, /title: TITLE,/);
});

test("HraPage: OG obrázek beze změny (stejný /api/og endpoint s TITLE, žádný nový obrázek)", () => {
  assert.match(source, /images: \[\{ url: `\/api\/og\?title=\$\{encodeURIComponent\(TITLE\)\}`, width: 1200, height: 630 \}\]/);
});
