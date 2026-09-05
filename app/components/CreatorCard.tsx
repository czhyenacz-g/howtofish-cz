import Link from "next/link";
import type { CreatorProfile } from "../../data/creators.ts";
import type { LiveStream } from "../../lib/streams/types.ts";
import { getCreatorPlatforms } from "../../lib/creators/platform.ts";
import { PLATFORM_BADGE_CLASS, PLATFORM_LABEL } from "../stream/StreamBrowser.tsx";
import CreatorImage from "./CreatorImage.tsx";
import { LiveIcon } from "./icons";

/**
 * Karta tvůrce sdílená mezi /streameri (katalog) a homepage sekcí
 * "Streameři" (zadání bod 4/7B) — jedna implementace, ne dvě podobné.
 * `liveStream` (viz lib/creators/live-match.ts) je volitelný — když je
 * tvůrce zrovna live, karta se vizuálně zvýrazní; není-li, karta pořád
 * dává smysl (zadání: "neskrývej offline streamery").
 */
export default function CreatorCard({ creator, liveStream }: { creator: CreatorProfile; liveStream?: LiveStream }) {
  const platforms = getCreatorPlatforms(creator);
  const isLive = Boolean(liveStream);

  return (
    <Link
      href={`/streameri/${creator.slug}`}
      className={`group flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 sm:p-5 ${
        isLive
          ? "border-[#ffb199] bg-gradient-to-b from-[#5c2318] to-[#2a0f09] shadow-[0_0_16px_1px_rgba(255,107,82,0.25)] hover:border-[#ff8a75]"
          : "border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-white/10"
      }`}
    >
      <CreatorImage creator={creator}>
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-lg text-white group-hover:text-amber-300">
            {creator.name} <span className="text-sm text-cyan-100/40">{creator.country === "SK" ? "🇸🇰" : "🇨🇿"}</span>
          </p>
          {isLive ? (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#ff9c85]">
              <LiveIcon className="h-3 w-3 shrink-0" />
              Právě live
            </p>
          ) : (
            platforms.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {platforms.map((p) => (
                  <span key={p} className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PLATFORM_BADGE_CLASS[p]}`}>
                    {PLATFORM_LABEL[p]}
                  </span>
                ))}
              </div>
            )
          )}
        </div>
      </CreatorImage>

      {isLive && liveStream && <p className="truncate text-sm text-cyan-100/80">{liveStream.title}</p>}

      <span className="mt-auto inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-amber-300 group-hover:underline">
        Profil streamera →
      </span>
    </Link>
  );
}
