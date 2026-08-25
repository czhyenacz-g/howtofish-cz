import "server-only";
import { mediaPath, recordsPath, ucaJsonRequest, ucaUploadRequest, UcaError } from "./client.ts";
import type { FishSuggestion, FishSuggestionData, FishSuggestionType, UcaPaginatedResponse, UcaRecord } from "./types.ts";

export { UcaError };

const SUGGESTIONS_COLLECTION = "fish_suggestions";
const CREATE_TIMEOUT_MS = 8_000;
const READ_TIMEOUT_MS = 8_000;
const UPLOAD_TIMEOUT_MS = 20_000;

const SUGGESTION_TYPES: readonly FishSuggestionType[] = ["fish", "creature", "boss", "other"];

const RATE_LIMIT_HOURLY_MAX = 5;
const RATE_LIMIT_DAILY_MAX = 20;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export async function createSuggestionRecord(data: FishSuggestionData): Promise<{ id: number }> {
  const response = await ucaJsonRequest<{ data: UcaRecord }>(recordsPath("", SUGGESTIONS_COLLECTION), {
    method: "POST",
    body: { data },
    timeoutMs: CREATE_TIMEOUT_MS,
  });
  return { id: response.data.id };
}

export async function uploadSuggestionImage(recordId: number, file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("record_id", String(recordId));
  await ucaUploadRequest(mediaPath(), formData, UPLOAD_TIMEOUT_MS);
}

function mapRecordToSuggestion(record: UcaRecord): FishSuggestion | null {
  const data = record.data;
  const name = typeof data.name === "string" ? data.name : null;
  const type = typeof data.type === "string" ? data.type : null;
  const location = typeof data.location === "string" ? data.location : null;
  const steamId = typeof data.steam_id === "string" ? data.steam_id : null;
  const nickname = typeof data.nickname === "string" ? data.nickname : null;
  const note = typeof data.note === "string" ? data.note : undefined;

  if (!name || !type || !location || !steamId || !nickname) return null;
  if (!SUGGESTION_TYPES.includes(type as FishSuggestionType)) return null;

  const media = record.media[0];

  return {
    id: record.id,
    name,
    type: type as FishSuggestionType,
    location,
    steamId,
    nickname,
    note,
    image: media
      ? { id: media.id, url: media.public_url, width: media.width ?? undefined, height: media.height ?? undefined }
      : null,
    createdAt: record.created_at,
  };
}

/**
 * Jen pending návrhy AKTUÁLNĚ přihlášeného uživatele — filtrováno
 * server-side přes UCA (`status=pending` + `filter[steam_id]=...`),
 * nikdy se nestahují všechny pending návrhy do browseru. Žádné
 * cachování (soukromá per-uživatel data) — vždy čerstvý dotaz.
 */
export async function getMyPendingSuggestions(steamId: string): Promise<FishSuggestion[]> {
  const query = new URLSearchParams({ status: "pending", per_page: "50" });
  query.set("filter[steam_id]", steamId);

  const response = await ucaJsonRequest<UcaPaginatedResponse<UcaRecord>>(
    recordsPath(`?${query.toString()}`, SUGGESTIONS_COLLECTION),
    { method: "GET", timeoutMs: READ_TIMEOUT_MS }
  );

  return response.data
    .map(mapRecordToSuggestion)
    .filter((s): s is FishSuggestion => s !== null)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export type RateLimitResult = { allowed: true } | { allowed: false; message: string };

/**
 * Server-side rate limit BEZ Redis — počítá z reálně uložených UCA
 * records za posledních 24h (funguje spolehlivě i napříč
 * bezstavovými Vercel serverless instancemi, na rozdíl od in-memory
 * počítadla). Bere všechny statusy (pending/approved/rejected), ne
 * jen pending, ať nejde limit obejít opakovaným zamítnutým spamem.
 */
export async function checkSuggestionRateLimit(steamId: string): Promise<RateLimitResult> {
  const query = new URLSearchParams({ per_page: "50" });
  query.set("filter[steam_id]", steamId);

  const response = await ucaJsonRequest<UcaPaginatedResponse<UcaRecord>>(
    recordsPath(`?${query.toString()}`, SUGGESTIONS_COLLECTION),
    { method: "GET", timeoutMs: READ_TIMEOUT_MS }
  );

  const now = Date.now();
  let lastHour = 0;
  let lastDay = 0;
  for (const record of response.data) {
    const created = new Date(record.created_at).getTime();
    if (Number.isNaN(created)) continue;
    const age = now - created;
    if (age <= HOUR_MS) lastHour++;
    if (age <= DAY_MS) lastDay++;
  }

  if (lastHour >= RATE_LIMIT_HOURLY_MAX) {
    return { allowed: false, message: "Za poslední hodinu jsi už poslal moc návrhů. Zkus to prosím za chvíli." };
  }
  if (lastDay >= RATE_LIMIT_DAILY_MAX) {
    return { allowed: false, message: "Dnes jsi už dosáhl limitu návrhů. Zkus to prosím zítra." };
  }
  return { allowed: true };
}
