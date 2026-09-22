"use client";

import { useEffect, useState } from "react";

const ROTATE_MS = 7000;
const FADE_MS = 700;

/**
 * Rotující citát v hero sekci — jemný fade mezi jednotlivými texty
 * (žádný carousel, žádná knihovna). Respektuje `prefers-reduced-motion`:
 * když má uživatel v systému omezený pohyb, rotace se VŮBEC nespustí a
 * zůstane staticky první citát (fade transition je navíc vypnutý i přes
 * `motion-reduce:transition-none`). SSR i první klientské vykreslení
 * začínají na indexu 0, takže nic nebliká ani nehrozí hydration mismatch.
 */
export default function RotatingQuote({ quotes }: { quotes: readonly string[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (quotes.length < 2) return;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let swapTimeout: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setVisible(false);
      swapTimeout = setTimeout(() => {
        setIndex((current) => (current + 1) % quotes.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);

    return () => {
      clearInterval(interval);
      if (swapTimeout) clearTimeout(swapTimeout);
    };
  }, [quotes.length]);

  return (
    <div className="mx-auto flex min-h-[4.5rem] max-w-2xl items-center justify-center px-2 sm:min-h-[3.5rem]">
      <p
        className={`font-serif text-base italic leading-relaxed text-amber-100/90 transition-opacity duration-700 motion-reduce:transition-none ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {quotes[index]}
      </p>
    </div>
  );
}
