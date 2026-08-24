import type { LiveStream, ProviderResult } from "./types";

// Oficiální YouTube Data API v3. search.list stojí 100 quota jednotek za
// volání (proto jen jedno, cachované 60s), videos.list na doplnění
// viewerCount/startedAt stojí jen 1 jednotku. Dokumentace:
// https://developers.google.com/youtube/v3/docs
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const GAMING_CATEGORY_ID = "20";
const SEARCH_QUERY = "How to Fish game Dazed Games";
const MAX_RESULTS = 15;

// "How to Fish" je i běžná anglická fráze o skutečném rybaření — hlídáme
// se proti false positives kombinací gaming kategorie a klíčových slov.
const POSITIVE_KEYWORDS = [
  "dazed games",
  "how to fish game",
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

function looksRelevant(title: string, description: string): boolean {
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
    const searchParams = new URLSearchParams({
      part: "snippet",
      eventType: "live",
      type: "video",
      videoCategoryId: GAMING_CATEGORY_ID,
      q: SEARCH_QUERY,
      maxResults: String(MAX_RESULTS),
      key: apiKey,
    });
    const searchRes = await fetch(`${SEARCH_URL}?${searchParams.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!searchRes.ok) {
      throw new Error(`YouTube search failed: ${searchRes.status}`);
    }
    const searchData = (await searchRes.json()) as { items: SearchItem[] };

    const relevant = searchData.items.filter((item) =>
      looksRelevant(item.snippet.title, item.snippet.description)
    );
    if (relevant.length === 0) {
      return { platform: "youtube", status: "ok", streams: [] };
    }

    const ids = relevant.map((item) => item.id.videoId).join(",");
    const videosParams = new URLSearchParams({
      part: "liveStreamingDetails,snippet",
      id: ids,
      key: apiKey,
    });
    const videosRes = await fetch(`${VIDEOS_URL}?${videosParams.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!videosRes.ok) {
      throw new Error(`YouTube videos lookup failed: ${videosRes.status}`);
    }
    const videosData = (await videosRes.json()) as { items: VideoItem[] };
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
