import type { GameVideoRecord } from "../../lib/games/game-videos.ts";

/**
 * Karta schváleného YouTube videa — sdílená mezi sekcí na detailu hry
 * (/games/[slug]) a homepage. Záměrně jen thumbnail + odkaz na YouTube:
 * žádný iframe ani autoplay (viz zadání). `gameName` se zobrazí, když
 * karta stojí mimo detail konkrétní hry (homepage).
 */
export function formatVideoDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
}

export function formatVideoViews(viewCount: number | null): string | null {
  if (viewCount === null) return null;
  return `${viewCount.toLocaleString("cs-CZ")} zhlédnutí`;
}

export function formatVideoDuration(seconds: number | null): string | null {
  if (seconds === null || seconds <= 0) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

export default function GameVideoCard({ video, gameName }: { video: GameVideoRecord; gameName?: string }) {
  const date = formatVideoDate(video.publishedAt);
  const views = formatVideoViews(video.viewCount);
  const duration = formatVideoDuration(video.durationSeconds);
  const meta = [gameName, video.channelTitle, date, duration, views].filter(Boolean).join(" · ");

  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.externalId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0e3347]/60 transition hover:border-amber-400/60 hover:bg-[#0e3347] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <span className="relative block aspect-video w-full bg-black/30">
        {video.thumbnailUrl ? (
          // Externí YouTube CDN thumbnail — stejný vzor jako
          // HowToFishVideoCard (žádné rozšiřování remotePatterns).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : null}
      </span>
      <span className="flex flex-1 flex-col gap-1 p-3 text-left">
        <span className="font-serif text-sm text-white group-hover:text-amber-300 sm:text-base">{video.title}</span>
        <span className="text-xs text-cyan-100/60">{meta}</span>
      </span>
    </a>
  );
}
