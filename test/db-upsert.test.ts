import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// upsertSteamUser používá @vercel/postgres, které potřebuje reálné
// DATABASE_URL — bez skutečné DB tenhle test spouštět nejde. Klíčová
// bezpečnostní vlastnost (is_blocked se NIKDY nepřepisuje přihlášením)
// je ale ověřitelná staticky: kontrolujeme přesný tvar SQL dotazu.
const dbSourcePath = fileURLToPath(new URL("../lib/auth/db.ts", import.meta.url));
const source = readFileSync(dbSourcePath, "utf8");

test("upsertSteamUser: UPDATE větev (ON CONFLICT DO UPDATE) nikdy nenastavuje is_blocked", () => {
  const match = /ON CONFLICT \(steam_id\) DO UPDATE\s+SET([\s\S]*?)RETURNING/.exec(source);
  assert.ok(match, "očekávaný tvar ON CONFLICT ... DO UPDATE SET ... RETURNING nebyl v db.ts nalezen");
  const setClause = match[1];
  assert.ok(
    !/is_blocked/i.test(setClause),
    `SET klauzule nesmí obsahovat is_blocked, ale obsahuje:\n${setClause}`,
  );
  assert.match(setClause, /nickname\s*=/);
  assert.match(setClause, /avatar_url\s*=/);
});

test("upsertSteamUser: INSERT nastavuje is_blocked jen implicitně (přes DEFAULT ve schématu, ne v query)", () => {
  const match = /INSERT INTO users \(([^)]*)\)/.exec(source);
  assert.ok(match, "očekávaný INSERT INTO users (...) nebyl v db.ts nalezen");
  assert.ok(
    !/is_blocked/i.test(match[1]),
    "INSERT sloupce by neměly explicitně zmiňovat is_blocked — spoléhá se na DEFAULT FALSE ve schématu",
  );
});
