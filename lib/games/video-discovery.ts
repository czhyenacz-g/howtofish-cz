import type { GameEntry } from "../../data/games.ts";
import { YouTubeApiError, isYouTubeConfigured, parseIsoDuration, youTubeApiGet } from "../youtube/client.ts";
import { getVideoQueriesForGame } from "./video-queries.ts";
import { isRelevantEnough, scoreVideoCandidate } from "./video-relevance.ts";

// Discovery kandidátních YouTube videí k jedné hře.
//
// KVÓTA (viz zadání bod 4): search.list stojí 100 jednotek za volání,
// videos.list jen 1. Pro 4 pilotní hry × 5 dotazů to je 20×100 + 4×1 =
// 2004 jednotek (denní limit je 10 000). Discovery se proto NIKDY
// nespouští při renderu stránky — jen ručně přes CLI
// (scripts/game-videos-discover.ts). Tenhle modul sám nic neukládá,
// jen vrací ohodnocené kandidáty.
//
// Fail-soft: chyba jednoho dotazu nezastaví ostatní, chyby se vrací v
// `errors` a volající je jen zaloguje.

const SEARCH_MAX_RESULTS = 10;
const DETAILS_REVALIDATE_SECONDS = 21_600; // 6 h

/** Kolik kvótních jednotek jeden discovery run téhle hry spotřebuje. */
export function estimateQuotaUnits(queryCount: number): number {
  return queryCount * 100 + (queryCount > 0 ? 1 : 0);
}

export type RawVideo = {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl?: string;
  /** Dotaz, kterým bylo video nalezeno (první výskyt). */
  query: string;
};

export type ScoredVideoCandidate = RawVideo & {
  relevanceScore: number;
  reasons: string[];
  viewCount?: number;
  durationSeconds?: number;
};

export type GameDiscoveryResult = {
  gameSlug: string;
  gameName: string;
  queries: string[];
  /** Kolik syrových výsledků API vrátilo (před deduplikací i filtrem). */
  rawCount: number;
  /** Kolik unikátních videí zůstalo po deduplikaci podle videoId. */
  dedupedCount: number;
  /** Kandidáti, kteří prošli relevančním filtrem — k ručnímu schválení. */
  candidates: ScoredVideoCandidate[];
  errors: string[];
  /**
   * True = narazili jsme na vyčerpaný denní limit YouTube search
   * (`search.list` má vlastní metriku „Search Queries per day“, nezávislou
   * na 10 000 kvótních jednotkách). Data z takového běhu jsou NEÚPLNÁ —
   * CLI na to upozorní a skončí s chybou, aby se částečný výsledek
   * nevydával za plný.
   */
  quotaExceeded: boolean;
};

type SearchResponse = {
  items?: {
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      description?: string;
      channelId?: string;
      channelTitle?: string;
      publishedAt?: string;
      thumbnails?: { medium?: { url?: string } };
    };
  }[];
};

type VideosResponse = {
  items?: {
    id?: string;
    contentDetails?: { duration?: string };
    statistics?: { viewCount?: string };
  }[];
};

/** Deduplikace podle videoId — vyhrává první výskyt (a jeho dotaz). */
export function dedupeVideos(videos: RawVideo[]): RawVideo[] {
  const byId = new Map<string, RawVideo>();
  for (const video of videos) {
    if (!video.videoId) continue;
    if (!byId.has(video.videoId)) byId.set(video.videoId, video);
  }
  return Array.from(byId.values());
}

async function searchQuery(query: string): Promise<RawVideo[]> {
  const data = await youTubeApiGet<SearchResponse>(
    "search",
    {
      part: "snippet",
      type: "video",
      q: query,
      maxResults: String(SEARCH_MAX_RESULTS),
    },
    { revalidateSeconds: DETAILS_REVALIDATE_SECONDS }
  );

  return (data.items ?? []).flatMap((item) => {
    const videoId = item.id?.videoId;
    const snippet = item.snippet;
    if (!videoId || !snippet?.title) return [];
    return [
      {
        videoId,
        title: snippet.title,
        description: snippet.description ?? "",
        channelId: snippet.channelId ?? "",
        channelTitle: snippet.channelTitle ?? "",
        publishedAt: snippet.publishedAt ?? "",
        thumbnailUrl: snippet.thumbnails?.medium?.url,
        query,
      },
    ];
  });
}

/** Doplní viewCount + délku (jedno videos.list volání = 1 kvótní jednotka). */
async function enrichWithDetails(videos: RawVideo[]): Promise<Map<string, { viewCount?: number; durationSeconds?: number }>> {
  const map = new Map<string, { viewCount?: number; durationSeconds?: number }>();
  if (videos.length === 0) return map;

  const data = await youTubeApiGet<VideosResponse>(
    "videos",
    { part: "contentDetails,statistics", id: videos.map((video) => video.videoId).join(",") },
    { revalidateSeconds: DETAILS_REVALIDATE_SECONDS }
  );

  for (const item of data.items ?? []) {
    if (!item.id) continue;
    const viewCount = item.statistics?.viewCount ? Number(item.statistics.viewCount) : undefined;
    map.set(item.id, { viewCount, durationSeconds: parseIsoDuration(item.contentDetails?.duration) });
  }
  return map;
}

/** Je chyba způsobena vyčerpaným denním limitem YouTube search? */
export function isYouTubeQuotaError(error: unknown): boolean {
  return error instanceof YouTubeApiError && error.status === 429;
}

export async function discoverVideosForGame(game: GameEntry): Promise<GameDiscoveryResult> {
  const queries = getVideoQueriesForGame(game);
  const result: GameDiscoveryResult = {
    gameSlug: game.slug,
    gameName: game.name,
    queries,
    rawCount: 0,
    dedupedCount: 0,
    candidates: [],
    errors: [],
    quotaExceeded: false,
  };

  if (queries.length === 0) return result;

  if (!isYouTubeConfigured()) {
    result.errors.push("YOUTUBE_API_KEY není nastavený — discovery se přeskočil.");
    return result;
  }

  const raw: RawVideo[] = [];
  for (const query of queries) {
    try {
      raw.push(...(await searchQuery(query)));
    } catch (error) {
      if (isYouTubeQuotaError(error)) {
        // Další dotazy by stejně selhaly a výsledek by byl tiše neúplný.
        result.quotaExceeded = true;
        result.errors.push(`"${query}": vyčerpaný denní limit YouTube search (HTTP 429).`);
        break;
      }
      result.errors.push(`"${query}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  result.rawCount = raw.length;

  const deduped = dedupeVideos(raw);
  result.dedupedCount = deduped.length;
  if (deduped.length === 0) return result;

  let details = new Map<string, { viewCount?: number; durationSeconds?: number }>();
  try {
    details = await enrichWithDetails(deduped);
  } catch (error) {
    // Doplňková metadata nejsou kritická — bez nich se jen neukáže
    // viewCount/délka, skórování funguje dál.
    result.errors.push(`videos.list: ${error instanceof Error ? error.message : String(error)}`);
  }

  for (const video of deduped) {
    const extra = details.get(video.videoId);
    const score = scoreVideoCandidate(
      {
        title: video.title,
        description: video.description,
        query: video.query,
        durationSeconds: extra?.durationSeconds,
      },
      game
    );
    if (score.rejected || !isRelevantEnough(score.score)) continue;

    result.candidates.push({
      ...video,
      relevanceScore: score.score,
      reasons: score.reasons,
      viewCount: extra?.viewCount,
      durationSeconds: extra?.durationSeconds,
    });
  }

  result.candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return result;
}
