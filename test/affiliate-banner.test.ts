import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Node test runner neumí .tsx s JSX přímo spustit (žádné DOM/RTL v
// projektu) — ověřuje se zdrojově, stejný vzor jako test/ad-slot.test.ts.
const source = readFileSync(fileURLToPath(new URL("../app/components/AffiliateBanner.tsx", import.meta.url)), "utf8");

describe("AffiliateBanner — href je volitelný (affiliate odkazy zatím nemusí existovat)", () => {
  test("prop typ má href jako volitelný (href?:), ne povinný", () => {
    assert.match(source, /href\?:\s*string/);
  });

  test("bez href renderuje <div> (neklikací), ne <a>", () => {
    assert.match(source, /if \(!href\) \{\s*return \(\s*<div/);
  });

  test("s href renderuje <a> se sponsored rel", () => {
    assert.match(source, /<a\s/);
    assert.match(source, /rel="noopener noreferrer sponsored"/);
    assert.match(source, /target="_blank"/);
  });

  test("neklikací <div> variantu neobsahuje sponsored rel (ten patří jen ke skutečnému odkazu)", () => {
    const divBranch = /if \(!href\) \{([\s\S]*?)\n {2}\}\n\n {2}return \(/.exec(source);
    assert.ok(divBranch, "nepodařilo se najít větev 'if (!href) { ... }'");
    assert.doesNotMatch(divBranch[1], /rel="noopener noreferrer sponsored"/);
  });
});

describe("AffiliateBanner — data-promotion-banner atribut (seller callout koordinace)", () => {
  test("obě varianty (s href i bez) mají data-promotion-banner=\"true\"", () => {
    const matches = source.match(/data-promotion-banner="true"/g) ?? [];
    assert.equal(matches.length, 2, "očekávány přesně 2 výskyty (<div> i <a> větev)");
  });
});
