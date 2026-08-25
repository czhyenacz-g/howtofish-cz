import "server-only";
import { locations as curatedLocations } from "../../data/locations.ts";
import {
  checkCommunityRateLimit,
  createCommunityRecord,
  getApprovedCommunityRecords,
  getMyPendingCommunityRecords,
  uploadCommunityImage,
  type RateLimitResult,
} from "./community.ts";
import type { LocationEntry, LocationSuggestionData, UcaRecord } from "./types.ts";

const COLLECTION = "location_suggestions";

function curatedToEntry(c: (typeof curatedLocations)[number]): LocationEntry {
  return {
    id: `curated-${c.slug}`,
    title: c.name,
    authorName: "HowToFish.cz",
    source: "curated",
    island: c.island,
    notableThings: c.notableThings,
    note: c.note,
  };
}

/** null = record je "correction" nebo mu chybí povinná pole — nikdy se nezobrazí veřejně/v pending. */
function mapRecordToLocation(record: UcaRecord): LocationEntry | null {
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
    island: typeof data.island === "string" ? data.island : undefined,
    notableThings: typeof data.notable_things === "string" ? data.notable_things : undefined,
    note: typeof data.note === "string" ? data.note : undefined,
  };
}

export async function getLocationEntries(): Promise<LocationEntry[]> {
  const records = await getApprovedCommunityRecords(COLLECTION).catch(() => []);
  const community = records.map(mapRecordToLocation).filter((e): e is LocationEntry => e !== null);
  const curated = curatedLocations.map(curatedToEntry);
  return [...curated, ...community].sort((a, b) => a.title.localeCompare(b.title, "cs"));
}

export async function getMyPendingLocations(steamId: string): Promise<LocationEntry[]> {
  const records = await getMyPendingCommunityRecords(COLLECTION, steamId);
  return records
    .map(mapRecordToLocation)
    .filter((e): e is LocationEntry => e !== null)
    .map((e) => ({ ...e, pending: true }));
}

export async function createLocationSuggestion(data: LocationSuggestionData): Promise<{ id: number }> {
  return createCommunityRecord(COLLECTION, data);
}

export async function createLocationCorrection(data: {
  target: string;
  proposed_changes: string;
  steam_id: string;
  nickname: string;
  note?: string;
  rights_confirmed: true;
}): Promise<{ id: number }> {
  return createCommunityRecord(COLLECTION, { kind: "correction", ...data });
}

export async function uploadLocationImage(recordId: number, file: File): Promise<void> {
  return uploadCommunityImage(recordId, file);
}

export async function checkLocationRateLimit(steamId: string): Promise<RateLimitResult> {
  return checkCommunityRateLimit(COLLECTION, steamId);
}
