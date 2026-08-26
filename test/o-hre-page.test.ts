import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Server Component (async, JSX) — zdrojová kontrola stejným vzorem jako
// ostatní framework-vázané testy v repu (viz test/ad-slot.test.ts).
const source = readFileSync(fileURLToPath(new URL("../app/(sections)/o-hre/page.tsx", import.meta.url)), "utf8");

test("/o-hre: obsahuje základní popis hry (co je How to Fish)", () => {
  assert.match(source, /How to Fish/);
  assert.match(source, /rybářsk/i);
});

test("/o-hre: obsahuje disclaimer o neoficiálním komunitním/fan webu", () => {
  assert.match(source, /neoficiální/i);
});

test("/o-hre: obsahuje odkazy na hlavní sekce (Ryby, Předměty, Bossové, Lokace, Návody, Achievementy)", () => {
  for (const href of ["/ryby", "/predmety", "/bossove", "/lokace", "/navody", "/achievementy"]) {
    assert.match(source, new RegExp(`href:\\s*"${href.replace("/", "\\/")}"`), `chybí odkaz na ${href}`);
  }
});

test("/o-hre: obsahuje výraznější CTA 'Zahrát Krabí invazi' vedoucí na /hra", () => {
  const ctaBlock = /<Link\s+href="\/hra"[\s\S]*?<\/Link>/.exec(source)?.[0];
  assert.ok(ctaBlock, "nepodařilo se najít CTA <Link href=\"/hra\">");
  assert.match(ctaBlock, /Zahrát Krabí invazi/);
});

test("/o-hre: interní odkazy jdou přes next/link Link, ne přes hardcoded <a href>", () => {
  assert.match(source, /import Link from "next\/link"/);
  // Jediný <a> smí být ten na externí Steam URL (proměnná STEAM_URL).
  const anchorTags = source.match(/<a\s/g) ?? [];
  assert.equal(anchorTags.length, 1, "očekáván jen jeden <a> tag (externí Steam odkaz)");
  assert.match(source, /<a href=\{STEAM_URL\}/);
});

test("/o-hre: nepoužívá vlastní CharacterCallout instanci — profesor je globální (root layout), stránka jen musí být v allow-listu", () => {
  assert.doesNotMatch(source, /CharacterCallout/);
});
