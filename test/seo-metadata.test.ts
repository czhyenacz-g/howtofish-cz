import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Zdrojová kontrola textu .tsx souborů — Node test runner (bez JSX
// transformu) neumí .tsx přímo importovat/spustit, takže se ověřuje
// stejným způsobem jako existující test/no-uca-token-in-client.test.ts.
function readSource(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

describe("/ a /ryby sdílí jeden zdroj obsahu", () => {
  test("app/page.tsx renderuje sdílenou RybyPageContent (ne vlastní implementaci)", () => {
    const source = readSource("../app/page.tsx");
    assert.match(source, /import RybyPageContent from ["']\.\/ryby\/RybyPageContent["']/);
    assert.match(source, /<RybyPageContent\s*\/>/);
  });

  test("app/ryby/page.tsx renderuje stejnou RybyPageContent", () => {
    const source = readSource("../app/ryby/page.tsx");
    assert.match(source, /import RybyPageContent from ["']\.\/RybyPageContent["']/);
    assert.match(source, /<RybyPageContent\s*\/>/);
  });
});

describe("canonical URL", () => {
  test("/ má canonical /ryby", () => {
    const source = readSource("../app/page.tsx");
    assert.match(source, /alternates:\s*{\s*canonical:\s*["']\/ryby["']\s*}/);
  });

  test("/ryby má canonical /ryby (ne zděděné z rootu)", () => {
    const source = readSource("../app/ryby/page.tsx");
    assert.match(source, /alternates:\s*{\s*canonical:\s*["']\/ryby["']\s*}/);
  });
});

describe("veřejné hlavní routes nejsou natrvalo noindex", () => {
  for (const layout of [
    "../app/ryby/layout.tsx",
    "../app/(sections)/layout.tsx",
    "../app/hra/layout.tsx",
    "../app/stream/layout.tsx",
  ]) {
    test(`${layout} negeneruje 'index: false' robots metadata`, () => {
      const source = readSource(layout);
      assert.ok(!source.includes("index: false"), `${layout} obsahuje index: false`);
      assert.ok(!source.includes("SITE_LAUNCHED"), `${layout} ještě odkazuje na SITE_LAUNCHED`);
    });
  }
});

describe("submission ('/navrhnout') routes zůstávají noindex", () => {
  for (const page of [
    "../app/ryby/navrhnout/page.tsx",
    "../app/(sections)/predmety/navrhnout/page.tsx",
    "../app/(sections)/bossove/navrhnout/page.tsx",
    "../app/(sections)/lokace/navrhnout/page.tsx",
    "../app/(sections)/navody/navrhnout/page.tsx",
  ]) {
    test(`${page} má robots index:false, follow:false`, () => {
      const source = readSource(page);
      assert.match(source, /index:\s*false/);
      assert.match(source, /follow:\s*false/);
    });
  }
});

describe("/o-hre", () => {
  const source = readSource("../app/(sections)/o-hre/page.tsx");

  test("existuje a je indexovatelná (žádné index:false)", () => {
    assert.ok(!source.includes("index: false"));
  });

  test("má title a description v metadata", () => {
    assert.match(source, /const TITLE =/);
    assert.match(source, /const DESCRIPTION =/);
    assert.match(source, /title: TITLE/);
    assert.match(source, /description: DESCRIPTION/);
  });

  test("má canonical /o-hre", () => {
    assert.match(source, /alternates:\s*{\s*canonical:\s*["']\/o-hre["']\s*}/);
  });

  test("jasně uvádí, že jde o neoficiální fan web", () => {
    assert.match(source, /neoficiální/i);
  });
});

describe("právní stránky existují", () => {
  test("/pravni-informace existuje", () => {
    assert.ok(existsSync(fileURLToPath(new URL("../app/(sections)/pravni-informace/page.tsx", import.meta.url))));
  });

  test("/ochrana-soukromi existuje", () => {
    assert.ok(existsSync(fileURLToPath(new URL("../app/(sections)/ochrana-soukromi/page.tsx", import.meta.url))));
  });

  test("pravni-informace zmiňuje affiliate disclosure", () => {
    const source = readSource("../app/(sections)/pravni-informace/page.tsx");
    assert.match(source, /partnerské/i);
  });

  test("ochrana-soukromi popisuje Steam přihlášení", () => {
    const source = readSource("../app/(sections)/ochrana-soukromi/page.tsx");
    assert.match(source, /Steam/);
    assert.match(source, /session/i);
  });
});

describe("/demo neexistuje jako obsahová stránka", () => {
  test("app/demo/ adresář byl odstraněn", () => {
    assert.ok(!existsSync(fileURLToPath(new URL("../app/demo", import.meta.url))));
  });
});

describe("affiliate odkazy zachovávají sponsored rel", () => {
  test("AffiliateBanner.tsx používá rel='noopener noreferrer sponsored'", () => {
    const source = readSource("../app/components/AffiliateBanner.tsx");
    assert.match(source, /rel="noopener noreferrer sponsored"/);
  });

  test("CharacterCallout.tsx používá sponsored rel pro sponsorované odkazy", () => {
    const source = readSource("../app/components/CharacterCallout.tsx");
    assert.match(source, /rel="noopener noreferrer sponsored"/);
  });
});
