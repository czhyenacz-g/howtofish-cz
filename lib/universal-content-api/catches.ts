import "server-only";
import { mediaPath, recordsPath, ucaJsonRequest, ucaUploadRequest, UcaError } from "./client.ts";
import type { CatchRecordData, CommunityCatch, UcaMedia, UcaPaginatedResponse, UcaRecord } from "./types.ts";

export { UcaError };

const CREATE_TIMEOUT_MS = 8_000;
const READ_TIMEOUT_MS = 8_000;
const UPLOAD_TIMEOUT_MS = 20_000;
const READ_REVALIDATE_SECONDS = 45;

function mapRecordToCatch(record: UcaRecord): CommunityCatch | null {
  const media = record.media[0];
  if (!media) return null;

  const data = record.data;
  const fishSlug = typeof data.fish_slug === "string" ? data.fish_slug : null;
  const steamId = typeof data.steam_id === "string" ? data.steam_id : null;
  const nickname = typeof data.nickname === "string" ? data.nickname : null;
  const caughtAt = typeof data.caught_at === "string" ? data.caught_at : null;
  const note = typeof data.note === "string" ? data.note : undefined;

  if (!fishSlug || !steamId || !nickname || !caughtAt) return null;

  return {
    id: record.id,
    fishSlug,
    steamId,
    nickname,
    caughtAt,
    note,
    image: {
      id: media.id,
      url: media.public_url,
      width: media.width ?? undefined,
      height: media.height ?? undefined,
    },
    createdAt: record.created_at,
  };
}

/** Vytvoří record se statusem pending (UCA status vždy vynutí server-side). */
export async function createCatchRecord(data: CatchRecordData): Promise<{ id: number }> {
  const response = await ucaJsonRequest<{ data: UcaRecord }>(recordsPath(), {
    method: "POST",
    body: { data },
    timeoutMs: CREATE_TIMEOUT_MS,
  });
  return { id: response.data.id };
}

/** Nahraje screenshot a naváže ho na record. */
export async function uploadCatchImage(recordId: number, file: File): Promise<UcaMedia> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("record_id", String(recordId));

  const response = await ucaUploadRequest<{ data: UcaMedia }>(mediaPath(), formData, UPLOAD_TIMEOUT_MS);
  return response.data;
}

/**
 * Schválené úlovky pro jednu rybu, seřazené od nejstaršího (pro určení
 * "první úlovek") — UCA vrací nejnovější první, řadíme si to sami.
 * Cachováno přes Next fetch cache (viz READ_REVALIDATE_SECONDS).
 */
export async function getApprovedCatches(fishSlug: string, perPage = 30): Promise<CommunityCatch[]> {
  const query = new URLSearchParams({
    status: "approved",
    per_page: String(perPage),
  });
  query.set("filter[fish_slug]", fishSlug);

  const response = await ucaJsonRequest<UcaPaginatedResponse<UcaRecord>>(recordsPath(`?${query.toString()}`), {
    method: "GET",
    timeoutMs: READ_TIMEOUT_MS,
    revalidateSeconds: READ_REVALIDATE_SECONDS,
  });

  return response.data
    .map(mapRecordToCatch)
    .filter((c): c is CommunityCatch => c !== null)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * Jeden dávkový request pro cover obrázky na /ryby — NE jeden request
 * na rybu (N+1). Vrací mapu fish_slug -> nejstarší approved úlovek.
 */
export async function getApprovedCatchCovers(): Promise<Map<string, CommunityCatch>> {
  const query = new URLSearchParams({ status: "approved", per_page: "100" });

  const response = await ucaJsonRequest<UcaPaginatedResponse<UcaRecord>>(recordsPath(`?${query.toString()}`), {
    method: "GET",
    timeoutMs: READ_TIMEOUT_MS,
    revalidateSeconds: READ_REVALIDATE_SECONDS,
  });

  const catches = response.data
    .map(mapRecordToCatch)
    .filter((c): c is CommunityCatch => c !== null)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const covers = new Map<string, CommunityCatch>();
  for (const c of catches) {
    if (!covers.has(c.fishSlug)) covers.set(c.fishSlug, c);
  }
  return covers;
}
