"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { creatorVideos, type CreatorVideo } from "../../data/creator-videos";
import { nextSlideIndex, prevSlideIndex } from "./creator-video-carousel-logic";

const ROTATE_INTERVAL_MS = 6000;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

// Nahrazuje dřívější AgraelVideoPromo (jeden pevný slide) — stejný lite
// YouTube embed vzor (thumbnail → iframe až po kliknutí), teď generovaný
// z data/creator-videos.ts pro víc tvůrců napříč YouTube i Kick. Přidání
// dalšího tvůrce = jeden objekt v datech, žádná změna tady (viz zadání
// "žádný hardcoded počet slidů v UI").
export default function CreatorVideoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const activeSlide = creatorVideos[activeIndex];
  const isPlaying = playingIndex === activeIndex;
  const paused = hovered || isPlaying;

  // Autoplay — efekt se restartuje při KAŽDÉ změně activeIndex (autoplay
  // i manuální navigace), takže manuální přepnutí vždy dostane plných
  // 6 s do dalšího kroku (viz zadání "při manuálním přepnutí: reset").
  // `paused` (hover nebo spuštěné video) rotaci úplně zastaví.
  useEffect(() => {
    if (paused || reducedMotion || creatorVideos.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((current) => nextSlideIndex(current, creatorVideos.length));
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [activeIndex, paused, reducedMotion]);

  function goTo(index: number) {
    setActiveIndex(index);
    // Opuštění slidu se spuštěným videem ho zastaví (jinak by běželo na
    // pozadí a už nikdy by ho nešlo znovu spustit ze stejného tlačítka).
    setPlayingIndex(null);
  }

  return (
    <section
      aria-labelledby="creator-video-carousel-heading"
      aria-roledescription="carousel"
      className="overflow-hidden rounded-lg border border-cyan-400/25 bg-[#0e3347]/80"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p
        id="creator-video-carousel-heading"
        className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-cyan-300 sm:px-5"
      >
        🎬 CZ/SK tvůrci hrají How to Fish
      </p>

      <div key={activeIndex} className={reducedMotion ? "flex flex-col sm:flex-row" : "flex flex-col sm:flex-row animate-carousel-fade-in"}>
        <CarouselMedia slide={activeSlide} playing={isPlaying} onPlay={() => setPlayingIndex(activeIndex)} />
        <CarouselInfo slide={activeSlide} playing={isPlaying} onPlay={() => setPlayingIndex(activeIndex)} />
      </div>

      <div className="flex items-center gap-3 border-t border-white/10 px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={() => goTo(prevSlideIndex(activeIndex, creatorVideos.length))}
          aria-label="Předchozí video"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/15 text-lg text-cyan-100/80 transition hover:border-amber-400/60 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:h-9 sm:w-9 sm:text-base"
        >
          ←
        </button>

        <div className="flex flex-1 items-center justify-center gap-2">
          {creatorVideos.map((slide, index) => (
            <button
              key={slide.creator}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Zobrazit video ${index + 1}: ${slide.creator}`}
              aria-current={index === activeIndex}
              className="flex h-8 w-8 items-center justify-center"
            >
              <span
                className={`block overflow-hidden rounded-full transition-all ${
                  index === activeIndex ? "h-2 w-6 bg-white/15" : "h-2 w-2 bg-white/25 hover:bg-white/40"
                }`}
              >
                {index === activeIndex && !reducedMotion && (
                  <span
                    key={activeIndex}
                    className="block h-full w-full origin-left bg-amber-400 animate-carousel-progress"
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                  />
                )}
                {index === activeIndex && reducedMotion && <span className="block h-full w-full bg-amber-400" />}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(nextSlideIndex(activeIndex, creatorVideos.length))}
          aria-label="Další video"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/15 text-lg text-cyan-100/80 transition hover:border-amber-400/60 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:h-9 sm:w-9 sm:text-base"
        >
          →
        </button>
      </div>
    </section>
  );
}

function CarouselMedia({
  slide,
  playing,
  onPlay,
}: {
  slide: CreatorVideo;
  playing: boolean;
  onPlay: () => void;
}) {
  const [thumbnailSrc, setThumbnailSrc] = useState(
    slide.youtubeId ? `https://img.youtube.com/vi/${slide.youtubeId}/maxresdefault.jpg` : ""
  );

  if (slide.platform === "kick") {
    return (
      <div className="relative aspect-video w-full shrink-0 sm:w-[42%]">
        {slide.image && (
          <Image src={slide.image} alt="" fill sizes="(min-width: 640px) 42vw, 100vw" className="object-cover" />
        )}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 border-b border-white/10 text-center sm:border-b-0 sm:border-r ${
            slide.image ? "bg-black/55" : "bg-gradient-to-br from-[#0a2438] to-[#123c4d]"
          }`}
        >
          <span className="rounded border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-cyan-100/90">
            Kick
          </span>
          <p className="font-serif text-xl text-white">{slide.creator}</p>
          <p className="text-xs uppercase tracking-wide text-cyan-100/50">How to Fish</p>
        </div>
      </div>
    );
  }

  if (playing && slide.youtubeId) {
    return (
      <div className="relative aspect-video w-full shrink-0 sm:w-[42%]">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${slide.youtubeId}?autoplay=1&rel=0`}
          title={`${slide.title} | How to Fish`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full shrink-0 sm:w-[42%]">
      <button
        type="button"
        onClick={onPlay}
        className="group absolute inset-0 h-full w-full"
        aria-label={`Přehrát video: ${slide.title}`}
      >
        <Image
          src={thumbnailSrc}
          alt=""
          fill
          loading="lazy"
          sizes="(min-width: 640px) 42vw, 100vw"
          className="object-cover"
          onError={() => setThumbnailSrc(`https://img.youtube.com/vi/${slide.youtubeId}/hqdefault.jpg`)}
        />
        <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/10" aria-hidden="true" />
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/80 bg-black/50 text-2xl text-white transition group-hover:scale-105 group-hover:border-amber-300 group-hover:bg-amber-400 group-hover:text-gray-900">
            ▶
          </span>
        </span>
      </button>
    </div>
  );
}

function CarouselInfo({
  slide,
  playing,
  onPlay,
}: {
  slide: CreatorVideo;
  playing: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-1.5 p-4 sm:p-5">
      <span className="w-fit rounded border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-100/70">
        {slide.platform === "youtube" ? "YouTube" : "Kick"}
      </span>
      <p className="font-serif text-lg text-white sm:text-xl">{slide.title}</p>
      <p className="text-sm text-cyan-100/80">{slide.subtitle}</p>

      {slide.platform === "youtube" ? (
        playing ? (
          <a
            href={slide.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-[44px] w-fit items-center gap-1.5 rounded-md border border-amber-300/60 bg-amber-400/10 px-4 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Otevřít na YouTube ↗
          </a>
        ) : (
          <button
            type="button"
            onClick={onPlay}
            className="mt-2 inline-flex min-h-[44px] w-fit items-center gap-1.5 rounded-md border border-amber-300/60 bg-amber-400/10 px-4 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            ▶ {slide.ctaLabel}
          </button>
        )
      ) : (
        <a
          href={slide.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-[44px] w-fit items-center gap-1.5 rounded-md border border-amber-300/60 bg-amber-400/10 px-4 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          ▶ {slide.ctaLabel}
        </a>
      )}
    </div>
  );
}
