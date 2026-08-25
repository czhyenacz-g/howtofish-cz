import "server-only";
import { bosses as curatedBosses } from "../../data/bosses.ts";
import {
  checkCommunityRateLimit,
  createCommunityRecord,
  getApprovedCommunityRecords,
  getMyPendingCommunityRecords,
  uploadCommunityImage,
  type RateLimitResult,
} from "./community.ts";
import type { BossEntry, BossSuggestionData, UcaRecord } from "./types.ts";

const COLLECTION = "boss_suggestions";

function curatedToEntry(c: (typeof curatedBosses)[number]): BossEntry {
  return {
    id: `curated-${c.slug}`,
    title: c.name,
    authorName: "HowToFish.cz",
    source: "curated",
    location: c.location,
    howToFind: c.howToFind,
    tip: c.tip,
    detailHref: c.detailSlug ? `/ryby/${c.detailSlug}` : undefined,
  };
}

/** null = record je "correction" nebo mu chybí povinná pole — nikdy se nezobrazí veřejně/v pending. */
function mapRecordToBoss(record: UcaRecord): BossEntry | null {
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
    location: typeof data.location === "string" ? data.location : undefined,
    howToFind: typeof data.how_to_find === "string" ? data.how_to_find : undefined,
    tip: typeof data.tip === "string" ? data.tip : undefined,
  };
}

export async function getBossEntries(): Promise<BossEntry[]> {
  const records = await getApprovedCommunityRecords(COLLECTION).catch(() => []);
  const community = records.map(mapRecordToBoss).filter((e): e is BossEntry => e !== null);
  const curated = curatedBosses.map(curatedToEntry);
  return [...curated, ...community].sort((a, b) => a.title.localeCompare(b.title, "cs"));
}

export async function getMyPendingBosses(steamId: string): Promise<BossEntry[]> {
  const records = await getMyPendingCommunityRecords(COLLECTION, steamId);
  return records
    .map(mapRecordToBoss)
    .filter((e): e is BossEntry => e !== null)
    .map((e) => ({ ...e, pending: true }));
}

export async function createBossSuggestion(data: BossSuggestionData): Promise<{ id: number }> {
  return createCommunityRecord(COLLECTION, data);
}

export async function createBossCorrection(data: {
  target: string;
  proposed_changes: string;
  steam_id: string;
  nickname: string;
  note?: string;
  rights_confirmed: true;
}): Promise<{ id: number }> {
  return createCommunityRecord(COLLECTION, { kind: "correction", ...data });
}

export async function uploadBossImage(recordId: number, file: File): Promise<void> {
  return uploadCommunityImage(recordId, file);
}

export async function checkBossRateLimit(steamId: string): Promise<RateLimitResult> {
  return checkCommunityRateLimit(COLLECTION, steamId);
}
