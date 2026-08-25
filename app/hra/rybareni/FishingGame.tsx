"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { FishEntry } from "../../../data/fish";
import FishSilhouette from "../../components/FishSilhouette";
import VerificationBadge from "../../components/VerificationBadge";

const LANE_COUNT = 5;
const CAST_MS = 550;
const RESULT_MS = 450;
const FLIP_CHANCE = 0.4;
const FLIP_INTERVAL_MS = 900;

type HookStatus = "idle" | "casting" | "result";

function pickFish(fish: FishEntry[], avoidSlug: string | null): FishEntry {
  if (fish.length === 1) return fish[0];
  let pick = fish[Math.floor(Math.random() * fish.length)];
  if (pick.slug === avoidSlug) {
    pick = fish[(fish.indexOf(pick) + 1) % fish.length];
  }
  return pick;
}

// Krátké herní zvuky — přehrané vždy od začátku (kvůli rychlému opakování
// při sérii kliknutí), hlasitost nastavená přímo na elementu, protože
// <audio> ji jako HTML atribut nepodporuje.
function playSound(ref: React.RefObject<HTMLAudioElement | null>, volume: number) {
  const audio = ref.current;
  if (!audio) return;
  audio.currentTime = 0;
  audio.volume = volume;
  audio.play().catch(() => {
    // Chybějící/neplatný soubor nebo zablokované přehrání — hra běží dál i bez zvuku.
  });
}

