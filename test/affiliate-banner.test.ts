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

  test("bez href renderuje <div> (neklikací), ne <a>/<Link>", () => {
    assert.match(source, /if \(!href\) \{\s*return \(\s*<div/);
  });

  test("s externím href renderuje <a> se sponsored rel a target=_blank", () => {
    assert.match(source, /<a\s/);
    assert.match(source, /rel="noopener noreferrer sponsored"/);
    assert.match(source, /target="_blank"/);
  });

  test("s interním href (isExternalHref === false) renderuje Next <Link>, bez sponsored rel a bez target=_blank", () => {
    assert.match(source, /import Link from "next\/link";/);
    assert.match(source, /if \(!isExternalHref\(href\)\) \{/);
    const linkBranch = /if \(!isExternalHref\(href\)\) \{([\s\S]*?)\n {2}\}\n\n {2}return \(/.exec(source);
    assert.ok(linkBranch, "nepodařilo se najít větev interního <Link>");
    assert.match(linkBranch[1], /<Link\s/);
    assert.doesNotMatch(linkBranch[1], /rel="noopener noreferrer sponsored"/);
    assert.doesNotMatch(linkBranch[1], /target="_blank"/);
  });

  test("neklikací <div> variantu neobsahuje sponsored rel (ten patří jen ke skutečnému externímu odkazu)", () => {
    const divBranch = /if \(!href\) \{([\s\S]*?)\n {2}\}\n\n {2}const linkClassName/.exec(source);
    assert.ok(divBranch, "nepodařilo se najít větev 'if (!href) { ... }'");
    assert.doesNotMatch(divBranch[1], /rel="noopener noreferrer sponsored"/);
  });
});

describe("AffiliateBanner — data-promotion-banner atribut (seller callout koordinace)", () => {
  test("všechny tři varianty (div, interní Link, externí a) mají data-promotion-banner=\"true\"", () => {
    const matches = source.match(/data-promotion-banner="true"/g) ?? [];
    assert.equal(matches.length, 3, "očekávány přesně 3 výskyty (<div>, <Link>, <a>)");
  });
});

describe("AffiliateBanner — onClick (7denní vyřazení prokliknuté promotion)", () => {
  test("onClick je volitelný prop, prochází beze změny", () => {
    assert.match(source, /onClick\?:\s*\(\)\s*=>\s*void/);
  });

  test("onClick se předává na obě klikací varianty (interní Link i externí a), ne na neklikací <div>", () => {
    const anchorBranch = /return \(\s*<a[\s\S]*?<\/a>\s*\);/.exec(source)?.[0] ?? "";
    assert.match(anchorBranch, /onClick=\{onClick\}/);

    const linkBranch = /if \(!isExternalHref\(href\)\) \{([\s\S]*?)\n {2}\}\n\n {2}return \(/.exec(source)?.[1] ?? "";
    assert.match(linkBranch, /onClick=\{onClick\}/);

    const divBranch = /if \(!href\) \{([\s\S]*?)\n {2}\}\n\n {2}const linkClassName/.exec(source)?.[1] ?? "";
    assert.doesNotMatch(divBranch, /onClick=\{onClick\}/);
  });
});
