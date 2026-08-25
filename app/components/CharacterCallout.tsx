"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isCharacterCalloutRoute,
  resolveCharacterCallout,
  type CharacterId,
} from "../../lib/character-callouts/resolve-callout";

const DELAY_MS = 6000;
const EXIT_MS = 300;

const CHARACTER_IMAGE: Record<CharacterId, { src: string; width: number; height: number }> = {
  professor: { src: "/images/characters/professor.png", width: 750, height: 1000 },
  seller: { src: "/images/characters/seller.png", width: 800, height: 1000 },
};

type Phase = "idle" | "entering" | "open" | "closing";

// Postava (profesor/prodejce) vyjíždí zprava — na rozdíl od jiných
// dismissible prvků v projektu si zavření NEPAMATUJE mezi návštěvami:
// nová náhodná postava a nová šance na zobrazení při každém vstupu na
// povolenou route (isCharacterCalloutRoute), zavření maže jen aktuální
// instanci v React stavu, nic se trvale neukládá.
//
// Náhodný výběr postavy proběhne až po mountu (useEffect), aby se
// předešlo hydration mismatchi — server vždy vyrenderuje null.
export default function CharacterCallout() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [character, setCharacter] = useState<CharacterId | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    timers.current.forEach((id) => clearTimeout(id));
    timers.current = [];
    setPhase("idle");

    if (!isCharacterCalloutRoute(pathname)) return;

    const picked: CharacterId = Math.random() < 0.5 ? "professor" : "seller";
    setCharacter(picked);

    const showTimer = window.setTimeout(() => {
      setPhase("entering");
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("open")));
    }, DELAY_MS);
    timers.current.push(showTimer);

    return () => {
      timers.current.forEach((id) => clearTimeout(id));
    };
  }, [mounted, pathname]);

  function handleClose() {
    setPhase("closing");
    const timer = window.setTimeout(() => setPhase("idle"), EXIT_MS);
    timers.current.push(timer);
  }

  if (!mounted || !character || phase === "idle" || !isCharacterCalloutRoute(pathname)) {
    return null;
  }

  const callout = resolveCharacterCallout(pathname, character);
  const image = CHARACTER_IMAGE[character];
  const visible = phase === "open";

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed right-0 bottom-2 z-40 flex flex-col-reverse items-end gap-1 transition-transform ease-out sm:bottom-auto sm:top-1/2 sm:flex-row sm:items-end sm:gap-0 sm:-translate-y-1/2 ${
        visible ? "translate-x-0 duration-500" : "translate-x-[110%] duration-300"
      }`}
    >
      <div className="pointer-events-auto relative max-w-[240px] rounded-2xl border-2 border-[#3a2a1a] bg-[#f4ead9] p-3 font-serif text-sm leading-snug text-[#3a2a1a] shadow-xl sm:mb-20 sm:mr-[-6px] sm:max-w-[360px] sm:p-4">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Zavřít"
          className="absolute -right-2 -top-2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#3a2a1a] bg-amber-400 text-base text-gray-900 shadow-md transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          ✕
        </button>
        <p>{callout.message}</p>
        {callout.isSponsored && (
          <p className="mt-2 text-[10px] font-sans uppercase tracking-wide text-[#8a6d4a]">Partnerský tip</p>
        )}
        {callout.href && callout.linkLabel && callout.isSponsored && (
          <a
            href={callout.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-3 inline-flex min-h-[36px] items-center justify-center rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-gray-900 transition hover:bg-amber-400"
          >
            {callout.linkLabel}
          </a>
        )}
        {callout.href && callout.linkLabel && !callout.isSponsored && (
          <Link
            href={callout.href}
            className="mt-3 inline-flex min-h-[36px] items-center justify-center rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-gray-900 transition hover:bg-amber-400"
          >
            {callout.linkLabel}
          </Link>
        )}
      </div>

      <div className="pointer-events-none h-[160px] w-[120px] shrink-0 sm:h-[420px] sm:w-[315px]">
        <Image
          src={image.src}
          alt=""
          aria-hidden="true"
          width={image.width}
          height={image.height}
          className="h-full w-full object-contain object-bottom"
        />
      </div>
    </div>
  );
}
