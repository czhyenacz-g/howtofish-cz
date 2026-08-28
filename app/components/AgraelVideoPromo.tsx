"use client";

import { useState } from "react";
import Image from "next/image";

// Lite YouTube embed — jen statický náhled (next/image, i.ytimg.com),
// skutečný iframe se vloží do DOM až po kliknutí (žádný autoplay/zvuk
// při načtení stránky, žádná zbytečná váha iframu, dokud ho nikdo
// nechce). Projekt zatím nemá žádnou vlastní YouTube embed komponentu
// ani lite-embed knihovnu (ověřeno) — tenhle vzor je zatím použitý jen
// tady, proto zůstává jako jedna komponenta, ne extrahovaný generický
// helper (viz zadání "nevytvářej zbytečnou abstrakci kvůli pár řádkům").
const VIDEO_ID = "AXKRnUOtGHg";
const YOUTUBE_WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const VIDEO_TITLE = "Agraelus – Jak jsem se stal rybářem | How to Fish";

export default function AgraelVideoPromo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      aria-labelledby="agrael-video-heading"
      className="overflow-hidden rounded-lg border border-cyan-400/25 bg-[#0e3347]/80"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-video w-full shrink-0 sm:w-[42%]">
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
              title={VIDEO_TITLE}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 h-full w-full"
              aria-label={`Přehrát video: ${VIDEO_TITLE}`}
            >
              <Image
                src={`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`}
                alt=""
                fill
                loading="lazy"
                sizes="(min-width: 640px) 42vw, 100vw"
                className="object-cover"
              />
              <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/10" aria-hidden="true" />
              <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/80 bg-black/50 text-2xl text-white transition group-hover:scale-105 group-hover:border-amber-300 group-hover:bg-amber-400 group-hover:text-gray-900">
                  ▶
                </span>
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center gap-1.5 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">🎣 Video ze hry</p>
          <h2 id="agrael-video-heading" className="font-serif text-lg text-white sm:text-xl">
            Agraelus vyzkoušel How to Fish
          </h2>
          <p className="text-sm text-cyan-100/80">Jak jsem se stal rybářem</p>
          <p className="text-xs text-cyan-100/50">Agraelovo Stream Šílenství · cca 1 h 37 min</p>
          <p className="mt-1 text-sm text-cyan-100/80">Podívej se na How to Fish v praxi.</p>

          {playing ? (
            <a
              href={YOUTUBE_WATCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-[44px] w-fit items-center gap-1.5 rounded-md border border-amber-300/60 bg-amber-400/10 px-4 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Otevřít na YouTube ↗
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="mt-2 inline-flex min-h-[44px] w-fit items-center gap-1.5 rounded-md border border-amber-300/60 bg-amber-400/10 px-4 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              ▶ Pustit video
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
