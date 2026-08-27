import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// "use client" — zdrojová kontrola, stejný vzor jako ostatní
// framework-vázané testy v repu (viz test/ad-slot.test.ts). Herní
// logika (applyHoverDodge) je testovaná přímo v crab-rush-engine.test.ts.
const source = readFileSync(fileURLToPath(new URL("../app/hra/CrabRushGame.tsx", import.meta.url)), "utf8");

test("CrabRushGame.tsx: najetí myší na kraba volá applyHoverDodge (šance na uhnutí navíc k pravidelným posunům)", () => {
  assert.match(source, /import \{[\s\S]*applyHoverDodge[\s\S]*\} from "\.\/crab-rush-engine"/);
  assert.match(source, /onMouseEnter=\{\(\) => handleCrabHover\(crab\.id\)\}/);
  assert.match(source, /setGameState\(\(prev\) => applyHoverDodge\(prev, crabId\)\)/);
});

test("CrabRushGame.tsx: kořenový element má select-none — rychlé klikání/tažení myší po ploše neoznačuje text", () => {
  assert.match(source, /<div className="select-none">/);
});

test("CrabRushGame.tsx: handleStart i handleRestart volají markGameStarted (postava na /hra se přestane nabízet)", () => {
  assert.match(source, /import \{ markGameStarted, resetGameStarted \} from "\.\.\/\.\.\/lib\/character-callouts\/game-session"/);
  const matches = source.match(/markGameStarted\(\);/g) ?? [];
  assert.equal(matches.length, 2, "očekávány 2 výskyty (handleStart + handleRestart)");
});

test("CrabRushGame.tsx: mount efekt volá resetGameStarted (čerstvá návštěva /hra vždy začíná bez suprese postavy)", () => {
  assert.match(source, /useEffect\(\(\) => \{\s*resetGameStarted\(\);\s*\}, \[\]\);/);
});
