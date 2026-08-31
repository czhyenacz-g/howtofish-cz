import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  HRA_LINK,
  MULTIPLAYER_LINK,
  O_HRE_LINK,
  WORLD_GROUP,
  buildLinks,
  buildMobileLinks,
  isEntryActive,
  isNavGroup,
} from "../app/components/nav-config.ts";

// Header.tsx samotný zůstává "use client" a nejde importovat pod
// --conditions=react-server — jen zdrojová kontrola pro věci, co
// nav-config.ts nepokrývá (JSX rendering detaily).
const headerSource = readFileSync(fileURLToPath(new URL("../app/components/Header.tsx", import.meta.url)), "utf8");
const footerSource = readFileSync(fileURLToPath(new URL("../app/components/Footer.tsx", import.meta.url)), "utf8");

test("Krabí invaze vede na existující route /hra", () => {
  assert.equal(HRA_LINK.href, "/hra");
  assert.equal(HRA_LINK.label, "Krabí invaze");
});

test("O hře odkazuje na /o-hre", () => {
  assert.equal(O_HRE_LINK.href, "/o-hre");
});

test("Svět je skupina obsahující Lokace a Bossové", () => {
  assert.ok(isNavGroup(WORLD_GROUP));
  const hrefs = WORLD_GROUP.children.map((c) => c.href);
  assert.deepEqual(hrefs.sort(), ["/bossove", "/lokace"]);
});

test("produkční desktop menu (basePath='') obsahuje Svět, ne samostatné Lokace/Bossové", () => {
  const links = buildLinks("");
  const labels = links.map((l) => l.label);
  assert.ok(labels.includes("Svět"));
  assert.ok(!labels.includes("Lokace"), "Lokace nesmí být samostatná top-level položka");
  assert.ok(!labels.includes("Bossové"), "Bossové nesmí být samostatná top-level položka");
});

test("Multiplayer ostrov je v hlavním produkčním menu", () => {
  const links = buildLinks("");
  assert.ok(links.some((l) => !isNavGroup(l) && l.href === MULTIPLAYER_LINK.href));
});

test("Krabí invaze zůstává v hlavním produkčním menu", () => {
  const links = buildLinks("");
  assert.ok(links.some((l) => !isNavGroup(l) && l.href === HRA_LINK.href));
});

test("produkční desktop menu má stejný počet top-level položek jako dřív (8) — merge Svět uvolnil slot pro Multiplayer", () => {
  const links = buildLinks("");
  assert.equal(links.length, 8);
});

test("demo sekce (basePath!=='') zůstává beze změny — plochý seznam z NAV_LINKS, bez Svět/Multiplayer/Krabí invaze", () => {
  const links = buildLinks("/demo");
  assert.ok(!links.some((l) => l.label === "Svět"));
  assert.ok(!links.some((l) => !isNavGroup(l) && l.href === MULTIPLAYER_LINK.href));
  assert.ok(!links.some((l) => !isNavGroup(l) && l.href === HRA_LINK.href));
});

test("/lokace a /lokace/* aktivují Svět", () => {
  assert.equal(isEntryActive("/lokace", "", WORLD_GROUP), true);
  assert.equal(isEntryActive("/lokace/plaz", "", WORLD_GROUP), true);
});

test("/bossove a /bossove/* aktivují Svět", () => {
  assert.equal(isEntryActive("/bossove", "", WORLD_GROUP), true);
  assert.equal(isEntryActive("/bossove/kraken", "", WORLD_GROUP), true);
});

test("nesouvisející route Svět neaktivuje", () => {
  assert.equal(isEntryActive("/ryby", "", WORLD_GROUP), false);
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

test("mobilní seznam pořád obsahuje skupinu Svět (Lokace/Bossové zůstávají dosažitelné)", () => {
  const mobileLinks = buildMobileLinks(buildLinks(""));
  assert.ok(mobileLinks.some((l) => l.label === "Svět"));
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

test("Footer.tsx: odkaz 'O hře' je vždy v patičce (SECONDARY_LINKS)", () => {
  assert.match(footerSource, /\{ href: "\/o-hre", label: "O hře" \}/);
});

test("Footer.tsx: prominentní Multiplayer ostrov CTA v patičce zůstal zachovaný", () => {
  assert.match(footerSource, /\/multiplayer/);
});
