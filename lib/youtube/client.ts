import "server-only";

// Minimální server-only klient pro oficiální YouTube Data API v3 — jedno
// místo, kde se čte YOUTUBE_API_KEY, staví URL a řeší timeout/chyby.
// Používá ho jak live provider (lib/streams/youtube.ts), tak discovery
// kandidátních videí (lib/games/video-discovery.ts) — žádná druhá
// implementace YouTube volání v projektu nevzniká.
//
// Scraping YouTube HTML se NEPOUŽÍVÁ (viz zadání) — jen oficiální API.

const API_BASE = "https://www.googleapis.com/youtube/v3";

/** Chybí YOUTUBE_API_KEY — volající se má zachovat fail-soft, ne spadnout. */
export class YouTubeNotConfiguredError extends Error {
  constructor() {
    super("YouTube Data API není nakonfigurované (chybí YOUTUBE_API_KEY).");
    this.name = "YouTubeNotConfiguredError";
  }
}

export class YouTubeApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "YouTubeApiError";
    this.status = status;
  }
}

export function isYouTubeConfigured(): boolean {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

export type YouTubeRequestOptions = {
  /**
   * Next.js fetch cache (`fetch(..., { next: { revalidate } })`) — mimo
   * Next runtime (CLI skripty) ji Node ignoruje, takže se nic nerozbije.
   */
  revalidateSeconds?: number;
  timeoutMs?: number;
};

/** Jedno GET volání na YouTube Data API. Vyhazuje YouTubeNotConfiguredError / YouTubeApiError. */
export async function youTubeApiGet<T>(
  endpoint: "search" | "videos" | "channels",
  params: Record<string, string>,
  options: YouTubeRequestOptions = {}
): Promise<T> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new YouTubeNotConfiguredError();

  const { revalidateSeconds = 60, timeoutMs = 8000 } = options;
  const query = new URLSearchParams({ ...params, key: apiKey });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_BASE}/${endpoint}?${query.toString()}`, {
      signal: controller.signal,
      next: { revalidate: revalidateSeconds },
    });
    if (!response.ok) {
      throw new YouTubeApiError(`YouTube ${endpoint} vrátilo HTTP ${response.status}.`, response.status);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new YouTubeApiError(`YouTube ${endpoint} neodpovídá včas.`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/** ISO 8601 duration z YouTube (`PT1H2M3S`) → sekundy. Neplatný/chybějící vstup = undefined. */
export function parseIsoDuration(duration: string | undefined): number | undefined {
  if (!duration) return undefined;
  const match = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration);
  if (!match) return undefined;
  const [, days, hours, minutes, seconds] = match;
  const total =
    Number(days ?? 0) * 86400 + Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0);
  return Number.isFinite(total) ? total : undefined;
}
