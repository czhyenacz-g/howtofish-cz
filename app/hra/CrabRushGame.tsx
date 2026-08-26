"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SpeakerIcon, SpeakerMuteIcon } from "../components/icons";
import CrabIcon from "./CrabIcon";
import { useCrunchSound } from "./useCrunchSound";
import { saveScoreAction, type SaveScoreState } from "./save-score-action";
import {
  applyHit,
  applyMiss,
  comboMultiplier,
  MAX_LIVES,
  ROUND_TRANSITION_MS,
  initialGameState,
  roundConfig,
  spawnCrab,
  startGame,
  startNextRound,
  tickDeaths,
  tickMovement,
  tickRoundTimer,
  type GameState,
} from "./crab-rush-engine";

type GameUser = { nickname: string; avatarUrl: string | null; isBlocked: boolean } | null;

// Musí odpovídat době trvání .animate-crab-hit-splat v app/globals.css.
const HIT_SPLAT_MS = 450;

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

// Čistě kosmetické rozmístění do "pruhů" na výšku trati — nemá vliv na
// herní logiku, proto to není součástí crab-rush-engine.ts.
function laneY(id: number): number {
  return 12 + ((id * 37) % 5) * 17;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-amber-300/40 bg-[#0e3347]/80 px-2.5 py-1 font-serif text-xs text-cyan-100/90 shadow-sm sm:text-sm">
      {children}
    </span>
  );
}

const SAVE_SCORE_INITIAL_STATE: SaveScoreState = { status: "idle" };

function ScoreSaveSection({
  user,
  score,
  round,
  kills,
  bestCombo,
}: {
  user: GameUser;
  score: number;
  round: number;
  kills: number;
  bestCombo: number;
}) {
  const [state, formAction, isPending] = useActionState(saveScoreAction, SAVE_SCORE_INITIAL_STATE);

  if (!user) {
    return (
      <p className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
        Přihlas se přes Steam a ulož skóre do žebříčku.
      </p>
    );
  }

  if (user.isBlocked) {
    return <p className="mt-4 text-xs text-cyan-100/50">Tento účet momentálně nemůže ukládat skóre.</p>;
  }

  if (state.status === "success") {
    return <p className="mt-4 text-sm text-emerald-300">{state.message}</p>;
  }

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="score" value={score} />
      <input type="hidden" name="round" value={round} />
      <input type="hidden" name="kills" value={kills} />
      <input type="hidden" name="bestCombo" value={bestCombo} />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md border border-amber-300/60 bg-amber-400/10 px-4 py-2 font-serif text-sm text-amber-200 transition hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Ukládám…" : "Uložit skóre"}
      </button>
      {state.status === "error" && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {state.message}
        </p>
      )}
    </form>
  );
}

