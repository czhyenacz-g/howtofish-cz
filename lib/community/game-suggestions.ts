import "server-only";
import { sql } from "@vercel/postgres";

// Návrhy her z veřejného formuláře "Chybí tu tvoje hra?" na
// /hry-s-rybarenim (tabulka `game_suggestions`, viz db/schema.sql).
//
// Proč Postgres a ne Universal Content API: jde o jediný jednoduchý
// veřejný tip bez přihlášení, bez obrázku a bez vazby na Steam účet —
// Steam-login + UCA media upload pipeline by tu byl zbytečná
// infrastruktura. UCA zůstává pro veškerý encyklopedický komunitní obsah
// (/predmety, /bossove, /lokace, /navody, /ryby) beze změny.

const RATE_LIMIT_HOURLY_MAX = 30;

export const RATE_LIMIT_ERROR = "Za poslední hodinu přišlo moc návrhů. Zkus to prosím za chvíli.";

export type GameSuggestionInput = { gameName: string; note?: string };

export async function createGameSuggestion(input: GameSuggestionInput): Promise<{ id: number }> {
  const { rows } = await sql<{ id: number }>`
    INSERT INTO game_suggestions (game_name, note)
    VALUES (${input.gameName}, ${input.note ?? null})
    RETURNING id
  `;
  return { id: rows[0].id };
}

export type GameSuggestionRateLimitResult = { allowed: true } | { allowed: false; message: string };

/**
 * Jednoduchý server-side limit: kolik návrhů přišlo za poslední hodinu
 * (globálně, ne per uživatel — formulář je bez přihlášení). Počítá se
 * přímo z uložených řádků, takže funguje i napříč bezstavovými Vercel
 * instancemi (žádné in-memory počítadlo, žádný Redis navíc).
 */
export async function checkGameSuggestionRateLimit(): Promise<GameSuggestionRateLimitResult> {
  const { rows } = await sql<{ count: number }>`
    SELECT count(*)::int AS count
    FROM game_suggestions
    WHERE created_at > now() - interval '1 hour'
  `;

  if ((rows[0]?.count ?? 0) >= RATE_LIMIT_HOURLY_MAX) {
    return { allowed: false, message: RATE_LIMIT_ERROR };
  }
  return { allowed: true };
}
