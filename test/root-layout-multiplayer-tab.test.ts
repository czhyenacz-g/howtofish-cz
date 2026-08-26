import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Root layout importuje next/font/google (síťový font fetch) — zdrojová
// kontrola, stejný vzor jako ostatní framework-vázané testy v repu.
const source = readFileSync(fileURLToPath(new URL("../app/layout.tsx", import.meta.url)), "utf8");

test("layout.tsx: načítá UCA asset 45 přes getAssetById (existující UCA mechanismus, žádný nový endpoint)", () => {
  assert.match(source, /import \{ getAssetById \} from "\.\.\/lib\/universal-content-api\/assets";/);
  assert.match(source, /const MULTIPLAYER_ISLAND_TAB_ASSET_ID = 45;/);
  assert.match(source, /getAssetById\(MULTIPLAYER_ISLAND_TAB_ASSET_ID\)/);
});

test("layout.tsx: fetch selhání se bezpečně odchytí (.catch), nikdy nerozbije stránku", () => {
  const fetchLine = /const multiplayerIslandAsset = await getAssetById\([^)]*\)([^;]*);/.exec(source)?.[0] ?? "";
  assert.match(fetchLine, /\.catch\(\(\) => null\)/);
});

test("layout.tsx: MultiplayerIslandTab je součástí root layoutu vedle CharacterCallout/AmbientAudioToggle", () => {
  assert.match(source, /import MultiplayerIslandTab from "\.\/components\/MultiplayerIslandTab";/);
  assert.match(source, /<MultiplayerIslandTab imageUrl=\{multiplayerIslandAsset\?\.imageUrl \?\? null\} \/>/);
});
