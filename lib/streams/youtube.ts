import type { LiveStream, ProviderResult } from "./types";
import { youTubeApiGet } from "../youtube/client.ts";

// Oficiální YouTube Data API v3. search.list stojí 100 quota jednotek za
// volání (proto jen jedno, cachované 60s), videos.list na doplnění
// viewerCount/startedAt stojí jen 1 jednotku. Dokumentace:
// https://developers.google.com/youtube/v3/docs
//
// Samotné HTTP volání (klíč, URL, timeout, chyby) žije v lib/youtube/
// client.ts — používá ho i discovery videí k hrám (lib/games/*), aby v
// projektu nebyla druhá implementace YouTube volání.
const GAMING_CATEGORY_ID = "20";
const SEARCH_QUERY = "How to Fish game Dazed Games";
const MAX_RESULTS = 15;

// "How to Fish" je i běžná anglická fráze o skutečném rybaření — hlídáme
// se proti false positives kombinací gaming kategorie a klíčových slov.
//
// "how to fish" je samo o sobě pozitivní signál (ne jen "how to fish
// game") — reálné CZ/SK streamer titulky typicky nemají žádné z
// ostatních anglických buzzwords (gameplay/steam/co-op apod.), jen
// samotný název hry + český text (např. "JAK JSEM SE STAL RYBÁŘEM |
// HOW TO FISH | #1"), a bez tohohle klíčového slova je tenhle filtr
// dřív takové titulky tiše zahazoval, i když reálně o hru šlo. Riziko
// false positive od skutečných rybářských návodů zůstává nízké — ty
// prakticky nikdy nejsou v YouTube kategorii "Gaming" ani jako živý
// stream (viz GAMING_CATEGORY_ID + eventType "live" v requestu výš),
// takže se sem vůbec nedostanou k tomuhle druhotnému textovému filtru.
const POSITIVE_KEYWORDS = [
  "how to fish",
  "dazed games",
  "gameplay",
  "steam",
  "co-op",
  "coop",
  "boss fight",
  "spider crab",
  "pufferfish",
];

const NEGATIVE_KEYWORDS = [
  "bass fishing",
  "carp fishing",
  "fly fishing",
  "ice fishing",
  "kayak fishing",
  "tackle",
  "rod and reel",
  "salmon fishing",
  "trout fishing",
];

export function looksRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  const positive = POSITIVE_KEYWORDS.filter((k) => text.includes(k)).length;
  const negative = NEGATIVE_KEYWORDS.filter((k) => text.includes(k)).length;
  if (negative > positive) return false;
  return positive > 0;
}

type SearchItem = {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    thumbnails?: { medium?: { url: string } };
  };
};

type VideoItem = {
  id: string;
  liveStreamingDetails?: {
    actualStartTime?: string;
    concurrentViewers?: string;
  };
  snippet?: {
    defaultLanguage?: string;
    defaultAudioLanguage?: string;
  };
};

export async function getYouTubeStreams(): Promise<ProviderResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return { platform: "youtube", status: "not-configured", streams: [] };
  }

  try {
    const searchData = await youTubeApiGet<{ items: SearchItem[] }>(
      "search",
      {
        part: "snippet",
        eventType: "live",
        type: "video",
        videoCategoryId: GAMING_CATEGORY_ID,
        q: SEARCH_QUERY,
        maxResults: String(MAX_RESULTS),
      },
      { revalidateSeconds: 60 }
    );

    const relevant = searchData.items.filter((item) =>
      looksRelevant(item.snippet.title, item.snippet.description)
    );
    if (relevant.length === 0) {
      return { platform: "youtube", status: "ok", streams: [] };
    }

    const videosData = await youTubeApiGet<{ items: VideoItem[] }>(
      "videos",
      {
        part: "liveStreamingDetails,snippet",
        id: relevant.map((item) => item.id.videoId).join(","),
      },
      { revalidateSeconds: 60 }
    );
    const detailsById = new Map(videosData.items.map((v) => [v.id, v]));

    const streams: LiveStream[] = relevant.map((item) => {
      const videoId = item.id.videoId;
      const details = detailsById.get(videoId);
      const viewers = details?.liveStreamingDetails?.concurrentViewers;
      return {
        id: `youtube:${videoId}`,
        platform: "youtube",
        channelName: item.snippet.channelTitle,
        channelUrl: `https://www.youtube.com/channel/${item.snippet.channelId}`,
        title: item.snippet.title,
        streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url,
        viewerCount: viewers ? Number(viewers) : undefined,
        language:
          details?.snippet?.defaultLanguage ||
          details?.snippet?.defaultAudioLanguage ||
          undefined,
        startedAt: details?.liveStreamingDetails?.actualStartTime,
      };
    });

    return { platform: "youtube", status: "ok", streams };
  } catch (error) {
    console.error("[streams] YouTube provider failed:", error);
    return { platform: "youtube", status: "error", streams: [] };
  }
}
