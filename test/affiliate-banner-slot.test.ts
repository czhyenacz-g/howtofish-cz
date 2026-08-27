import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// "use client" + fetch-free localStorage/DOM logika — zdrojová kontrola,
// stejný vzor jako ostatní framework-vázané testy v repu (viz
// test/ad-slot.test.ts).
const source = readFileSync(fileURLToPath(new URL("../app/components/AffiliateBannerSlot.tsx", import.meta.url)), "utf8");

test("AffiliateBannerSlot.tsx: je 'use client'", () => {
  const firstLine = source.trimStart().split("\n")[0];
  assert.match(firstLine, /^["']use client["']/);
});

test("AffiliateBannerSlot.tsx: initialPick je počáteční state (SSR/první render nikdy nebliká, žádný los navíc)", () => {
  assert.match(source, /useState<PromotionEntry \| null>\(initialPick\)/);
});

test("AffiliateBannerSlot.tsx: po mountu přehodnotí výběr JEN pokud je initialPick prokliknutý (isPromotionRecentlyClicked), jinak nechá initialPick beze změny", () => {
  const effectBody = /useEffect\(\(\) => \{([\s\S]*?)\n {2}\}, \[\]\);/.exec(source)?.[1];
  assert.ok(effectBody, "nepodařilo se najít mount effect");
  assert.match(effectBody, /if \(!promotion\) return;/);
  assert.match(effectBody, /if \(!isPromotionRecentlyClicked\(promotion\.id\)\) return;/);
  assert.match(effectBody, /excludeRecentlyClicked\(candidates\)/);
  assert.match(effectBody, /setPromotion\(pickPromotion\(available, pathname\)\)/);
});

test("AffiliateBannerSlot.tsx: mount effect běží jen jednou (prázdné deps), ne při každém re-renderu", () => {
  assert.match(source, /\}, \[\]\);/);
});

test("AffiliateBannerSlot.tsx: klik zapisuje markPromotionClicked i affiliate_click event, ne při renderu", () => {
  const beforeHandleClick = source.split("function handleClick()")[0];
  // markPromotionClicked/trackClientEvent se nesmí volat nikde mimo handleClick (a mount efekt níž ho taky nevolá).
  assert.doesNotMatch(beforeHandleClick, /markPromotionClicked\(/);
  assert.doesNotMatch(beforeHandleClick, /trackClientEvent\(/);
  const handleClickBody = /function handleClick\(\) \{([\s\S]*?)\n {2}\}/.exec(source)?.[1];
  assert.ok(handleClickBody, "nepodařilo se najít handleClick");
  assert.match(handleClickBody, /markPromotionClicked\(promotion\.id\)/);
  assert.match(
    handleClickBody,
    /trackClientEvent\("affiliate_click", \{ metadata: \{ promotion_id: promotion\.id, placement: "banner" \} \}\)/
  );
});

test("AffiliateBannerSlot.tsx: onClick se předává AffiliateBanner jen když promotion má href (bez href není co proklikávat)", () => {
  assert.match(source, /onClick=\{promotion\.href \? handleClick : undefined\}/);
});

test("AffiliateBannerSlot.tsx: fallback placeholder je volitelný (placeholderOnEmpty, default true)", () => {
  assert.match(source, /placeholderOnEmpty = true/);
  assert.match(source, /return placeholderOnEmpty \? <AdPlaceholder \/> : null;/);
});

test("AffiliateBannerSlot.tsx: žádný preventDefault (middle-click/Ctrl+click/target=_blank musí fungovat normálně)", () => {
  assert.doesNotMatch(source, /preventDefault/);
});
