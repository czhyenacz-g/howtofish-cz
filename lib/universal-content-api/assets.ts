import "server-only";
import { recordsPath, ucaJsonRequest } from "./client.ts";
import type { UcaRecord } from "./types.ts";

// Generická UCA collection "assets" (viz starter CLAUDE.md) — statická
// grafika nahraná ručně přes UCA admin (/admin/assets), ne komunitní
// obsah. Na rozdíl od promotions.ts/community.ts, kde se čte SEZNAM
// záznamů, tady jde vždy o JEDEN konkrétní, ručně vybraný asset podle ID
// (např. Multiplayer ostrov tab) — proto generic GET /records/{id}
// (RecordController::show), ne index+filter.
const COLLECTION = "assets";
const READ_TIMEOUT_MS = 8_000;
// Statická, adminem spravovaná grafika se nemění za běhu — stejné okno
// jako promotions (~2 min), viz zadání "cache jako ostatní UCA
// asset/media requesty".
const REVALIDATE_SECONDS = 120;

export type UcaAsset = {
  id: number;
  title: string;
  imageUrl: string;
};

/**
 * Jeden konkrétní asset podle ID, s reálnou media public_url. `null`
 * když asset neexistuje, nemá žádné navázané médium, nebo je UCA
 * nedostupné — volající musí mít bezpečný fallback (nikdy nerozbít
 * stránku, žádný placeholder/broken image), viz MultiplayerIslandTab.tsx.
 */
export async function getAssetById(id: number): Promise<UcaAsset | null> {
  const record = await ucaJsonRequest<{ data: UcaRecord }>(recordsPath(`/${id}`, COLLECTION), {
    method: "GET",
    timeoutMs: READ_TIMEOUT_MS,
    revalidateSeconds: REVALIDATE_SECONDS,
  })
    .then((response) => response.data)
    .catch(() => null);

  if (!record) return null;

  // Poslední navázané médium vyhrává — stejná konvence jako u promotions
  // (admin může obrázek na edit stránce vyměnit, staré médium se nemaže).
  const media = record.media[record.media.length - 1];
  if (!media?.public_url) return null;

  const title = typeof record.data.title === "string" ? record.data.title : "";

  return { id: record.id, title, imageUrl: media.public_url };
}
