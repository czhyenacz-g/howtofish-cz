import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Statická pojistka: žádný "use client" soubor nesmí hodnotově
// importovat client.ts/catches.ts (kde žije UNIVERSAL_CONTENT_API_TOKEN
// a síťová volání) — types.ts je jen typy a `import type` se stejně
// úplně smaže při kompilaci, to bezpečně projít smí.
// client.ts navíc importuje "server-only", takže by build stejně
// spadl, kdyby se to stalo — tenhle test je jen rychlejší, konkrétnější
// signál při code review/CI.
const appDir = fileURLToPath(new URL("../app", import.meta.url));
const UNSAFE_IMPORT_PATTERN = /universal-content-api\/(client|catches)(\.ts)?["']/;

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  let files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files = files.concat(walk(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

test("žádná 'use client' komponenta hodnotově neimportuje client.ts/catches.ts", () => {
  const offenders: string[] = [];
  for (const file of walk(appDir)) {
    const content = readFileSync(file, "utf8");
    const firstLine = content.trimStart().split("\n")[0];
    if (!/^["']use client["']/.test(firstLine)) continue;

    const hasUnsafeImport = content
      .split("\n")
      .some((line) => UNSAFE_IMPORT_PATTERN.test(line) && !/^\s*import\s+type\b/.test(line));

    if (hasUnsafeImport) offenders.push(file);
  }
  assert.deepEqual(offenders, []);
});

test("lib/universal-content-api/client.ts je označen jako server-only", () => {
  const content = readFileSync(fileURLToPath(new URL("../lib/universal-content-api/client.ts", import.meta.url)), "utf8");
  assert.match(content, /import\s+["']server-only["']/);
});
