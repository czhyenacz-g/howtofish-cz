"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "howtofish-crabrush-sound-enabled";

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
 * Krátký syntetický "crunch" (křupnutí chipsu) přes Web Audio API —
 * žádný externí audio asset, žádná licence k řešení. AudioContext se
 * vytváří/probouzí až při první interakci (viz `unlock`), nikdy sám od
 * sebe při načtení stránky — respektuje autoplay policy.
 */
export function useCrunchSound() {
  const ctxRef = useRef<AudioContext | null>(null);
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

  const unlock = useCallback(() => {
    ensureContext();
  }, [ensureContext]);

  const playCrunch = useCallback(
    (strong = false) => {
      if (!enabled) return;
      const ctx = ensureContext();
      if (!ctx) return;

      const duration = strong ? 0.14 : 0.09;
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const decay = 1 - i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * decay * decay;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = strong ? 1400 : 2200;
      bandpass.Q.value = 0.7;

      const gain = ctx.createGain();
      gain.gain.value = strong ? 0.35 : 0.22;

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + duration);
    },
    [enabled, ensureContext]
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      writeStoredPreference(next);
      return next;
    });
  }, []);

  return { enabled, toggle, playCrunch, unlock };
}
