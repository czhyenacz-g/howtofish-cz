// Ruční (ne)blokování uživatele podle steam_id — dokud neexistuje
// žádný admin panel pro tohle. Použití:
//   node --env-file=.env.local scripts/set-user-blocked.mjs <steam_id> <true|false>
import { sql } from "@vercel/postgres";

const [steamId, flag] = process.argv.slice(2);

if (!steamId || (flag !== "true" && flag !== "false")) {
  console.error("Použití: node --env-file=.env.local scripts/set-user-blocked.mjs <steam_id> <true|false>");
  process.exit(1);
}

const isBlocked = flag === "true";
const { rows } = await sql`
  UPDATE users SET is_blocked = ${isBlocked}, updated_at = now()
  WHERE steam_id = ${steamId}
  RETURNING steam_id, nickname, is_blocked
`;

if (rows.length === 0) {
  console.error(`Uživatel se steam_id ${steamId} nenalezen.`);
  process.exit(1);
}

console.log(rows[0]);
