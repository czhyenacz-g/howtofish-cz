import "server-only";
import { recordsPath, ucaJsonRequest } from "./client.ts";
import { createCommunityRecord } from "./community.ts";
import type { UcaPaginatedResponse, UcaRecord, WaveEntry } from "./types.ts";

const COLLECTION = "multiplayer_waves";
const READ_TIMEOUT_MS = 8_000;

// Waves jsou vidět jen posledních 60 minut (viz zadání) — žádné
// read/unread, po hodině prostě zmizí z UI.
const RECENT_WINDOW_MS = 60 * 60 * 1000;

// Stejnému příjemci nejvýš jednou za 10 minut, max 20 wave akcí/hodinu.
const COOLDOWN_MS = 10 * 60 * 1000;
const HOURLY_MAX = 20;

function mapRecordToWave(record: UcaRecord): WaveEntry | null {
  const data = record.data;
  const fromSteamId = typeof data.from_steam_id === "string" ? data.from_steam_id : null;
  const fromNickname = typeof data.from_nickname === "string" ? data.from_nickname : null;
  const toSteamId = typeof data.to_steam_id === "string" ? data.to_steam_id : null;

  if (!fromSteamId || !fromNickname || !toSteamId) return null;

  return { fromSteamId, fromNickname, toSteamId, createdAt: record.created_at };
}

function isRecent(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created <= RECENT_WINDOW_MS;
}

/** Waves adresované mně za posledních 60 minut, nejnovější první. Vidí jen příjemce (viz zadání). */
export async function getIncomingWaves(steamId: string): Promise<WaveEntry[]> {
  const query = new URLSearchParams({ per_page: "50" });
  query.set("filter[to_steam_id]", steamId);
  const response = await ucaJsonRequest<UcaPaginatedResponse<UcaRecord>>(
    recordsPath(`?${query.toString()}`, COLLECTION),
    { method: "GET", timeoutMs: READ_TIMEOUT_MS }
  );

  return response.data
    .map(mapRecordToWave)
    .filter((w): w is WaveEntry => w !== null)
    .filter((w) => isRecent(w.createdAt))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Waves, které jsem za poslední hodinu odeslal já — použito pro cooldown
 * (stejný příjemce max 1x/10 min) i rate limit (max HOURLY_MAX/hod).
 * UCA generic filter podporuje jen exact-match nad jedním polem najednou
 * (max 3 klíče), takže `to_steam_id` se dořeší v paměti nad malou sadou
 * (max HOURLY_MAX+pár záznamů) — žádný N+1, jedna cache-free UCA request.
 */
async function getMyRecentSentWaves(steamId: string): Promise<WaveEntry[]> {
  const query = new URLSearchParams({ per_page: "50" });
  query.set("filter[from_steam_id]", steamId);
  const response = await ucaJsonRequest<UcaPaginatedResponse<UcaRecord>>(
    recordsPath(`?${query.toString()}`, COLLECTION),
    { method: "GET", timeoutMs: READ_TIMEOUT_MS }
  );

  return response.data
    .map(mapRecordToWave)
    .filter((w): w is WaveEntry => w !== null)
    .filter((w) => Date.now() - new Date(w.createdAt).getTime() <= 60 * 60 * 1000);
}

export type WaveLimitResult = { allowed: true } | { allowed: false; message: string; alreadyWaved: boolean };

/** Cooldown/rate-limit kontrola PŘED vytvořením wave — viz zadání "co nejjednodušší bezpečné řešení nad stávajícími records". */
export async function checkWaveAllowed(fromSteamId: string, toSteamId: string): Promise<WaveLimitResult> {
  const sent = await getMyRecentSentWaves(fromSteamId);
  const now = Date.now();

  const recentToSameRecipient = sent.some(
    (w) => w.toSteamId === toSteamId && now - new Date(w.createdAt).getTime() <= COOLDOWN_MS
  );
  if (recentToSameRecipient) {
    return { allowed: false, message: "Už jsi zamával", alreadyWaved: true };
  }

  if (sent.length >= HOURLY_MAX) {
    return {
      allowed: false,
      message: "Za poslední hodinu jsi zamával už dost. Zkus to prosím později.",
      alreadyWaved: false,
    };
  }

  return { allowed: true };
}

export async function createWave(input: { fromSteamId: string; fromNickname: string; toSteamId: string }): Promise<void> {
  await createCommunityRecord(COLLECTION, {
    from_steam_id: input.fromSteamId,
    from_nickname: input.fromNickname,
    to_steam_id: input.toSteamId,
  });
}
