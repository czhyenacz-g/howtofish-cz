import "server-only";
import { mediaPath, recordsPath, ucaJsonRequest, ucaUploadRequest, UcaError } from "./client.ts";
import type { UcaPaginatedResponse, UcaRecord } from "./types.ts";

export { UcaError };

// Generická vrstva nad UCA pro komunitní tabulkové sekce (/predmety,
// /bossove, /lokace, /navody) — vytvoření recordu, upload obrázku,
// čtení approved (veřejné) a vlastních pending (soukromé) záznamů,
// rate limit. Doménová validace/mapování na konkrétní typy (ItemEntry,
// BossEntry, ...) žije v lib/universal-content-api/{items,bosses,
// locations,guides}.ts — tady je jen HTTP/UCA mechanika sdílená napříč
// všemi čtyřmi collections.

const CREATE_TIMEOUT_MS = 8_000;
const READ_TIMEOUT_MS = 8_000;
const UPLOAD_TIMEOUT_MS = 20_000;

export const APPROVED_REVALIDATE_SECONDS = 60;

export async function createCommunityRecord(
  collection: string,
  data: Record<string, unknown>
): Promise<{ id: number }> {
  const response = await ucaJsonRequest<{ data: UcaRecord }>(recordsPath("", collection), {
    method: "POST",
    body: { data },
    timeoutMs: CREATE_TIMEOUT_MS,
  });
  return { id: response.data.id };
}

export async function uploadCommunityImage(recordId: number, file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("record_id", String(recordId));
  await ucaUploadRequest(mediaPath(), formData, UPLOAD_TIMEOUT_MS);
}

/**
 * Veřejné, schválené záznamy dané collection — cachováno (výchozí viz
 * APPROVED_REVALIDATE_SECONDS, `revalidateSeconds` jde přebít pro
 * collections s jiným požadovaným cache oknem, např. promotions ~2 min).
 */
export async function getApprovedCommunityRecords(
  collection: string,
  perPage = 100,
  revalidateSeconds: number = APPROVED_REVALIDATE_SECONDS
): Promise<UcaRecord[]> {
  const query = new URLSearchParams({ status: "approved", per_page: String(perPage) });
  const response = await ucaJsonRequest<UcaPaginatedResponse<UcaRecord>>(
    recordsPath(`?${query.toString()}`, collection),
    { method: "GET", timeoutMs: READ_TIMEOUT_MS, revalidateSeconds }
  );
  return response.data;
}

/**
 * Jen pending záznamy AKTUÁLNĚ přihlášeného uživatele — server-side
 * filtr `status=pending` + `filter[steam_id]=...` přímo na UCA, nikdy
 * se nestahují cizí pending záznamy do browseru. Bez cache (soukromá
 * per-uživatel data, vždy čerstvý dotaz).
 */
export async function getMyPendingCommunityRecords(collection: string, steamId: string): Promise<UcaRecord[]> {
  const query = new URLSearchParams({ status: "pending", per_page: "50" });
  query.set("filter[steam_id]", steamId);
  const response = await ucaJsonRequest<UcaPaginatedResponse<UcaRecord>>(
    recordsPath(`?${query.toString()}`, collection),
    { method: "GET", timeoutMs: READ_TIMEOUT_MS }
  );
  return response.data;
}

export type RateLimitResult = { allowed: true } | { allowed: false; message: string };

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/**
 * Server-side rate limit BEZ Redis — počítá z reálně uložených UCA
 * records daného steam_id za posledních 24h (spolehlivé i napříč
 * bezstavovými Vercel serverless instancemi). Počítá všechny statusy
 * (pending/approved/rejected) a oba `kind` (new i correction), ať nejde
 * limit obejít opakovaným zamítnutým spamem.
 */
export async function checkCommunityRateLimit(
  collection: string,
  steamId: string,
  { hourlyMax = 10, dailyMax = 30 }: { hourlyMax?: number; dailyMax?: number } = {}
): Promise<RateLimitResult> {
  const query = new URLSearchParams({ per_page: "50" });
  query.set("filter[steam_id]", steamId);
  const response = await ucaJsonRequest<UcaPaginatedResponse<UcaRecord>>(
    recordsPath(`?${query.toString()}`, collection),
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

  if (lastHour >= hourlyMax) {
    return { allowed: false, message: "Za poslední hodinu jsi už poslal moc návrhů. Zkus to prosím za chvíli." };
  }
  if (lastDay >= dailyMax) {
    return { allowed: false, message: "Dnes jsi už dosáhl limitu návrhů. Zkus to prosím zítra." };
  }
  return { allowed: true };
}
