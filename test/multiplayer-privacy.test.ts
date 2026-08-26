import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Zdrojová kontrola: anonymní větev app/(sections)/multiplayer/page.tsx
// nesmí nikde předat pole jednotlivých hráčů (nick/avatar/Steam profil)
// žádné komponentě — jen number (count). Node test runner neumí .tsx
// s JSX přímo spustit, takže se ověřuje textově — stejný vzor jako
// test/no-uca-token-in-client.test.ts.
const source = readFileSync(
  fileURLToPath(new URL("../app/(sections)/multiplayer/page.tsx", import.meta.url)),
  "utf8"
);

describe("/multiplayer — anonym nikdy nedostane hráčská data", () => {
  const anonBranchStart = source.indexOf("if (!user) {");
  const loggedInBranchStart = source.indexOf("const [presences, incomingWaves]", anonBranchStart);

  test("anonymní větev existuje a je řešena samostatně", () => {
    assert.ok(anonBranchStart !== -1, "chybí 'if (!user) {' větev");
    assert.ok(loggedInBranchStart > anonBranchStart, "nepodařilo se najít hranici anonymní/přihlášené větve");
  });

  const anonBranch = source.slice(anonBranchStart, loggedInBranchStart);

  test("anonymní větev nerenderuje MultiplayerBoard (celý board je jen za přihlášením)", () => {
    assert.doesNotMatch(anonBranch, /<MultiplayerBoard/);
  });

  test("MultiplayerBoard se v souboru objeví přesně jednou (jen v přihlášené větvi)", () => {
    const matches = source.match(/<MultiplayerBoard/g) ?? [];
    assert.equal(matches.length, 1);
  });

  test("anonym dostává jen počet (.length), ne pole hráčů", () => {
    assert.match(anonBranch, /getActivePresences\(\)\)\.length/);
  });

  test("anonymní větev nikde neodkazuje na jednotlivá hráčská pole (steamId/nickname/avatarUrl)", () => {
    assert.doesNotMatch(anonBranch, /\.steamId|\.nickname|\.avatarUrl/);
  });
});

describe("/multiplayer — SEO metadata", () => {
  test("má title, description, canonical a OG image", () => {
    assert.match(source, /alternates:\s*{\s*canonical:\s*["']\/multiplayer["']\s*}/);
    assert.match(source, /const TITLE =/);
    assert.match(source, /const DESCRIPTION =/);
    assert.match(source, /openGraph:/);
  });
});
