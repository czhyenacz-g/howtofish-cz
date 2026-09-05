import { test, describe } from "node:test";
import assert from "node:assert/strict";
import sitemap from "../app/sitemap.ts";
import { SITE_URL } from "../app/config/site.ts";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  test("obsahuje /ryby jako kanonickou hlavní stránku", () => {
    assert.ok(urls.some((u) => u.endsWith("/ryby")));
  });

  test("obsahuje /o-hre", () => {
    assert.ok(urls.some((u) => u.endsWith("/o-hre")));
  });

  test("neobsahuje /demo", () => {
    assert.ok(!urls.some((u) => u.includes("/demo")));
  });

  test("neobsahuje žádnou /navrhnout routu", () => {
    assert.ok(!urls.some((u) => u.includes("/navrhnout")));
  });

  test("neobsahuje /aktualizace (zatím jen placeholder)", () => {
    assert.ok(!urls.some((u) => u.endsWith("/aktualizace")));
  });

  test("obsahuje hlavní sekce (predmety, bossove, lokace, navody, achievementy)", () => {
    for (const path of ["/predmety", "/bossove", "/lokace", "/navody", "/achievementy"]) {
      assert.ok(urls.some((u) => u.endsWith(path)), `chybí ${path}`);
    }
  });

  test("obsahuje /hra a /stream", () => {
    assert.ok(urls.some((u) => u.endsWith("/hra")));
    assert.ok(urls.some((u) => u.endsWith("/stream")));
  });

  test("obsahuje detail alespoň jedné ryby", () => {
    assert.ok(urls.some((u) => u.includes("/ryby/") && !u.endsWith("/ryby/")));
  });

  // Homepage má teď vlastní unikátní obsah (streameři/live), takže na
  // rozdíl od dřívějška PATŘÍ do sitemap s vlastním canonical na "/"
  // (viz app/page.tsx, app/sitemap.ts) — už není duplicita /ryby.
  test("homepage (/) je v sitemap přesně jednou, s vlastní URL (ne canonical redirect na /ryby)", () => {
    const homepageMatches = urls.filter((u) => u === SITE_URL || u === `${SITE_URL}/`);
    assert.equal(homepageMatches.length, 1);
  });

  test("obsahuje /streameri (katalog tvůrců)", () => {
    assert.ok(urls.some((u) => u.endsWith("/streameri")));
  });

  test("obsahuje nové streamer profily na /streameri/{slug} (haiset, kapesnik69, fattypillow, marwex) — bývalé /stream/{slug} teď trvale přesměrovává (next.config.ts)", () => {
    for (const slug of ["haiset", "kapesnik69", "fattypillow", "marwex"]) {
      assert.ok(urls.some((u) => u.endsWith(`/streameri/${slug}`)), `chybí /streameri/${slug}`);
    }
  });

  test("obsahuje nové CZ/SK creator pages na /streameri/{slug} (housebox, astatoro, 2sekundovymato, anymall, boshoo)", () => {
    for (const slug of ["housebox", "astatoro", "2sekundovymato", "anymall", "boshoo"]) {
      assert.ok(urls.some((u) => u.endsWith(`/streameri/${slug}`)), `chybí /streameri/${slug}`);
    }
  });

  test("neobsahuje /streameri/touken (creator candidate, žádný ověřený důkaz)", () => {
    assert.ok(!urls.some((u) => u.endsWith("/streameri/touken")));
  });

  test("neobsahuje žádnou starou /stream/{slug} URL (jen /stream samotné, live agregátor)", () => {
    assert.ok(!urls.some((u) => /\/stream\/[^/]+$/.test(u)));
  });

  test("obsahuje /streameri/pixelorezlive", () => {
    assert.ok(urls.some((u) => u.endsWith("/streameri/pixelorezlive")));
  });

  test("obsahuje nová HouseBox video videa (/videa/housebox-how-to-fish-1, /videa/housebox-how-to-fish-3)", () => {
    for (const slug of ["housebox-how-to-fish-1", "housebox-how-to-fish-3"]) {
      assert.ok(urls.some((u) => u.endsWith(`/videa/${slug}`)), `chybí /videa/${slug}`);
    }
  });

  test("žádné URL v sitemap se neopakuje (žádné duplicity)", () => {
    assert.equal(new Set(urls).size, urls.length);
  });

  test("žádné URL v sitemap neobsahuje localhost", () => {
    assert.ok(!urls.some((u) => u.includes("localhost")));
  });

  test("obsahuje jen indexable video detaily z data/how-to-fish-videos.ts", () => {
    for (const slug of [
      "flygun-rybareni-zabavny",
      "flygun-lethal-company-haiset",
      "to-nejlepsi-z-how-to-fish-sestrih",
      "how-to-fish-1-herdyn-archiv",
    ]) {
      assert.ok(urls.some((u) => u.endsWith(`/videa/${slug}`)), `chybí /videa/${slug}`);
    }
  });
});
