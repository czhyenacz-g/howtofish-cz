import "server-only";
import { sql } from "@vercel/postgres";
import type { ScoredVideoCandidate } from "./video-discovery.ts";
import { HOMEPAGE_GAME_VIDEOS_LIMIT, selectDiverseVideos } from "./video-selection.ts";

// Ukládání a čtení kandidátních videí k hrám (tabulka `game_videos`,
// viz db/schema.sql). Jde o jedinou DB vrstvu pro tahle data — veřejný
// detail i CLI pracují přes ni, žádná duplicitní logika.
//
// Nic se nepublikuje automaticky: nově nalezené video má vždy
// `is_approved = false` a veřejně se zobrazí, až když ho někdo schválí
// (scripts/game-videos-review.ts).

export const MAX_PUBLIC_GAME_VIDEOS = 6;

export type GameVideoRecord = {
  id: number;
  gameSlug: string;
  platform: "youtube";
  externalId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  relevanceScore: number;
  searchQuery: string | null;
  viewCount: number | null;
  durationSeconds: number | null;
  discoveredAt: string;
  lastSeenAt: string;
  isApproved: boolean;
  isActive: boolean;
};

type Row = {
  id: number;
  game_slug: string;
  platform: "youtube";
  external_id: string;
  title: string;
  channel_id: string;
  channel_title: string;
  thumbnail_url: string | null;
  published_at: string | Date | null;
  relevance_score: number;
  search_query: string | null;
  view_count: string | number | null;
  duration_seconds: number | null;
  discovered_at: string | Date;
  last_seen_at: string | Date;
  is_approved: boolean;
  is_active: boolean;
};

function toIso(value: string | Date | null): string | null {
  if (value === null) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function mapRow(row: Row): GameVideoRecord {
  return {
    id: row.id,
    gameSlug: row.game_slug,
    platform: row.platform,
    externalId: row.external_id,
    title: row.title,
    channelId: row.channel_id,
    channelTitle: row.channel_title,
    thumbnailUrl: row.thumbnail_url,
    publishedAt: toIso(row.published_at),
    relevanceScore: row.relevance_score,
    searchQuery: row.search_query,
    viewCount: row.view_count === null ? null : Number(row.view_count),
    durationSeconds: row.duration_seconds,
    discoveredAt: toIso(row.discovered_at) ?? "",
    lastSeenAt: toIso(row.last_seen_at) ?? "",
    isApproved: row.is_approved,
    isActive: row.is_active,
  };
}

/**
 * Upsert nalezených kandidátů. `UNIQUE (platform, external_id)` zajišťuje,
 * že opakovaný run nic nezduplikuje — u existujícího videa se jen
 * aktualizují metadata a `last_seen_at`. `search_query` se záměrně
 * nepřepisuje (zůstává dotaz, kterým bylo video nalezeno poprvé).
 */
export async function upsertGameVideos(
  gameSlug: string,
  videos: ScoredVideoCandidate[]
): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  for (const video of videos) {
    const { rows } = await sql<{ inserted: boolean }>`
      INSERT INTO game_videos (
        game_slug, platform, external_id, title, channel_id, channel_title,
        thumbnail_url, published_at, relevance_score, search_query,
        view_count, duration_seconds
      ) VALUES (
        ${gameSlug}, 'youtube', ${video.videoId}, ${video.title}, ${video.channelId}, ${video.channelTitle},
        ${video.thumbnailUrl ?? null}, ${video.publishedAt || null}, ${video.relevanceScore}, ${video.query},
        ${video.viewCount ?? null}, ${video.durationSeconds ?? null}
      )
      ON CONFLICT (platform, external_id) DO UPDATE SET
        title = EXCLUDED.title,
        channel_id = EXCLUDED.channel_id,
        channel_title = EXCLUDED.channel_title,
        thumbnail_url = EXCLUDED.thumbnail_url,
        published_at = EXCLUDED.published_at,
        relevance_score = EXCLUDED.relevance_score,
        view_count = EXCLUDED.view_count,
        duration_seconds = EXCLUDED.duration_seconds,
        last_seen_at = now()
      RETURNING (xmax = 0) AS inserted
    `;
    if (rows[0]?.inserted) inserted += 1;
    else updated += 1;
  }

  return { inserted, updated };
}

