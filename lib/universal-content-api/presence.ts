import "server-only";
import { getBlockedSteamIds } from "../auth/db.ts";
import { recordsPath, ucaJsonRequest } from "./client.ts";
import { createCommunityRecord, updateCommunityRecord } from "./community.ts";
import { isPresenceStatusKey } from "./types.ts";
import type { PresenceEntry, PresenceStatusKey, UcaPaginatedResponse, UcaRecord } from "./types.ts";

const COLLECTION = "multiplayer_presence";
const READ_TIMEOUT_MS = 8_000;

// Max. viditelnost 1 hodina od posledního heartbeatu — viz zadání.
const ACTIVE_WINDOW_MS = 60 * 60 * 1000;

function mapRecordToPresence(record: UcaRecord): PresenceEntry | null {
  const data = record.data;
  const steamId = typeof data.steam_id === "string" ? data.steam_id : null;
  const nickname = typeof data.nickname === "string" ? data.nickname : null;
  const status = isPresenceStatusKey(data.status) ? data.status : null;
  const lastSeenAt = typeof data.last_seen_at === "string" ? data.last_seen_at : null;
  const visible = data.visible === true;

  if (!steamId || !nickname || !status || !lastSeenAt || !visible) return null;

  return {
    recordId: record.id,
    steamId,
    nickname,
    avatarUrl: typeof data.avatar_url === "string" && data.avatar_url ? data.avatar_url : null,
    status,
    lastSeenAt,
  };
}

function isWithinActiveWindow(lastSeenAt: string): boolean {
  const seenAt = new Date(lastSeenAt).getTime();
  if (Number.isNaN(seenAt)) return false;
  return Date.now() - seenAt <= ACTIVE_WINDOW_MS;
}

/**
 * Čistá filtrovací/mapovací logika — vytažená zvlášť, aby šla otestovat
 * bez UCA/DB (viz test/multiplayer-presence.test.ts). Vrací jen
 * visible=true, v poslední hodině aktivní, neblokované hráče, nejnovější první.
 */
export function selectActivePresences(records: UcaRecord[], blockedSteamIds: ReadonlySet<string>): PresenceEntry[] {
  return records
    .map(mapRecordToPresence)
    .filter((p): p is PresenceEntry => p !== null)
    .filter((p) => isWithinActiveWindow(p.lastSeenAt))
    .filter((p) => !blockedSteamIds.has(p.steamId))
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
}

/**
 * Všichni aktivní hráči (visible=true, last_seen_at v poslední hodině,
 * neblokovaný uživatel) — bez cache (presence je živější než promotions,
 * viz zadání). Čte se bez `status` filtru stejně jako game_scores —
 * presence není moderovaný obsah, "pending" record je tu v pořádku.
 */
export async function getActivePresences(): Promise<PresenceEntry[]> {
  const [response, blockedSteamIds] = await Promise.all([
    ucaJsonRequest<UcaPaginatedResponse<UcaRecord>>(recordsPath("?per_page=100", COLLECTION), {
      method: "GET",
      timeoutMs: READ_TIMEOUT_MS,
    }),
    // Dávkový dotaz (ne per-hráč lookup) — blokovaný uživatel nesmí být
    // veřejně vidět, i kdyby ho zablokovali až po jeho posledním
    // heartbeatu (viz zadání "nemá být veřejně zobrazen").
    getBlockedSteamIds().catch(() => new Set<string>()),
  ]);

  return selectActivePresences(response.data, blockedSteamIds);
}

/**
 * Vlastní presence record bez ohledu na visible/expiraci — pro
 * upsertOwnPresence/hideOwnPresence, aby šlo najít i skrytý/expirovaný
 * záznam a znovu ho aktivovat místo zakládání nové řádky.
 */
async function findOwnPresenceRecord(steamId: string): Promise<UcaRecord | null> {
  const query = new URLSearchParams({ per_page: "1" });
  query.set("filter[steam_id]", steamId);
  const response = await ucaJsonRequest<UcaPaginatedResponse<UcaRecord>>(
    recordsPath(`?${query.toString()}`, COLLECTION),
    { method: "GET", timeoutMs: READ_TIMEOUT_MS }
  );
  return response.data[0] ?? null;
}

export type SetPresenceInput = {
  steamId: string;
  nickname: string;
  avatarUrl: string | null;
  status: PresenceStatusKey;
};

/**
 * Aktivace, heartbeat i změna statusu jsou stejná operace: najdi
 * vlastní record (podle steam_id) a nahraď jeho `data` čerstvým
 * snapshotem, nebo ho založ, pokud ještě neexistuje. Jeden record na
 * steam_id, žádná nová řádka při každém heartbeatu (viz zadání).
 */
export async function setOwnPresence(input: SetPresenceInput): Promise<void> {
  const data = {
    steam_id: input.steamId,
    nickname: input.nickname,
    avatar_url: input.avatarUrl,
    status: input.status,
    visible: true,
    last_seen_at: new Date().toISOString(),
  };

  const existing = await findOwnPresenceRecord(input.steamId);
  if (existing) {
    await updateCommunityRecord(COLLECTION, existing.id, data);
  } else {
    await createCommunityRecord(COLLECTION, data);
  }
}

/** "Skrýt mě" — visible=false; no-op, pokud presence ještě neexistuje. */
export async function hideOwnPresence(steamId: string): Promise<void> {
  const existing = await findOwnPresenceRecord(steamId);
  if (!existing) return;

  await updateCommunityRecord(COLLECTION, existing.id, {
    ...existing.data,
    visible: false,
  });
}