export default function CrabRushGame({ user }: { user: GameUser }) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const { enabled: soundEnabled, toggle: toggleSound, playCrunch, playLifeLost, unlock } = useCrunchSound();
  const gameOverHeadingRef = useRef<HTMLHeadingElement>(null);
  const gameOverAudioRef = useRef<HTMLAudioElement | null>(null);
  const previousLivesRef = useRef(gameState.lives);

  useEffect(() => {
    if (gameState.status === "game-over" && gameOverHeadingRef.current) {
      gameOverHeadingRef.current.focus();
    }
  }, [gameState.status]);

  // Zvuk při ztrátě života — porovnává s předchozí hodnotou, ať se
  // spustí přesně v okamžiku, kdy krab unikne (ne při restartu, kdy
  // životy naopak naskočí zpátky na plný počet).
  useEffect(() => {
    if (gameState.lives < previousLivesRef.current) {
      playLifeLost();
    }
    previousLivesRef.current = gameState.lives;
  }, [gameState.lives, playLifeLost]);

  // Game Over — posměšný smích (stejný "pepelaugh" náhradní asset jako
  // u minihry Chyť úlovek, viz public/audio/catch-fail.mp3).
  useEffect(() => {
    if (gameState.status !== "game-over") return;
    const audio = gameOverAudioRef.current;
    if (!audio || !soundEnabled) return;
    audio.volume = 0.5;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [gameState.status, soundEnabled]);

  // Hlavní herní smyčka — běží, jen dokud je status "playing"; nové
  // kolo (jiné round číslo) restartuje časování spawnu/framu od nuly.
  useEffect(() => {
    if (gameState.status !== "playing") return;

    let rafId: number;
    let lastFrameTime = performance.now();
    let lastSpawnTime = performance.now();

    function loop(now: number) {
      const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;

      setGameState((prev) => {
        if (prev.status !== "playing") return prev;
        const config = roundConfig(prev.round);
        let next = prev;
        if (now - lastSpawnTime >= config.spawnIntervalMs) {
          lastSpawnTime = now;
          next = spawnCrab(next, now);
        }
        next = tickMovement(next, now, delta);
        next = tickDeaths(next, now);
        next = tickRoundTimer(next, delta);
        return next;
      });

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [gameState.status, gameState.round]);

  useEffect(() => {
    if (gameState.status !== "round-transition") return;
    const timer = setTimeout(() => {
      setGameState((prev) => (prev.status === "round-transition" ? startNextRound(prev) : prev));
    }, ROUND_TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [gameState.status]);

  function handleStart() {
    unlock();
    setGameState(startGame());
  }

  function handleRestart() {
    setGameState(startGame());
  }

  function handleCrabClick(crabId: number, event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    unlock();
    if (gameState.status !== "playing") return;
    const crab = gameState.crabs.find((c) => c.id === crabId);
    if (!crab || crab.dying || crab.escaping) return;
    playCrunch(crab.hp - 1 <= 0);
    const now = performance.now();
    setGameState((prev) => applyHit(prev, crabId, now));
  }

  function handleTrackMiss() {
    unlock();
    if (gameState.status !== "playing") return;
    setGameState((prev) => applyMiss(prev));
  }

  const multiplier = comboMultiplier(gameState.combo);

  return (
    <div>
      <audio ref={gameOverAudioRef} src="/audio/catch-fail.mp3" preload="none" />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge>Skóre: {gameState.score}</Badge>
        <Badge>Kolo: {gameState.round}</Badge>
        <Badge>{formatTime(gameState.roundTimeLeft)}</Badge>
        <Badge>
          <span className="inline-flex items-center gap-1 align-middle">
            Životy:
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <CrabIcon
                key={i}
                className={`h-3.5 w-5 ${i < gameState.lives ? "" : "opacity-20 grayscale"}`}
              />
            ))}
          </span>
        </Badge>
        {gameState.combo > 0 && (
          <Badge>
            Combo: x{multiplier} ({gameState.combo})
          </Badge>
        )}
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? "Vypnout zvuk hry" : "Zapnout zvuk hry"}
          title={soundEnabled ? "Vypnout zvuk hry" : "Zapnout zvuk hry"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-white/15 bg-white/5 text-cyan-100/80 transition hover:border-amber-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          {soundEnabled ? <SpeakerIcon className="h-4 w-4" /> : <SpeakerMuteIcon className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative mt-4 h-72 w-full overflow-hidden rounded-lg border border-white/10 sm:h-96">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#e8cfa0] from-[32%] via-[#1c8a95] via-[62%] to-[#0c4a56]"
        />

        <div
          role="group"
          aria-label="Herní plocha — klepni na kraba, než doběhne do moře"
          onClick={handleTrackMiss}
          className="absolute inset-0"
        >
          {gameState.crabs.map((crab) => {
            const isHit =
              !crab.dying && !crab.escaping && crab.hitAt !== null && performance.now() - crab.hitAt < HIT_SPLAT_MS;
            return (
              <button
                key={crab.id}
                type="button"
                onClick={(event) => handleCrabClick(crab.id, event)}
                aria-label={`Krab, zbývá ${crab.hp} z ${crab.maxHp} zásahů`}
                style={{ left: `${crab.x}%`, top: `${laneY(crab.id)}%` }}
                className={`absolute flex h-11 w-16 -translate-y-1/2 touch-manipulation items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                  crab.escaping ? "pointer-events-none animate-crab-submerge" : ""
                }`}
              >
                {isHit && (
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <span className="animate-crab-hit-splat absolute bottom-0 left-1/2 h-4 w-9 -translate-x-1/2 translate-y-2 rounded-full bg-red-700/90" />
                    <span className="animate-crab-hit-splat absolute bottom-0 left-[38%] h-1.5 w-1.5 -translate-x-1/2 translate-y-3.5 rounded-full bg-red-700/85" />
                    <span className="animate-crab-hit-splat absolute bottom-0 left-[62%] h-2 w-2 -translate-x-1/2 translate-y-3 rounded-full bg-red-700/85" />
                  </span>
                )}
                <CrabIcon
                  className="h-10 w-14"
                  walking={!crab.dying && !crab.escaping}
                  hit={!crab.dying && !crab.escaping && crab.hitAt !== null && performance.now() - crab.hitAt < 220}
                  dying={crab.dying}
                />
              </button>
            );
          })}
        </div>

        {gameState.status === "idle" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60 px-4 text-center">
            <p className="font-serif text-2xl text-amber-300">Krabí invaze</p>
            <p className="max-w-xs text-sm text-cyan-100/80">
              Krabi utíkají k moři — klepni na ně, než uniknou. 3 životy, 30 vteřin na kolo.
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="mt-2 rounded-md bg-amber-400 px-6 py-2.5 font-serif text-base text-gray-900 shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Začít hru
            </button>
          </div>
        )}

        {gameState.status === "round-transition" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 text-center">
            <p className="font-serif text-3xl text-amber-300">Kolo {gameState.round + 1}</p>
            <p className="mt-2 text-sm text-cyan-100/70">Připrav se…</p>
          </div>
        )}

        {gameState.status === "game-over" && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="crabrush-gameover-heading"
            className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-black/80 p-4"
          >
            <div className="w-full max-w-sm rounded-lg border border-amber-300/40 bg-[#0e3347] p-6 text-center shadow-2xl">
              <h2
                id="crabrush-gameover-heading"
                ref={gameOverHeadingRef}
                tabIndex={-1}
                className="font-serif text-2xl text-amber-300 outline-none"
              >
                Konec hry
              </h2>
              <dl className="mt-4 space-y-1.5 text-sm text-cyan-100/80">
                <div className="flex justify-between">
                  <dt>Skóre</dt>
                  <dd className="font-semibold text-white">{gameState.score}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Dosažené kolo</dt>
                  <dd className="font-semibold text-white">{gameState.round}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Zničení krabi</dt>
                  <dd className="font-semibold text-white">{gameState.kills}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Nejlepší combo</dt>
                  <dd className="font-semibold text-white">
                    x{comboMultiplier(gameState.bestCombo)} ({gameState.bestCombo})
                  </dd>
                </div>
              </dl>

              <ScoreSaveSection
                user={user}
                score={gameState.score}
                round={gameState.round}
                kills={gameState.kills}
                bestCombo={gameState.bestCombo}
              />

              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="rounded-md bg-amber-400 px-4 py-2 font-serif text-sm text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  Hrát znovu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-cyan-100/50">
        Klepni myší nebo prstem na kraba. Zásah ho zpomalí, víc zásahů ho zničí.
      </p>

      <div className="mt-4 text-center">
        <Link
          href="/hra/rybareni"
          className="text-xs text-cyan-100/50 underline hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Zahrát původní rybářskou minihru
        </Link>
      </div>
    </div>
  );
}
