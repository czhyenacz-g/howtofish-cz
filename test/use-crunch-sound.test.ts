import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// "use client" (Web Audio API) — zdrojová kontrola, stejný vzor jako
// ostatní framework-vázané testy v repu (viz test/ad-slot.test.ts).
const source = readFileSync(fileURLToPath(new URL("../app/hra/useCrunchSound.ts", import.meta.url)), "utf8");

test("useCrunchSound.ts: CRUNCH_SOUND_URL míří na existující soubor v public/audio", () => {
  const match = /const CRUNCH_SOUND_URL = "([^"]+)";/.exec(source);
  assert.ok(match, "nepodařilo se najít CRUNCH_SOUND_URL");
  const publicPath = fileURLToPath(new URL(`../public${match[1]}`, import.meta.url));
  assert.ok(existsSync(publicPath), `soubor ${publicPath} neexistuje`);
});

test("useCrunchSound.ts: playCrunch přehrává reálnou nahrávku (decodeAudioData), ne syntetický noise-burst", () => {
  assert.match(source, /decodeAudioData/);
  assert.doesNotMatch(source, /createBiquadFilter/);
});

test("useCrunchSound.ts: dekódovaný buffer se cachuje (bufferRef), nestahuje se opakovaně při každém přehrání", () => {
  assert.match(source, /bufferRef\.current = decoded/);
  assert.match(source, /if \(bufferRef\.current\) return Promise\.resolve\(bufferRef\.current\);/);
});

test("useCrunchSound.ts: chyba stažení/dekódování se odchytí (.catch), nikdy nespadne", () => {
  const bufferFn = /const ensureCrunchBuffer = useCallback\(\(ctx: AudioContext\)[\s\S]*?\n  \}, \[\]\);/.exec(
    source
  )?.[0];
  assert.ok(bufferFn, "nepodařilo se najít ensureCrunchBuffer");
  assert.match(bufferFn, /\.catch\(\(\) => null\)/);
});

test("useCrunchSound.ts: playLifeLost zůstává syntetický (oscilátor), beze změny", () => {
  const lifeLostFn = /const playLifeLost = useCallback\(\(\) => \{[\s\S]*?\n  \}, \[enabled, ensureContext\]\);/.exec(
    source
  )?.[0];
  assert.ok(lifeLostFn, "nepodařilo se najít playLifeLost");
  assert.match(lifeLostFn, /createOscillator/);
});
