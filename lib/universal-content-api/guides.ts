import "server-only";
import { guides as curatedGuides } from "../../data/guides.ts";
import {
  checkCommunityRateLimit,
  createCommunityRecord,
  getApprovedCommunityRecords,
  getMyPendingCommunityRecords,
  uploadCommunityImage,
  type RateLimitResult,
} from "./community.ts";
import type { GuideEntry, GuideSuggestionData, UcaRecord } from "./types.ts";

const COLLECTION = "guide_suggestions";

function curatedToEntry(c: (typeof curatedGuides)[number]): GuideEntry {
  return {
    id: `curated-${c.slug}`,
    slug: c.slug,
    title: c.title,
    authorName: "HowToFish.cz",
    source: "curated",
    category: c.category,
    summary: c.summary,
    content: c.content,
  };
}

/** null = record je "correction" nebo mu chybí povinná pole — nikdy se nezobrazí veřejně/v pending. */
function mapRecordToGuide(record: UcaRecord): GuideEntry | null {
  const data = record.data;
  if (data.kind === "correction") return null;

  const title = typeof data.title === "string" ? data.title : null;
  const summary = typeof data.summary === "string" ? data.summary : null;
  const steamId = typeof data.steam_id === "string" ? data.steam_id : null;
  const nickname = typeof data.nickname === "string" ? data.nickname : null;
  if (!title || !summary || !steamId || !nickname) return null;

  const media = record.media[0];
  const id = `community-${record.id}`;

  return {
    id,
    // Community návody nemají vlastní hezké slug — id (community-{id})
    // slouží jako slug pro /navody/[slug], je unikátní a stabilní.
    slug: id,
    title,
    imageUrl: media?.public_url,
    authorName: nickname,
    source: "community",
    category: typeof data.category === "string" ? data.category : undefined,
    summary,
    content: typeof data.content === "string" ? data.content : undefined,
  };
}

export async function getGuideEntries(): Promise<GuideEntry[]> {
  const records = await getApprovedCommunityRecords(COLLECTION).catch(() => []);
  const community = records.map(mapRecordToGuide).filter((e): e is GuideEntry => e !== null);
  const curated = curatedGuides.map(curatedToEntry);
  return [...curated, ...community].sort((a, b) => a.title.localeCompare(b.title, "cs"));
}

export async function getMyPendingGuides(steamId: string): Promise<GuideEntry[]> {
  const records = await getMyPendingCommunityRecords(COLLECTION, steamId);
  return records
    .map(mapRecordToGuide)
    .filter((e): e is GuideEntry => e !== null)
    .map((e) => ({ ...e, pending: true }));
}

export async function createGuideSuggestion(data: GuideSuggestionData): Promise<{ id: number }> {
  return createCommunityRecord(COLLECTION, data);
}

export async function createGuideCorrection(data: {
  target: string;
  proposed_changes: string;
  steam_id: string;
  nickname: string;
  note?: string;
  rights_confirmed: true;
}): Promise<{ id: number }> {
  return createCommunityRecord(COLLECTION, { kind: "correction", ...data });
}

export async function uploadGuideImage(recordId: number, file: File): Promise<void> {
  return uploadCommunityImage(recordId, file);
}

export async function checkGuideRateLimit(steamId: string): Promise<RateLimitResult> {
  return checkCommunityRateLimit(COLLECTION, steamId);
}
