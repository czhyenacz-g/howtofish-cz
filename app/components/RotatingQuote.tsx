"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ROTATE_MS = 7000;
const FADE_MS = 700;

export type RotatingQuoteItem = {
  text: string;
  /** Kam quote vede (detail hry), pokud někam vede. */
  href?: string;
};

/**
 * Rotující citáty — jemný fade mezi jednotlivými texty (žádný carousel,
 * žádná knihovna). Používá se na homepage i v hero katalogu
 * /hry-s-rybarenim (odtud přesunuto do app/components, ať je jen jedna
 * implementace).
 *
 * Respektuje `prefers-reduced-motion`: při omezeném pohybu se rotace
 * VŮBEC nespustí a zůstane staticky první citát (fade je navíc vypnutý i
 * přes `motion-reduce:transition-none`). SSR i první klientské
 * vykreslení začínají na indexu 0, takže nic nebliká ani nehrozí hydration
 * mismatch.
 */
export default function RotatingQuote({
  quotes,
  className = "",
}: {
  quotes: readonly RotatingQuoteItem[];
  className?: string;
}) {
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

  if (quotes.length === 0) return null;

  const quote = quotes[index];

  return (
    <div className={`mx-auto flex min-h-[4.5rem] max-w-2xl items-center justify-center px-2 sm:min-h-[3.5rem] ${className}`}>
      <p
        className={`font-serif text-base italic leading-relaxed text-amber-100/90 transition-opacity duration-700 motion-reduce:transition-none ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {quote.href ? (
          <Link
            href={quote.href}
            className="underline decoration-amber-300/40 underline-offset-4 transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {quote.text}
          </Link>
        ) : (
          quote.text
        )}
      </p>
    </div>
  );
}
