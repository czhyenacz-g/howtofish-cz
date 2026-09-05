import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  HRA_LINK,
  MULTIPLAYER_LINK,
  O_HRE_LINK,
  STREAMERI_LINK,
  WORLD_GROUP,
  buildLinks,
  buildMobileLinks,
  isEntryActive,
  isNavGroup,
} from "../app/components/nav-config.ts";
import { NAV_LINKS } from "../app/config/site.ts";

// Header.tsx samotný zůstává "use client" a nejde importovat pod
// --conditions=react-server — jen zdrojová kontrola pro věci, co
// nav-config.ts nepokrývá (JSX rendering detaily).
const headerSource = readFileSync(fileURLToPath(new URL("../app/components/Header.tsx", import.meta.url)), "utf8");
const footerSource = readFileSync(fileURLToPath(new URL("../app/components/Footer.tsx", import.meta.url)), "utf8");

test("Streameři vedou na /streameri (zadání: nová hlavní obsahová osa)", () => {
  assert.equal(STREAMERI_LINK.href, "/streameri");
  assert.equal(STREAMERI_LINK.label, "Streameři");
});

test("Krabí invaze vede na existující route /hra", () => {
  assert.equal(HRA_LINK.href, "/hra");
  assert.equal(HRA_LINK.label, "Krabí invaze");
});

test("O hře odkazuje na /o-hre", () => {
  assert.equal(O_HRE_LINK.href, "/o-hre");
});

test("Svět How to Fish je skupina obsahující VŠECHNY encyklopedické sekce z NAV_LINKS (zadání: hlavní menu výrazně jednodušší)", () => {
  assert.ok(isNavGroup(WORLD_GROUP));
  assert.equal(WORLD_GROUP.label, "Svět How to Fish");
  const hrefs = WORLD_GROUP.children.map((c) => c.href).sort();
  assert.deepEqual(hrefs, [...NAV_LINKS.map((l) => l.href)].sort());
});

test("produkční desktop menu (basePath='') obsahuje Streameři, Živě, Svět, Multiplayer, Krabí invaze — a NE samostatné encyklopedické položky", () => {
  const links = buildLinks("");
  const labels = links.map((l) => l.label);
  assert.deepEqual(labels, ["Streameři", "Živě", "Svět How to Fish", "Multiplayer ostrov", "Krabí invaze"]);
  for (const encyclopediaLabel of NAV_LINKS.map((l) => l.label)) {
    assert.ok(!labels.includes(encyclopediaLabel), `${encyclopediaLabel} nesmí být samostatná top-level položka`);
  }
});

test("Multiplayer ostrov je v hlavním produkčním menu", () => {
  const links = buildLinks("");
  assert.ok(links.some((l) => !isNavGroup(l) && l.href === MULTIPLAYER_LINK.href));
});

test("Krabí invaze zůstává v hlavním produkčním menu", () => {
  const links = buildLinks("");
  assert.ok(links.some((l) => !isNavGroup(l) && l.href === HRA_LINK.href));
});

test("produkční desktop menu je výrazně jednodušší než dřív — 5 top-level položek místo dřívějších 8 (zadání)", () => {
  const links = buildLinks("");
  assert.equal(links.length, 5);
});

test("demo sekce (basePath!=='') zůstává beze změny — plochý seznam z NAV_LINKS, bez Svět/Streameři/Multiplayer/Krabí invaze", () => {
  const links = buildLinks("/demo");
  assert.ok(!links.some((l) => l.label === "Svět How to Fish"));
  assert.ok(!links.some((l) => !isNavGroup(l) && l.href === STREAMERI_LINK.href));
  assert.ok(!links.some((l) => !isNavGroup(l) && l.href === MULTIPLAYER_LINK.href));
  assert.ok(!links.some((l) => !isNavGroup(l) && l.href === HRA_LINK.href));
});

test("/ryby a /lokace a /bossove (všechny encyklopedické sekce) aktivují Svět", () => {
  for (const href of NAV_LINKS.map((l) => l.href)) {
    assert.equal(isEntryActive(href, "", WORLD_GROUP), true, `${href} by měl aktivovat Svět`);
    assert.equal(isEntryActive(`${href}/nejaky-slug`, "", WORLD_GROUP), true, `${href}/* by měl aktivovat Svět`);
  }
});

test("nesouvisející route (streameři/živě/multiplayer) Svět neaktivuje", () => {
  assert.equal(isEntryActive("/streameri", "", WORLD_GROUP), false);
  assert.equal(isEntryActive("/stream", "", WORLD_GROUP), false);
  assert.equal(isEntryActive("/multiplayer", "", WORLD_GROUP), false);
});

test("aktivace Svět respektuje basePath (demo sekce)", () => {
  assert.equal(isEntryActive("/demo/lokace", "/demo", WORLD_GROUP), true);
  assert.equal(isEntryActive("/lokace", "/demo", WORLD_GROUP), false);
});

test("mobilní seznam vkládá O_HRE_LINK před poslední položku (Krabí invaze)", () => {
  const mobileLinks = buildMobileLinks(buildLinks(""));
  const last = mobileLinks[mobileLinks.length - 1];
  const secondToLast = mobileLinks[mobileLinks.length - 2];
  assert.ok(!isNavGroup(last) && last.href === HRA_LINK.href);
  assert.ok(!isNavGroup(secondToLast) && secondToLast.href === O_HRE_LINK.href);
});

test("mobilní seznam pořád obsahuje skupinu Svět How to Fish (všechny encyklopedické sekce zůstávají dosažitelné)", () => {
  const mobileLinks = buildMobileLinks(buildLinks(""));
  assert.ok(mobileLinks.some((l) => l.label === "Svět How to Fish"));
});

test("mobilní seznam obsahuje Streameři jako první položku", () => {
  const mobileLinks = buildMobileLinks(buildLinks(""));
  assert.ok(!isNavGroup(mobileLinks[0]) && mobileLinks[0].href === STREAMERI_LINK.href);
});

test("Header.tsx: desktop pill navigace nemá flex-wrap (zůstává v jednom řádku, jako dřív)", () => {
  const navBlock = headerSource.split('aria-label="Hlavní navigace"')[1]?.split("</nav>")[0] ?? "";
  assert.doesNotMatch(navBlock, /flex-wrap/);
});

test("Header.tsx: mobilní panel nemá horizontální overflow (žádná pevná šířka širší než viewport)", () => {
  const mobileNavBlock = headerSource.split('id="mobile-nav"')[1]?.split("</nav>")[0] ?? "";
  assert.doesNotMatch(mobileNavBlock, /w-\[\d{3,}px\]/);
});

test("Header.tsx: WorldDropdown používá role=menu/menuitem pro přístupnost", () => {
  assert.match(headerSource, /role="menu"/);
  assert.match(headerSource, /role="menuitem"/);
});

test("Header.tsx: /streameri má vlastní ikonu v ICON_BY_HREF", () => {
  assert.match(headerSource, /"\/streameri":\s*StreamerIcon/);
});

test("Footer.tsx: odkaz 'O hře' je vždy v patičce (SECONDARY_LINKS)", () => {
  assert.match(footerSource, /\{ href: "\/o-hre", label: "O hře" \}/);
});

test("Footer.tsx: prominentní Multiplayer ostrov CTA v patičce zůstal zachovaný", () => {
  assert.match(footerSource, /\/multiplayer/);
});

test("Footer.tsx: Streameři a Živě jsou v patičce viditelné", () => {
  assert.match(footerSource, />\s*Streameři\s*</);
  assert.match(footerSource, />\s*Živě\s*</);
});
