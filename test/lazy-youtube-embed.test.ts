import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// LazyYouTubeEmbed je "use client" s useState — stejné omezení jako
// Header.tsx (viz test/header-nav.test.ts), zdrojová kontrola.
const embedSource = readFileSync(
  fileURLToPath(new URL("../app/components/LazyYouTubeEmbed.tsx", import.meta.url)),
  "utf8"
);
const cardSource = readFileSync(
  fileURLToPath(new URL("../app/components/HowToFishVideoCard.tsx", import.meta.url)),
  "utf8"
);

describe("LazyYouTubeEmbed", () => {
  test("iframe se renderuje jen podmíněně (playing state), ne vždy", () => {
    assert.match(embedSource, /if \(playing\) \{/);
  });

  test("používá youtube-nocookie.com (privacy-enhanced embed)", () => {
    assert.match(embedSource, /youtube-nocookie\.com/);
  });

  test("výchozí stav (playing=false) ukazuje thumbnail, ne iframe", () => {
    assert.match(embedSource, /useState\(false\)/);
  });
});

describe("HowToFishVideoCard", () => {
  test("karta videa nepoužívá iframe (jen thumbnail) — žádné vícenásobné eager embedy v gridu", () => {
    assert.doesNotMatch(cardSource, /<iframe/);
  });

  test("karta jasně uvádí autora videa", () => {
    assert.match(cardSource, /Video: \{video\.author\.name\}/);
  });
});
