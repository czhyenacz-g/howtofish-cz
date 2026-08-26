import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// "use client" + next/image/next/navigation — nejde přímo naimportovat
// pod --conditions=react-server, viz test/use-banner-visible.test.ts pro
// stejný důvod. Zdrojová kontrola, stejný vzor jako ostatní
// framework-vázané testy v repu.
const source = readFileSync(fileURLToPath(new URL("../app/components/MultiplayerIslandTab.tsx", import.meta.url)), "utf8");

test("MultiplayerIslandTab.tsx: je 'use client' (usePathname + hover/focus interakce)", () => {
  const firstLine = source.trimStart().split("\n")[0];
  assert.match(firstLine, /^["']use client["']/);
});

test("MultiplayerIslandTab.tsx: fallback — bez imageUrl se nevyrenderuje nic (časný return null, žádný placeholder)", () => {
  const guard = /if \(!imageUrl\) return null;/.exec(source);
  assert.ok(guard, "očekáván časný return null pro chybějící imageUrl");
});

test("MultiplayerIslandTab.tsx: na samotné /multiplayer route (a podroutách) se nevyrenderuje", () => {
  assert.match(source, /const MULTIPLAYER_ROUTE = "\/multiplayer";/);
  assert.match(source, /if \(isMultiplayerRoute\(pathname\)\) return null;/);
  assert.match(
    source,
    /pathname === MULTIPLAYER_ROUTE \|\| pathname\.startsWith\(`\$\{MULTIPLAYER_ROUTE\}\/`\)/
  );
});

test("MultiplayerIslandTab.tsx: oba varianty (desktop/tablet i mobile) vedou na MULTIPLAYER_ROUTE přes next/link Link", () => {
  assert.match(source, /import Link from "next\/link"/);
  const hrefMatches = source.match(/href=\{MULTIPLAYER_ROUTE\}/g) ?? [];
  assert.equal(hrefMatches.length, 2, "očekávány přesně 2 <Link href={MULTIPLAYER_ROUTE}>");
  // Nikdy target="_blank" — klik nesmí otevírat nový tab (viz zadání).
  assert.doesNotMatch(source, /target=["']_blank["']/);
});

test("MultiplayerIslandTab.tsx: accessibility — aria-label 'Multiplayer ostrov' a alt text s popisem", () => {
  const ariaLabelMatches = source.match(/aria-label="Multiplayer ostrov"/g) ?? [];
  assert.equal(ariaLabelMatches.length, 2);
  assert.match(source, /const ALT_TEXT = "Multiplayer ostrov – hraj s ostatními";/);
});

test("MultiplayerIslandTab.tsx: viditelný focus state (focus-visible:ring), ne jen odstraněný outline", () => {
  const focusBlocks = source.match(/focus-visible:outline-none[^"]*"/g) ?? [];
  assert.ok(focusBlocks.length >= 2, "očekávány focus-visible bloky pro obě varianty");
  for (const block of focusBlocks) {
    assert.match(block, /focus-visible:ring-2/, `chybí náhradní focus ring: ${block}`);
  }
});

test("MultiplayerIslandTab.tsx: desktop/tablet varianta je fixed, right-0, se z-30 a translate-x v doporučeném rozsahu", () => {
  assert.match(source, /fixed right-0 top-1\/2 z-30/);
  assert.match(source, /translate-x-\[68%\] lg:translate-x-\[60%\]/);
});

test("MultiplayerIslandTab.tsx: hover i keyboard focus vysouvají tab na translate-x-0 s plynulou animací (200-350ms)", () => {
  assert.match(source, /hover:translate-x-0/);
  assert.match(source, /focus-visible:translate-x-0/);
  assert.match(source, /duration-300/);
});

test("MultiplayerIslandTab.tsx: respektuje prefers-reduced-motion (motion-reduce:transition-none)", () => {
  assert.match(source, /motion-reduce:transition-none/);
});

test("MultiplayerIslandTab.tsx: při otevřeném profesorovi/selleru (calloutOpen) se desktop tab víc zasune a mobile tlačítko schová", () => {
  assert.match(source, /import \{ useCharacterCalloutOpen \} from "\.\/useCharacterCalloutOpen"/);
  assert.match(source, /calloutOpen \? "translate-x-\[88%\]"/);
  assert.match(source, /calloutOpen \? "pointer-events-none opacity-0" : "opacity-100"/);
});

test("MultiplayerIslandTab.tsx: mobile varianta je kompaktní (56-72px rozsah) a kulatá", () => {
  assert.match(source, /h-16 w-16/); // 64px, v rozsahu 56-72px
  assert.match(source, /rounded-full/);
  assert.match(source, /sm:hidden/);
});

test("MultiplayerIslandTab.tsx: mobile tlačítko je nad AmbientAudioToggle/minimalizovanou postavou (bottom-24, ne bottom-2/bottom-4)", () => {
  assert.match(source, /bottom-24/);
});

test("MultiplayerIslandTab.tsx: žádné click tracking / impressions / analytics (jen navigace přes Link)", () => {
  assert.doesNotMatch(source, /onClick|gtag|goatcounter|analytics|track/i);
});

test("MultiplayerIslandTab.tsx: obrázek jde přes next/image (Image), ne přes hardcoded <img>", () => {
  assert.match(source, /import Image from "next\/image"/);
  assert.doesNotMatch(source, /<img\s/);
});
