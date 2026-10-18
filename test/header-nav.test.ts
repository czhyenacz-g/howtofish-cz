import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  HRY_LINK,
  LIVE_LINK,
  O_HRE_LINK,
  STREAMERI_LINK,
  WORLD_GROUP,
  buildLinks,
  isEntryActive,
  isNavGroup,
} from "../app/components/nav-config.ts";
import { NAV_LINKS } from "../app/config/site.ts";
import { isSteamLoginRelevant } from "../app/config/features.ts";

// Header.tsx samotný zůstává "use client" a nejde importovat pod
// --conditions=react-server — jen zdrojová kontrola pro věci, co
// nav-config.ts nepokrývá (JSX rendering detaily).
const headerSource = readFileSync(fileURLToPath(new URL("../app/components/Header.tsx", import.meta.url)), "utf8");
const footerSource = readFileSync(fileURLToPath(new URL("../app/components/Footer.tsx", import.meta.url)), "utf8");

test("Streameři vedou na /streameri", () => {
  assert.equal(STREAMERI_LINK.href, "/streameri");
  assert.equal(STREAMERI_LINK.label, "Streameři");
});

test("Živě vede na /stream", () => {
  assert.equal(LIVE_LINK.href, "/stream");
});

test("Hry vedou na katalog /hry-s-rybarenim", () => {
  assert.equal(HRY_LINK.href, "/hry-s-rybarenim");
  assert.equal(HRY_LINK.label, "Hry");
});

test("skupina How to Fish obsahuje všechny encyklopedické sekce z NAV_LINKS + O hře", () => {
  assert.ok(isNavGroup(WORLD_GROUP));
  assert.equal(WORLD_GROUP.label, "How to Fish");
  const hrefs = WORLD_GROUP.children.map((c) => c.href).sort();
  assert.deepEqual(hrefs, [...NAV_LINKS.map((l) => l.href), O_HRE_LINK.href].sort());
});

test("NAV_LINKS: ryby, návody, předměty, bossové, lokace, achievementy (v tomhle pořadí)", () => {
  assert.deepEqual(
    NAV_LINKS.map((l) => l.href),
    ["/ryby", "/navody", "/predmety", "/bossove", "/lokace", "/achievementy"]
  );
});

test("produkční menu má přesně 4 položky: Hry, How to Fish, Streameři, Živě", () => {
  const labels = buildLinks("").map((l) => l.label);
  assert.deepEqual(labels, ["Hry", "How to Fish", "Streameři", "Živě"]);
});

test("Multiplayer ostrov ani Krabí invaze nejsou v hlavním menu", () => {
  const hrefs = buildLinks("")
    .flatMap((l) => (isNavGroup(l) ? l.children : [l]))
    .map((l) => l.href);
  assert.ok(!hrefs.includes("/multiplayer"));
  assert.ok(!hrefs.includes("/hra"));
});

test("route-independent varianta (basePath!=='') zůstává plochý seznam z NAV_LINKS", () => {
  const links = buildLinks("/demo");
  assert.deepEqual(
    links.map((l) => (isNavGroup(l) ? l.label : l.href)),
    NAV_LINKS.map((l) => l.href)
  );
});

test("encyklopedické sekce i /o-hre aktivují skupinu How to Fish", () => {
  for (const href of [...NAV_LINKS.map((l) => l.href), "/o-hre"]) {
    assert.equal(isEntryActive(href, "", WORLD_GROUP), true, `${href} by měl aktivovat How to Fish`);
    assert.equal(isEntryActive(`${href}/nejaky-slug`, "", WORLD_GROUP), true, `${href}/* by měl aktivovat How to Fish`);
  }
});

test("nesouvisející route skupinu How to Fish neaktivuje", () => {
  assert.equal(isEntryActive("/streameri", "", WORLD_GROUP), false);
  assert.equal(isEntryActive("/stream", "", WORLD_GROUP), false);
  assert.equal(isEntryActive("/hry-s-rybarenim", "", WORLD_GROUP), false);
});

