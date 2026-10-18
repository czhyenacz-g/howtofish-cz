import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Root layout importuje next/font/google (síťový font fetch) — zdrojová
// kontrola, stejný vzor jako ostatní framework-vázané testy v repu.
const source = readFileSync(fileURLToPath(new URL("../app/layout.tsx", import.meta.url)), "utf8");

// Režim minimální údržby (říjen 2026): globální overlaye se nerenderují,
// jejich komponenty ale v repu zůstávají (viz app/config/features.ts).
test("layout.tsx: nerenderuje MultiplayerIslandTab, CharacterCallout ani AmbientAudioToggle", () => {
  assert.doesNotMatch(source, /<MultiplayerIslandTab/);
  assert.doesNotMatch(source, /<CharacterCallout/);
  assert.doesNotMatch(source, /<AmbientAudioToggle/);
});

test("layout.tsx: při renderu nevolá UCA (seller promotions ani asset 45)", () => {
  assert.doesNotMatch(source, /getActivePromotions/);
  assert.doesNotMatch(source, /getAssetById/);
});

test("layout.tsx: žádný sitewide robots (jinak dvojí <meta robots> na 404)", () => {
  assert.doesNotMatch(source, /robots:\s*\{/);
});

test("komponenty overlayů zůstávají v repu pro případné zapnutí", () => {
  for (const name of ["MultiplayerIslandTab", "CharacterCallout", "AmbientAudioToggle"]) {
    const path = fileURLToPath(new URL(`../app/components/${name}.tsx`, import.meta.url));
    assert.ok(readFileSync(path, "utf8").length > 0, name);
  }
});
