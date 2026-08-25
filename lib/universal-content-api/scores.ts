import "server-only";
import { recordsPath, ucaJsonRequest, UcaError } from "./client.ts";
import type { GameScoreData, LeaderboardEntry, UcaPaginatedResponse, UcaRecord } from "./types.ts";

export { UcaError };

const SCORES_COLLECTION = "game_scores";
const CREATE_TIMEOUT_MS = 8_000;
const READ_TIMEOUT_MS = 8_000;
const READ_REVALIDATE_SECONDS = 45;

/**
 * Skóre je zábavný obsah, ne moderovaný jako komunitní screenshoty —
 * čte se bez `status` filtru (UCA bez toho parametru vrátí všechny
 * statusy), takže nový výsledek nečeká na ruční schválení v adminu.
 * Server i tak validuje rozumné meze (viz evaluate-score-submission.ts)
 * — jde o zábavný žebříček, ne o security-grade anti-cheat.
 */
export async function submitGameScore(data: GameScoreData): Promise<{ id: number }> {
  const response = await ucaJsonRequest<{ data: UcaRecord }>(recordsPath("", SCORES_COLLECTION), {
    method: "POST",
    body: { data },
    timeoutMs: CREATE_TIMEOUT_MS,
  });
  return { id: response.data.id };
}

function mapRecordToLeaderboardEntry(record: UcaRecord): LeaderboardEntry | null {
  const data = record.data;
  const steamId = typeof data.steam_id === "string" ? data.steam_id : null;
  const nickname = typeof data.nickname === "string" ? data.nickname : null;
  const score = typeof data.score === "number" ? data.score : null;
  const round = typeof data.round === "number" ? data.round : null;

  if (!steamId || !nickname || score === null || round === null) return null;

  return { steamId, nickname, score, round, createdAt: record.created_at };
}

/**
 * Top žebříček pro jednu hru — jeden hráč = jeden řádek (nejlepší
 * skóre). UCA nemá update/upsert, takže se ukládá každý pokus zvlášť a
 * tady se při čtení seskupí podle steam_id a vezme max(score) — bez
 * jakékoli změny UCA.
 */
export async function getLeaderboard(game: string, limit = 20): Promise<LeaderboardEntry[]> {
  const query = new URLSearchParams({ per_page: "100" });
  query.set("filter[game]", game);

  const response = await ucaJsonRequest<UcaPaginatedResponse<UcaRecord>>(
    recordsPath(`?${query.toString()}`, SCORES_COLLECTION),
    { method: "GET", timeoutMs: READ_TIMEOUT_MS, revalidateSeconds: READ_REVALIDATE_SECONDS }
  );

  const entries = response.data
    .map(mapRecordToLeaderboardEntry)
    .filter((e): e is LeaderboardEntry => e !== null);

  const bestByPlayer = new Map<string, LeaderboardEntry>();
  for (const entry of entries) {
    const existing = bestByPlayer.get(entry.steamId);
    if (!existing || entry.score > existing.score) bestByPlayer.set(entry.steamId, entry);
  }

  return Array.from(bestByPlayer.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
