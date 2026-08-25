// Jednorázový skript pro aplikaci db/schema.sql proti DATABASE_URL.
// Použití: node --env-file=.env.local scripts/apply-schema.mjs
// Bezpečně opakovatelné (CREATE TABLE IF NOT EXISTS).
import { readFileSync } from "node:fs";
import { sql } from "@vercel/postgres";

const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

await sql.query(schema);
console.log("Schema applied.");
