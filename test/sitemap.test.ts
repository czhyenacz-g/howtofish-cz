import { test, describe } from "node:test";
import assert from "node:assert/strict";
import sitemap from "../app/sitemap.ts";

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

  test("homepage (/) není v sitemap duplicitně vůči /ryby", () => {
    assert.ok(!urls.some((u) => /https?:\/\/[^/]+\/$/.test(u)));
  });

  test("obsahuje nové streamer profily (haiset, kapesnik69, fattypillow, marwex)", () => {
    for (const slug of ["haiset", "kapesnik69", "fattypillow", "marwex"]) {
      assert.ok(urls.some((u) => u.endsWith(`/stream/${slug}`)), `chybí /stream/${slug}`);
    }
  });

  test("obsahuje nové CZ/SK creator pages (housebox, astatoro, 2sekundovymato, anymall, boshoo)", () => {
    for (const slug of ["housebox", "astatoro", "2sekundovymato", "anymall", "boshoo"]) {
      assert.ok(urls.some((u) => u.endsWith(`/stream/${slug}`)), `chybí /stream/${slug}`);
    }
  });

  test("neobsahuje /stream/touken (creator candidate, žádný ověřený důkaz)", () => {
    assert.ok(!urls.some((u) => u.endsWith("/stream/touken")));
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
