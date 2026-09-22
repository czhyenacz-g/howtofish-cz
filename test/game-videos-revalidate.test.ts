import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Zdrojová kontrola interního revalidačního endpointu a jeho napojení v CLI
// (spuštění samotného Next route handleru v node:test nejde).

function readSource(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const ENDPOINT = "../app/api/game-videos/revalidate/route.ts";
const CLI = "../scripts/game-videos-review.ts";

describe("revalidační endpoint /api/game-videos/revalidate", () => {
  test("existuje a je to POST-only route handler", () => {
    assert.ok(existsSync(fileURLToPath(new URL(ENDPOINT, import.meta.url))), "chybí route.ts");
    const source = readSource(ENDPOINT);
    assert.match(source, /export async function POST\(request: Request\)/);
    assert.doesNotMatch(source, /export (async )?function GET/);
  });

  test("je fail-closed: bez nastaveného secretu vždy 401", () => {
    const source = readSource(ENDPOINT);
    assert.match(source, /const secret = process\.env\.GAME_REVALIDATE_SECRET/);
    assert.match(source, /if \(!secret \|\| !provided \|\| !secretsMatch\(provided, secret\)\)/);
    assert.match(source, /status: 401/);
  });

  test("secret se porovnává v konstantním čase", () => {
    const source = readSource(ENDPOINT);
    assert.match(source, /import \{ timingSafeEqual \} from "node:crypto"/);
    assert.match(source, /timingSafeEqual\(providedBuffer, expectedBuffer\)/);
    assert.ok(!/provided === secret/.test(source), "nesmí porovnávat řetězce přes ===");
  });

  test("revalidovat umí jen existující detail hry (žádná libovolná cesta)", () => {
    const source = readSource(ENDPOINT);
    assert.match(source, /getGameBySlug\(slug\)/);
    assert.match(source, /hasGameDetailPage\(game\)/);
    assert.match(source, /status: 400/);
    assert.match(source, /revalidatePath\(`\/games\/\$\{game\.slug\}`\)/);
    assert.doesNotMatch(source, /revalidatePath\(slug\)/, "nikdy nerevalidovat syrový vstup");
  });

  test("slug ze vstupu je omezený (délka i typ)", () => {
    const source = readSource(ENDPOINT);
    assert.match(source, /typeof slug !== "string"/);
    assert.match(source, /slug\.length > 120/);
  });
});

describe("CLI napojení revalidace", () => {
  const source = readSource(CLI);

  test("revalidace je opt-in — bez secretu se jen vypíše poznámka", () => {
    assert.match(source, /if \(!secret\) \{[\s\S]*?revalidace přeskočena/);
  });

  test("volá interní endpoint s hlavičkou x-revalidate-secret a jen game slug", () => {
    assert.match(source, /\/api\/game-videos\/revalidate/);
    assert.match(source, /"x-revalidate-secret": secret/);
    assert.match(source, /body: JSON\.stringify\(\{ slug \}\)/);
  });

  test("secret nikdy není v kódu natvrdo ani se nevypisuje", () => {
    assert.doesNotMatch(source, /GAME_REVALIDATE_SECRET\s*=\s*["']/);
    assert.doesNotMatch(source, /console\.(log|error)\([^)]*secret/);
  });

  test("secret se nikdy neobjeví v klientském bundlu (žádný 'use client' soubor ho nezmiňuje)", () => {
    const clientFiles = [
      "../app/components/GameVideosSection.tsx",
      "../app/components/GameCard.tsx",
      "../app/components/GameCover.tsx",
      "../app/(sections)/hry-s-rybarenim/GameSuggestForm.tsx",
      "../app/components/RotatingQuote.tsx",
    ];
    for (const path of clientFiles) {
      const clientSource = readSource(path);
      assert.ok(!clientSource.includes("GAME_REVALIDATE_SECRET"), `${path} zmiňuje secret`);
      assert.ok(!clientSource.includes("GAME_REVALIDATE_URL"), `${path} zmiňuje revalidační URL`);
    }
  });

  test("revalidace se volá po approve i po reject", () => {
    assert.match(source, /await revalidateGameDetail\(video\.gameSlug\)/);
  });
});
