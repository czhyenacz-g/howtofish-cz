import "server-only";
import { items as curatedItems } from "../../data/items.ts";
import {
  checkCommunityRateLimit,
  createCommunityRecord,
  getApprovedCommunityRecords,
  getMyPendingCommunityRecords,
  uploadCommunityImage,
  type RateLimitResult,
} from "./community.ts";
import type { ItemEntry, ItemSuggestionData, UcaRecord } from "./types.ts";

const COLLECTION = "item_suggestions";

function curatedToEntry(c: (typeof curatedItems)[number]): ItemEntry {
  return {
    id: `curated-${c.slug}`,
    title: c.name,
    authorName: "HowToFish.cz",
    source: "curated",
    itemType: c.itemType,
    obtainedAt: c.obtainedAt,
    use: c.use,
  };
}

/** null = record je "correction" nebo mu chybí povinná pole — nikdy se nezobrazí veřejně/v pending. */
function mapRecordToItem(record: UcaRecord): ItemEntry | null {
  const data = record.data;
  if (data.kind === "correction") return null;

  const name = typeof data.name === "string" ? data.name : null;
  const steamId = typeof data.steam_id === "string" ? data.steam_id : null;
  const nickname = typeof data.nickname === "string" ? data.nickname : null;
  if (!name || !steamId || !nickname) return null;

  const media = record.media[0];

  return {
    id: `community-${record.id}`,
    title: name,
    imageUrl: media?.public_url,
    authorName: nickname,
    source: "community",
    itemType: typeof data.item_type === "string" ? data.item_type : undefined,
    obtainedAt: typeof data.obtained_at === "string" ? data.obtained_at : undefined,
    use: typeof data.use === "string" ? data.use : undefined,
  };
}

/** Curated + approved community, seřazené podle názvu (cs). Approved data cachovaná, viz community.ts. */
export async function getItemEntries(): Promise<ItemEntry[]> {
  const records = await getApprovedCommunityRecords(COLLECTION).catch(() => []);
  const community = records.map(mapRecordToItem).filter((e): e is ItemEntry => e !== null);
  const curated = curatedItems.map(curatedToEntry);
  return [...curated, ...community].sort((a, b) => a.title.localeCompare(b.title, "cs"));
}

/** Jen pending návrhy AKTUÁLNĚ přihlášeného uživatele — server-side filtr, viz community.ts. */
export async function getMyPendingItems(steamId: string): Promise<ItemEntry[]> {
  const records = await getMyPendingCommunityRecords(COLLECTION, steamId);
  return records
    .map(mapRecordToItem)
    .filter((e): e is ItemEntry => e !== null)
    .map((e) => ({ ...e, pending: true }));
}

export async function createItemSuggestion(data: ItemSuggestionData): Promise<{ id: number }> {
  return createCommunityRecord(COLLECTION, data);
}

export async function createItemCorrection(data: {
  target: string;
  proposed_changes: string;
  steam_id: string;
  nickname: string;
  note?: string;
  rights_confirmed: true;
}): Promise<{ id: number }> {
  return createCommunityRecord(COLLECTION, { kind: "correction", ...data });
}

export async function uploadItemImage(recordId: number, file: File): Promise<void> {
  return uploadCommunityImage(recordId, file);
}

export async function checkItemRateLimit(steamId: string): Promise<RateLimitResult> {
  return checkCommunityRateLimit(COLLECTION, steamId);
}
