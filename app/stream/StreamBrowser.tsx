"use client";

import { useMemo, useState } from "react";
import type { LiveStream, Platform } from "../../lib/streams/types";
import type { PromotionEntry } from "../../lib/universal-content-api/types";
import AdPlaceholder from "../components/AdPlaceholder";
import AffiliateBanner from "../components/AffiliateBanner";

const PLATFORM_LABEL: Record<Platform, string> = {
  twitch: "Twitch",
  youtube: "YouTube",
  kick: "Kick",
};

const PLATFORM_BADGE_CLASS: Record<Platform, string> = {
  twitch: "border-violet-400/40 bg-violet-500/20 text-violet-300",
  youtube: "border-red-400/40 bg-red-500/20 text-red-300",
  kick: "border-emerald-400/40 bg-emerald-500/20 text-emerald-300",
};

const PROVIDER_ERROR_LABEL: Record<Platform, string> = {
  twitch: "Twitch data se momentálně nepodařilo obnovit.",
  youtube: "YouTube data se momentálně nepodařilo obnovit.",
  kick: "Kick data se momentálně nepodařilo obnovit.",
};

const FILTERS: { key: "all" | Platform; label: string }[] = [
  { key: "all", label: "Vše" },
  { key: "twitch", label: "Twitch" },
  { key: "youtube", label: "YouTube" },
  { key: "kick", label: "Kick" },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Názvy streamů bývají jedna dlouhá věta bez interpunkce (nebo dokonce
// bez mezer, jen emoji za sebou) — místo neomezeně dlouhého jednoho
// řádku ho rozdělíme po pěti slovech na kratší, čitelnější řádky.
function breakEveryNWords(text: string, n = 5): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [text];
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += n) {
    lines.push(words.slice(i, i + n).join(" "));
  }
  return lines;
}

export default function StreamBrowser({
  streams,
  totalViewers,
  failedPlatforms,
  updatedAt,
  bannerPromotion = null,
}: {
  streams: LiveStream[];
  totalViewers: number | null;
  failedPlatforms: Platform[];
  updatedAt: string;
  bannerPromotion?: PromotionEntry | null;
}) {
  const [filter, setFilter] = useState<"all" | Platform>("all");

  const filtered = useMemo(
    () => (filter === "all" ? streams : streams.filter((s) => s.platform === filter)),
    [streams, filter]
  );

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center font-serif text-lg text-amber-300">
        <span>
          Právě živě: {streams.length} {streams.length === 1 ? "stream" : "streamů"}
        </span>
        {totalViewers !== null && (
          <span className="text-sm text-cyan-100/60">
            Celkem sleduje: {totalViewers.toLocaleString("cs-CZ")}
          </span>
        )}
      </div>
      <p className="mt-1 text-center text-xs text-cyan-100/50">
        Seznam se aktualizuje přibližně jednou za minutu. Aktualizováno:{" "}
        {formatTime(updatedAt)}
      </p>

      {failedPlatforms.length > 0 && (
        <div className="mx-auto mt-4 max-w-xl space-y-1 text-center text-xs text-amber-300/80">
          {failedPlatforms.map((p) => (
            <p key={p}>{PROVIDER_ERROR_LABEL[p]}</p>
          ))}
        </div>
      )}

      <div className="mx-auto mt-6 max-w-3xl">
        {bannerPromotion?.imageUrl ? (
          <AffiliateBanner imageSrc={bannerPromotion.imageUrl} href={bannerPromotion.href} title={bannerPromotion.title} />
        ) : (
          <AdPlaceholder />
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2 font-serif">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`rounded-md border px-4 py-1.5 text-sm transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
              filter === f.key
                ? "border-amber-300 bg-amber-400 text-gray-900"
                : "border-white/15 bg-white/10 text-cyan-100/80 hover:border-amber-400/50 hover:bg-white/20"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-cyan-100/60">
          Teď zrovna nikdo How to Fish nestreamuje. Zkus to za chvíli znovu.
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-lg border border-white/10">
          <div className="hidden bg-white/5 px-4 py-2 text-xs uppercase tracking-wide text-cyan-100/50 sm:flex">
            <span className="w-24">Platforma</span>
            <span className="flex-1">Streamer a název</span>
            <span className="w-20 text-right">Diváci</span>
            <span className="w-24 text-right">Live od</span>
            <span className="w-24 text-right">Odkaz</span>
          </div>
          <ul className="divide-y divide-white/10">
            {filtered.map((stream) => (
              <StreamRow key={stream.id} stream={stream} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StreamRow({ stream }: { stream: LiveStream }) {
  const [thumbFailed, setThumbFailed] = useState(false);

  return (
    <li className="flex flex-col gap-2 px-4 py-3 transition hover:bg-white/5 sm:flex-row sm:items-center">
      <div className="sm:w-24">
        <span
          className={`inline-block rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${PLATFORM_BADGE_CLASS[stream.platform]}`}
        >
          {PLATFORM_LABEL[stream.platform]}
        </span>
      </div>

      <div className="flex flex-1 items-center gap-3">
        {stream.thumbnailUrl && !thumbFailed && (
          // Miniatury přicházejí z externích CDN tří různých platforem
          // (nepředvídatelné domény) — next/image by vyžadoval pevný
          // allowlist hostů, proto obyčejný <img> s fallbackem při chybě.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stream.thumbnailUrl}
            alt=""
            loading="lazy"
            onError={() => setThumbFailed(true)}
            className="hidden h-10 w-16 shrink-0 rounded object-cover sm:block"
          />
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{stream.channelName}</p>
          <p className="break-words text-sm text-cyan-100/70">
            {breakEveryNWords(stream.title).map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </p>
          {stream.language && (
            <p className="text-xs text-cyan-100/40">{stream.language.toUpperCase()}</p>
          )}
        </div>
      </div>

      <div className="text-sm text-cyan-100/70 sm:w-20 sm:text-right">
        {stream.viewerCount !== undefined
          ? stream.viewerCount.toLocaleString("cs-CZ")
          : "—"}
      </div>

      <div className="text-xs text-cyan-100/50 sm:w-24 sm:text-right">
        {stream.startedAt ? formatTime(stream.startedAt) : "—"}
      </div>

      <div className="sm:w-24 sm:text-right">
        <a
          href={stream.streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md bg-amber-400 px-3 py-1.5 font-serif text-xs text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          Sledovat
        </a>
      </div>
    </li>
  );
}
