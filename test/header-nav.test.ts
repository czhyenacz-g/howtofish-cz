import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Header.tsx je "use client" a importuje React hooky přímo — pod
// --conditions=react-server ho nejde přímo naimportovat (viz
// test/use-banner-visible.test.ts pro stejný důvod). Zdrojová kontrola,
// stejný vzor jako ostatní framework-vázané testy v repu.
const headerSource = readFileSync(fileURLToPath(new URL("../app/components/Header.tsx", import.meta.url)), "utf8");
const footerSource = readFileSync(fileURLToPath(new URL("../app/components/Footer.tsx", import.meta.url)), "utf8");

test("Header.tsx: položka pro /hra se jmenuje 'Krabí invaze', ne 'Hra'", () => {
  assert.match(headerSource, /const HRA_LINK = \{ href: "\/hra", label: "Krabí invaze" \}/);
});

test("Header.tsx: label 'Hra' už se nikde nepoužívá jako text položky (jen jako součást delších slov jako 'hra' v komentářích/URL se nekontroluje)", () => {
  assert.doesNotMatch(headerSource, /label:\s*"Hra"/);
});

test("Header.tsx: 'Krabí invaze' vede na existující route /hra", () => {
  const hraLinkMatch = /const HRA_LINK = \{ href: "([^"]+)", label: "Krabí invaze" \}/.exec(headerSource);
  assert.ok(hraLinkMatch, "nepodařilo se najít HRA_LINK");
  assert.equal(hraLinkMatch[1], "/hra");
});

test("Header.tsx: /hra používá CrabIcon, ne GameIcon (gamepad)", () => {
  assert.match(headerSource, /"\/hra":\s*CrabIcon/);
  assert.doesNotMatch(headerSource, /GameIcon/);
});

test("Header.tsx: O_HRE_LINK existuje a míří na /o-hre", () => {
  assert.match(headerSource, /const O_HRE_LINK = \{ href: "\/o-hre", label: "O hře" \}/);
});

test("Header.tsx: desktop pill navigace (buildLinks) O hře NEobsahuje — jen sekundární odkaz mimo <ul>, aby menu zůstalo v jednom řádku", () => {
  const buildLinksBody = /function buildLinks\(basePath: string\) \{([\s\S]*?)\n\}/.exec(headerSource)?.[1];
  assert.ok(buildLinksBody);
  assert.doesNotMatch(buildLinksBody, /O_HRE_LINK/);
});

test("Header.tsx: mobilní seznam (buildMobileLinks) vkládá O_HRE_LINK před poslední položku (Krabí invaze)", () => {
  const bodyMatch = /function buildMobileLinks\([^)]*\) \{([\s\S]*?)\n\}/.exec(headerSource)?.[1];
  assert.ok(bodyMatch);
  assert.match(bodyMatch, /O_HRE_LINK/);
  assert.match(bodyMatch, /slice\(0, -1\)/);
});

test("Header.tsx: mobilní panel renderuje mobileLinks, desktop pill nav pořád jen links (odděleno)", () => {
  assert.match(headerSource, /const mobileLinks = buildMobileLinks\(links\);/);
  assert.match(headerSource, /\{mobileLinks\.map\(\(link\) => \{/);
});

test("Header.tsx: sekundární odkaz 'O hře' v desktop headeru je jen text (underline), ne pill styl jako hlavní nav", () => {
  const secondaryLinkBlock = headerSource.split('{O_HRE_LINK.label}')[0].split("O_HRE_LINK.href}`}")[1] ?? "";
  assert.match(secondaryLinkBlock, /underline/);
  assert.doesNotMatch(secondaryLinkBlock, /tabClass|liveTabClass/);
});

test("Footer.tsx: odkaz 'O hře' je vždy v patičce (SECONDARY_LINKS)", () => {
  assert.match(footerSource, /\{ href: "\/o-hre", label: "O hře" \}/);
});