/** Kandidáti k ruční kontrole (aktivní videa, neschválená i schválená). */
export async function listGameVideoCandidates(
  options: { gameSlug?: string; limit?: number } = {}
): Promise<GameVideoRecord[]> {
  const limit = options.limit ?? 50;

  if (options.gameSlug) {
    const { rows } = await sql<Row>`
      SELECT
        id, game_slug, platform, external_id, title, channel_id, channel_title,
        thumbnail_url, published_at, relevance_score, search_query, view_count,
        duration_seconds, discovered_at, last_seen_at, is_approved, is_active
      FROM game_videos
      WHERE game_slug = ${options.gameSlug} AND is_active = true
      ORDER BY relevance_score DESC, published_at DESC NULLS LAST
      LIMIT ${limit}
    `;
    return rows.map(mapRow);
  }

  const { rows } = await sql<Row>`
    SELECT
      id, game_slug, platform, external_id, title, channel_id, channel_title,
      thumbnail_url, published_at, relevance_score, search_query, view_count,
      duration_seconds, discovered_at, last_seen_at, is_approved, is_active
    FROM game_videos
    WHERE is_active = true
    ORDER BY relevance_score DESC, published_at DESC NULLS LAST
    LIMIT ${limit}
  `;
  return rows.map(mapRow);
}

/** Schválení videa pro veřejné zobrazení. */
export async function approveGameVideo(id: number): Promise<GameVideoRecord | null> {
  const { rows } = await sql<Row>`
    UPDATE game_videos
    SET is_approved = true, is_active = true
    WHERE id = ${id}
    RETURNING
      id, game_slug, platform, external_id, title, channel_id, channel_title,
      thumbnail_url, published_at, relevance_score, search_query, view_count,
      duration_seconds, discovered_at, last_seen_at, is_approved, is_active
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

/** Odmítnutí videa — zůstává v DB (kvůli deduplikaci), ale je neaktivní. */
export async function rejectGameVideo(id: number): Promise<GameVideoRecord | null> {
  const { rows } = await sql<Row>`
    UPDATE game_videos
    SET is_approved = false, is_active = false
    WHERE id = ${id}
    RETURNING
      id, game_slug, platform, external_id, title, channel_id, channel_title,
      thumbnail_url, published_at, relevance_score, search_query, view_count,
      duration_seconds, discovered_at, last_seen_at, is_approved, is_active
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

/**
 * Veřejně zobrazitelná videa hry — POUZE schválená a aktivní, maximálně
 * MAX_PUBLIC_GAME_VIDEOS. Řazení dává přednost relevanci (kvalitnější
 * video nesmí vypadnout jen proto, že je starší), datum je jen druhý
 * klíč. Prázdný seznam = sekce se na detailu vůbec nevykreslí.
 */
export async function getApprovedGameVideos(
  gameSlug: string,
  limit: number = MAX_PUBLIC_GAME_VIDEOS
): Promise<GameVideoRecord[]> {
  const { rows } = await sql<Row>`
    SELECT
      id, game_slug, platform, external_id, title, channel_id, channel_title,
      thumbnail_url, published_at, relevance_score, search_query, view_count,
      duration_seconds, discovered_at, last_seen_at, is_approved, is_active
    FROM game_videos
    WHERE game_slug = ${gameSlug}
      AND platform = 'youtube'
      AND is_approved = true
      AND is_active = true
    ORDER BY relevance_score DESC, published_at DESC NULLS LAST
    LIMIT ${limit}
  `;
  return rows.map(mapRow);
}

/**
 * Videa pro homepage — jen schválená a aktivní, napříč hrami, s diverzitou
 * (max 1, případně 2 na hru — viz lib/games/video-selection.ts). Čte se
 * výhradně z DB; volající si výsledek chrání `.catch(() => [])`, aby
 * výpadek DB neshodil stránku.
 */
export async function getHomepageGameVideos(limit: number = HOMEPAGE_GAME_VIDEOS_LIMIT): Promise<GameVideoRecord[]> {
  const { rows } = await sql<Row>`
    SELECT
      id, game_slug, platform, external_id, title, channel_id, channel_title,
      thumbnail_url, published_at, relevance_score, search_query, view_count,
      duration_seconds, discovered_at, last_seen_at, is_approved, is_active
    FROM game_videos
    WHERE platform = 'youtube'
      AND is_approved = true
      AND is_active = true
    ORDER BY relevance_score DESC, published_at DESC NULLS LAST
    LIMIT 60
  `;
  return selectDiverseVideos(rows.map(mapRow), limit);
}