export default function FishingGame({ fish }: { fish: FishEntry[] }) {
  const [laneHasFish, setLaneHasFish] = useState<boolean[]>(() =>
    Array.from({ length: LANE_COUNT }, () => Math.random() < 0.5)
  );
  const [hookLane, setHookLane] = useState<number | null>(null);
  const [hookStatus, setHookStatus] = useState<HookStatus>("idle");
  const [lastHit, setLastHit] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [caught, setCaught] = useState<FishEntry | null>(null);
  const lastCaughtSlug = useRef<string | null>(null);
  const overlayHeadingRef = useRef<HTMLHeadingElement>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const failAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLaneHasFish((prev) =>
        prev.map((present) => (Math.random() < FLIP_CHANCE ? !present : present))
      );
    }, FLIP_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (caught && overlayHeadingRef.current) {
      overlayHeadingRef.current.focus();
    }
  }, [caught]);

  const handleLaneClick = useCallback(
    (lane: number) => {
      if (hookStatus !== "idle" || caught) return;

      playSound(clickAudioRef, 0.4);
      setHookLane(lane);
      setHookStatus("casting");

      window.setTimeout(() => {
        const hit = laneHasFish[lane];
        setLastHit(hit);
        setHookStatus("result");

        if (hit) {
          playSound(successAudioRef, 0.55);
          setLaneHasFish((prev) => prev.map((v, i) => (i === lane ? false : v)));
          setScore((s) => s + 1);
          setStreak((s) => {
            const next = s + 1;
            setBestStreak((b) => Math.max(b, next));
            return next;
          });
          const picked = pickFish(fish, lastCaughtSlug.current);
          lastCaughtSlug.current = picked.slug;
          window.setTimeout(() => setCaught(picked), RESULT_MS);
        } else {
          playSound(failAudioRef, 0.55);
          setStreak(0);
        }

        window.setTimeout(() => {
          setHookStatus("idle");
          setHookLane(null);
        }, RESULT_MS);
      }, CAST_MS);
    },
    [hookStatus, caught, laneHasFish, fish]
  );

  const dismissCatch = useCallback(() => setCaught(null), []);

  return (
    <div>
      <audio ref={clickAudioRef} src="/audio/click.mp3" preload="none" />
      <audio ref={successAudioRef} src="/audio/catch-success.mp3" preload="none" />
      <audio ref={failAudioRef} src="/audio/catch-fail.mp3" preload="none" />

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-serif text-lg text-amber-300">
        <span>Úlovky: {score}</span>
        <span className="text-sm text-cyan-100/60">
          Série: {streak} · Nejlepší série: {bestStreak}
        </span>
      </div>

      <div className="relative mt-4 h-72 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-[#bfe7f2] via-[#1c8a95] to-[#0c4a56] sm:h-96">
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full text-[#0a2438]/40"
        >
          <polygon
            points="0,60 180,80 360,50 540,85 720,55 900,90 1080,50 1260,75 1440,55 1440,120 0,120"
            fill="currentColor"
          />
        </svg>

        <div
          role="group"
          aria-label="Vodní hladina — vyber hejno a chyť úlovek"
          className="absolute inset-0 flex"
        >
          {laneHasFish.map((present, lane) => (
            <button
              key={lane}
              type="button"
              onClick={() => handleLaneClick(lane)}
              disabled={hookStatus !== "idle" || !!caught}
              aria-label={
                present ? `Hoď háček — ryba je poblíž` : `Hoď háček — zatím nic vidět`
              }
              className="relative flex-1 border-white/5 outline-none first:border-l-0 focus-visible:bg-white/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 disabled:cursor-default enabled:cursor-pointer enabled:hover:bg-white/5"
              style={{ borderLeftWidth: lane === 0 ? 0 : 1 }}
            >
              {present && (
                <FishSilhouette className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-swim text-[#0a2438]/70 motion-reduce:animate-none sm:h-10 sm:w-10" />
              )}

              {hookLane === lane && (
                <div
                  aria-hidden="true"
                  className={`absolute left-1/2 top-0 -translate-x-1/2 transition-transform duration-500 ease-in motion-reduce:transition-none ${
                    hookStatus === "idle" ? "translate-y-0" : "translate-y-[85%]"
                  }`}
                >
                  <div className="mx-auto h-16 w-px bg-white/70 sm:h-24" />
                  <div className="-mt-1 h-3 w-3 -rotate-45 rounded-b-full border-2 border-amber-300" />
                </div>
              )}
            </button>
          ))}
        </div>

        {hookStatus === "result" && hookLane !== null && (
          <p
            aria-live="polite"
            className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/50 px-3 py-1 font-serif text-sm text-white"
          >
            {lastHit ? "Máš ho!" : "Škoda, uteklo."}
          </p>
        )}

        {caught && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="catch-heading"
            className="absolute inset-0 flex items-center justify-center bg-black/70 p-4"
          >
            <div className="w-full max-w-xs rounded-lg border border-amber-300/40 bg-[#0e3347] p-5 text-center shadow-xl">
              <h2
                id="catch-heading"
                ref={overlayHeadingRef}
                tabIndex={-1}
                className="font-serif text-xl text-amber-300 outline-none"
              >
                Chytil jsi: {caught.name}
              </h2>
              {caught.czechName && (
                <p className="text-sm text-cyan-100/60">({caught.czechName})</p>
              )}
              <div className="mx-auto mt-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#0e4f66] to-[#1c8a95]">
                <FishSilhouette className="h-10 w-10 text-amber-300/80" />
              </div>
              <p className="mt-3 text-xs uppercase tracking-wide text-cyan-100/60">
                {caught.category === "ryba" ? "Ryba" : "Tvor"}
                {caught.rarity ? ` · ${caught.rarity}` : ""}
              </p>
              <p className="mt-1 text-xs">
                <VerificationBadge level={caught.verification} />
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href={`/ryby/${caught.slug}`}
                  className="rounded-md bg-amber-400 px-4 py-2 font-serif text-sm text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  Zjistit více
                </Link>
                <button
                  type="button"
                  onClick={dismissCatch}
                  className="rounded-md border border-white/20 px-4 py-2 font-serif text-sm text-cyan-100/80 transition hover:border-amber-400/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  Chytat dál
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-cyan-100/50">
        Klepni myší nebo prstem na hejno ve vodě. Funguje i na klávesnici (Tab + Enter).
      </p>
    </div>
  );
}
