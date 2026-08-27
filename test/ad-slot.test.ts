import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../app/components/AdSlot.tsx", import.meta.url)), "utf8");

test("AdSlot.tsx: je Server Component (žádná 'use client' direktiva) — kandidáti se načítají jen server-side", () => {
  const firstLine = source.trimStart().split("\n")[0];
  assert.doesNotMatch(firstLine, /^["']use client["']/);
});

test("AdSlot.tsx: načítá VŠECHNY aktivní banner promotions (ne jen jednu vybranou), initialPick spočítá stejným pickPromotion jako dřív", () => {
  assert.match(source, /getActivePromotions\("banner"\)/);
  assert.match(source, /import \{ pickPromotion \} from "\.\.\/\.\.\/lib\/promotions\/match-route"/);
  assert.match(source, /const initialPick = pickPromotion\(candidates, pathname\);/);
});

test("AdSlot.tsx: nepadá, když je UCA nedostupné (graceful fallback na prázdný seznam)", () => {
  assert.match(source, /\.catch\(\(\) => \[\]\)/);
});

test("AdSlot.tsx: předává výběr klientské AffiliateBannerSlot, remountované per pathname (key={pathname})", () => {
  assert.match(source, /import AffiliateBannerSlot from "\.\/AffiliateBannerSlot"/);
  assert.match(
    source,
    /<AffiliateBannerSlot key=\{pathname\} candidates=\{candidates\} pathname=\{pathname\} initialPick=\{initialPick\} \/>/
  );
});

test("AdPlaceholder.tsx: nemá data-promotion-banner (není to skutečná reklama, seller ho nemá blokovat)", () => {
  const placeholderSource = readFileSync(
    fileURLToPath(new URL("../app/components/AdPlaceholder.tsx", import.meta.url)),
    "utf8"
  );
  assert.doesNotMatch(placeholderSource, /data-promotion-banner/);
});
