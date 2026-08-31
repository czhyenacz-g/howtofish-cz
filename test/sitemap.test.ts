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
});