test("aktivace skupiny respektuje basePath", () => {
  assert.equal(isEntryActive("/demo/lokace", "/demo", WORLD_GROUP), true);
  assert.equal(isEntryActive("/lokace", "/demo", WORLD_GROUP), false);
});

test("Steam login je relevantní jen pro Krabí invazi (žebříček)", () => {
  assert.equal(isSteamLoginRelevant("/hra"), true);
  assert.equal(isSteamLoginRelevant("/hra/rybareni"), true);
  assert.equal(isSteamLoginRelevant("/"), false);
  assert.equal(isSteamLoginRelevant("/ryby/salmon"), false);
  assert.equal(isSteamLoginRelevant("/hrabe"), false);
});

test("Header.tsx: přihlášení se renderuje jen přes showAuth (přihlášený uživatel nebo relevantní route)", () => {
  assert.match(headerSource, /const showAuth = user !== null \|\| isSteamLoginRelevant\(pathname\);/);
  const authUsages = headerSource.match(/<SteamAuthControl /g) ?? [];
  const guardedUsages = headerSource.match(/\{showAuth && \(\s*<div[^>]*>\s*<SteamAuthControl /g) ?? [];
  assert.equal(authUsages.length, 2);
  assert.equal(guardedUsages.length, 2);
});

test("Header.tsx: desktop pill navigace nemá flex-wrap (zůstává v jednom řádku)", () => {
  const navBlock = headerSource.split('aria-label="Hlavní navigace"')[1]?.split("</nav>")[0] ?? "";
  assert.doesNotMatch(navBlock, /flex-wrap/);
});

test("Header.tsx: mobilní panel nemá horizontální overflow (žádná pevná šířka širší než viewport)", () => {
  const mobileNavBlock = headerSource.split('id="mobile-nav"')[1]?.split("</nav>")[0] ?? "";
  assert.doesNotMatch(mobileNavBlock, /w-\[\d{3,}px\]/);
});

test("Header.tsx: dropdown používá role=menu/menuitem pro přístupnost", () => {
  assert.match(headerSource, /role="menu"/);
  assert.match(headerSource, /role="menuitem"/);
});

test("Header.tsx: ikony pro /streameri a /hry-s-rybarenim", () => {
  assert.match(headerSource, /"\/streameri":\s*StreamerIcon/);
  assert.match(headerSource, /"\/hry-s-rybarenim":\s*GameIcon/);
});

test("Footer.tsx: odkaz 'O hře' je vždy v patičce (SECONDARY_LINKS)", () => {
  assert.match(footerSource, /\{ href: "\/o-hre", label: "O hře" \}/);
});

test("Footer.tsx: Krabí invaze zůstává v patičce, Multiplayer ostrov ne", () => {
  assert.match(footerSource, /\/hra`/);
  assert.match(footerSource, />\s*Krabí invaze\s*</);
  assert.doesNotMatch(footerSource, /\/multiplayer/);
});

test("Footer.tsx: Streameři a Živě jsou v patičce viditelné", () => {
  assert.match(footerSource, />\s*Streameři\s*</);
  assert.match(footerSource, />\s*Živě\s*</);
});

// Regrese (říjen 2026): tlačítko "How to Fish" v hlavním menu "nic nedělalo"
// — overflow-hidden na <header> ořezával rozbalené menu a klik po najetí
// myší menu hned zase zavřel (onClick = !open).
test("Header.tsx: <header> nemá overflow-hidden (jinak ořízne rozbalovací menu)", () => {
  const headerTag = /<header className="([^"]*)"/.exec(headerSource)?.[1] ?? "";
  assert.ok(headerTag.length > 0, "nenalezen <header>");
  assert.doesNotMatch(headerTag, /overflow-hidden/);
});

test("Header.tsx: klik po otevření najetím myši menu nezavře (hover guard)", () => {
  assert.match(headerSource, /const openedByHoverRef = useRef\(false\);/);
  assert.match(headerSource, /if \(openedByHoverRef\.current\) \{\s*openedByHoverRef\.current = false;\s*onOpenChange\(true\);/);
  assert.doesNotMatch(headerSource, /onClick=\{\(\) => onOpenChange\(!open\)\}/);
});
