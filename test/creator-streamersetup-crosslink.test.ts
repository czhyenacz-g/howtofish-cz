// Crosslink z HowToFish.cz creator detailu na StreamerSetup.cz (zadání
// bod 21/22 "detail → detail propojení mezi projekty") — .tsx komponenty
// se v tomhle projektu nedají přímo importovat do testů, ověřuje se nad
// zdrojovým textem, stejný vzorec jako test/stream-page-seo.test.ts.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../app/streameri/[slug]/page.tsx", import.meta.url)), "utf8");

describe("crosslink na StreamerSetup.cz", () => {
  test("odkaz existuje a je podmíněný creator.streamerSetupSlug (ne nepodmíněná zmínka brandu)", () => {
    const hrefIndex = source.indexOf("https://streamersetup.cz/streameri/${creator.streamerSetupSlug}");
    assert.ok(hrefIndex >= 0, "chybí crosslink href na streamersetup.cz/streameri/{slug}");
    const guardIndex = source.lastIndexOf("{creator.streamerSetupSlug &&", hrefIndex);
    assert.ok(guardIndex >= 0 && guardIndex < hrefIndex, "crosslink musí být podmíněný creator.streamerSetupSlug");
  });

  test("otevírá se v nové kartě (jiná doména, sesterský projekt)", () => {
    const blockStart = source.indexOf("{creator.streamerSetupSlug &&");
    const block = source.slice(blockStart, blockStart + 400);
    assert.match(block, /target="_blank"/);
    assert.match(block, /rel="noopener noreferrer"/);
  });
});
