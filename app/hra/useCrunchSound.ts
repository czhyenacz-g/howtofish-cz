"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "howtofish-crabrush-sound-enabled";
// CC0 (public domain, žádná atribuce potřeba) — freesound.org/people/
// SammygoodTunes/sounds/844811/. Jediný externí audio asset v projektu
// (vyžádáno explicitně místo syntetického crunche níž) — playLifeLost
// zůstává syntetický, ten se netýkal.
const CRUNCH_SOUND_URL = "/audio/crab-crunch.wav";

function readStoredPreference(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

function writeStoredPreference(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // localStorage nedostupné — preference se prostě neuloží.
  }
}

/**
 * Krátký "crunch" (skutečná nahrávka křupnutí, viz CRUNCH_SOUND_URL)
 * přehrávaný přes Web Audio API — dekóduje se jednou a cachuje
 * (ensureCrunchBuffer), další přehrání jen spustí nový
 * AudioBufferSourceNode ze stejných dat, ať jde přehrát vícekrát rychle
 * za sebou bez přerušení. AudioContext se vytváří/probouzí až při první
 * interakci (viz `unlock`), nikdy sám od sebe při načtení stránky —
 * respektuje autoplay policy.
 */
export function useCrunchSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const bufferPromiseRef = useRef<Promise<AudioBuffer | null> | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(readStoredPreference());
  }, []);

  const ensureContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctxRef.current) {
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  // Stáhne a jednou dekóduje CRUNCH_SOUND_URL — výsledek se cachuje v
  // bufferRef, souběžná volání (např. rychle za sebou zasažení krabi)
  // sdílí stejný rozpracovaný Promise (bufferPromiseRef), ať se soubor
  // nestahuje/nedekóduje vícekrát zbytečně. `null` při chybě (chybějící
  // soubor, decode selže) — volající pak jen nic nepřehraje, nikdy nespadne.
  const ensureCrunchBuffer = useCallback((ctx: AudioContext): Promise<AudioBuffer | null> => {
    if (bufferRef.current) return Promise.resolve(bufferRef.current);
    if (!bufferPromiseRef.current) {
      bufferPromiseRef.current = fetch(CRUNCH_SOUND_URL)
        .then((res) => res.arrayBuffer())
        .then((data) => ctx.decodeAudioData(data))
        .then((decoded) => {
          bufferRef.current = decoded;
          return decoded;
        })
        .catch(() => null);
    }
    return bufferPromiseRef.current;
  }, []);

  const unlock = useCallback(() => {
    const ctx = ensureContext();
    // Rovnou začne stahovat/dekódovat crunch.wav, ať je hotový dřív, než
    // padne první zásah (unlock se volá při prvním kliknutí do hry).
    if (ctx) ensureCrunchBuffer(ctx);
  }, [ensureContext, ensureCrunchBuffer]);

  const playCrunch = useCallback(
    (strong = false) => {
      if (!enabled) return;
      const ctx = ensureContext();
      if (!ctx) return;

      ensureCrunchBuffer(ctx).then((buffer) => {
        if (!buffer) return;

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        // Smrtelná rána zní o něco hlouběji a hlasitěji než obyčejný
        // zásah — stejné rozlišení jako mělo dřívější syntetické řešení
        // (jiná frekvence/gain), teď přes playbackRate/gain nad reálnou
        // nahrávkou.
        source.playbackRate.value = strong ? 0.92 : 1.06;

        const gain = ctx.createGain();
        gain.gain.value = strong ? 0.85 : 0.55;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();
      });
    },
    [enabled, ensureContext, ensureCrunchBuffer]
  );

  // Krátký sestupný tón při ztrátě života — jiná barva zvuku než crunch,
  // ať je jasně slyšet, že se stalo něco špatného (krab unikl).
  const playLifeLost = useCallback(() => {
    if (!enabled) return;
    const ctx = ensureContext();
    if (!ctx) return;

    const duration = 0.28;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(340, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [enabled, ensureContext]);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      writeStoredPreference(next);
      return next;
    });
  }, []);

  return { enabled, toggle, playCrunch, playLifeLost, unlock };
}
