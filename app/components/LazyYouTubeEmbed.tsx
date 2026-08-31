"use client";

import { useState } from "react";

// Stejný vzor jako CreatorVideoCarousel (thumbnail → iframe až po
// kliknutí, youtube-nocookie) — samostatná znovupoužitelná komponenta
// pro video detail stránky, kde nechceme víc těžkých iframe najednou
// (viz zadání "žádných 5 iframe při page loadu").
export default function LazyYouTubeEmbed({
  videoId,
  title,
  thumbnailUrl,
}: {
  videoId: string;
  title: string;
  thumbnailUrl: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Přehrát video: ${title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-lg border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- externí YouTube CDN thumbnail, next/image by vyžadoval remotePatterns */}
      <img src={thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-2xl text-gray-900 shadow-lg transition group-hover:scale-105">
          ▶
        </span>
      </span>
    </button>
  );
}
