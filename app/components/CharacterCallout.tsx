"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isProfessorMinimizedForRoute,
  rememberProfessorMinimized,
} from "../../lib/character-callouts/professor-state";
import {
  isCharacterCalloutRoute,
  isSellerAllowedOnRoute,
  resolveCharacterCallout,
  resolvePromotionCallout,
  type CharacterId,
} from "../../lib/character-callouts/resolve-callout";
import { pickPromotion } from "../../lib/promotions/match-route";
import type { PromotionEntry } from "../../lib/universal-content-api/types";

const DELAY_MS = 6000;
const EXIT_MS = 300;

const CHARACTER_IMAGE: Record<CharacterId, { src: string; width: number; height: number }> = {
  professor: { src: "/images/characters/professor.png", width: 750, height: 1000 },
  seller: { src: "/images/characters/seller.png", width: 800, height: 1000 },
};

type Phase = "idle" | "entering" | "open" | "closing" | "minimized";

// Postava (profesor/prodejce) vyjíždí zprava — na rozdíl od jiných
// dismissible prvků v projektu si zavření NEPAMATUJE mezi návštěvami
// globálně: nová náhodná postava a nová šance na zobrazení při každém
// vstupu na povolenou route (isCharacterCalloutRoute). Výjimka: profesor
// (pomocník/průvodce, na rozdíl od komerčního prodejce) po zavření na
// dané route zmenší na "?" token (viz professorStorageKey) — tahle
// jedna route si to pamatuje po zbytek session, jiné routy ne.
//
// Náhodný výběr postavy proběhne až po mountu (useEffect), aby se
// předešlo hydration mismatchi — server vždy vyrenderuje null.
export default function CharacterCallout({
  sellerPromotions = [],
}: {
  // Malý, ne-citlivý seznam (admin-psaný marketing text) — načtený
  // server-side v root layoutu (viz lib/universal-content-api/
  // promotions.ts) a předaný sem jako plain prop. Výběr podle route se
  // ale musí stát tady, klient-side, protože pathname je (kvůli
  // hydration mismatchi) dostupný až po mountu přes usePathname() — viz
  // report pro odůvodnění téhle konkrétní výjimky z "no candidate list
  // in the browser".
  sellerPromotions?: PromotionEntry[];
}) {
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

    // Jednodušší varianta z zadání: pokud je profesor na téhle route
    // zapamatovaný jako minimalizovaný, rovnou ukaž "?" a vůbec
    // neprováděj náhodný auto-callout (žádný nový 6s timer, žádný los
    // prodejce) — uživatel si ho může kdykoliv ručně znovu otevřít.
    if (isProfessorMinimizedForRoute(pathname)) {
      setCharacter("professor");
      setPhase("minimized");
      return;
    }

    const picked: CharacterId =
      isSellerAllowedOnRoute(pathname) && Math.random() < 0.5 ? "seller" : "professor";
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
    if (character === "professor") {
      rememberProfessorMinimized(pathname);
      setPhase("closing");
      const timer = window.setTimeout(() => setPhase("minimized"), EXIT_MS);
      timers.current.push(timer);
      return;
    }

    // Prodejce je komerční callout — po zavření prostě zmizí, žádný "?".
    setPhase("closing");
    const timer = window.setTimeout(() => setPhase("idle"), EXIT_MS);
    timers.current.push(timer);
  }

  function handleReopen() {
    setPhase("entering");
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase("open")));
  }

  if (!mounted || !character || phase === "idle" || !isCharacterCalloutRoute(pathname)) {
    return null;
  }

  if (phase === "minimized") {
    return (
      <button
        type="button"
        onClick={handleReopen}
        aria-label="Otevřít profesora"
        title="Otevřít profesora"
        className="fixed right-0 bottom-2 z-40 flex h-12 w-12 translate-x-1.5 rotate-[-3deg] items-center justify-center rounded-full border-2 border-[#3a2a1a] bg-amber-400 font-serif text-xl text-gray-900 shadow-lg transition duration-150 ease-out hover:translate-x-0.5 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 motion-reduce:transition-none motion-reduce:hover:translate-x-1.5 motion-reduce:hover:scale-100 sm:bottom-auto sm:top-1/2 sm:h-14 sm:w-14 sm:-translate-y-1/2 sm:text-2xl"
      >
        ?
      </button>
    );
  }

  // Aktivní promotion (pokud existuje pro tuhle route) má přednost před
  // statickou fallback hláškou — profesor se tímhle vůbec nezabývá.
  const matchedPromotion = character === "seller" ? pickPromotion(sellerPromotions, pathname) : null;
  const callout = matchedPromotion
    ? resolvePromotionCallout(matchedPromotion)
    : resolveCharacterCallout(pathname, character);
  const image = CHARACTER_IMAGE[character];
  const visible = phase === "open";

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed right-0 bottom-2 z-40 flex flex-col-reverse items-end gap-1 transition-transform ease-out sm:bottom-auto sm:top-1/2 sm:flex-row sm:items-end sm:gap-0 sm:-translate-y-1/2 ${
        visible ? "translate-x-0 duration-500" : "translate-x-[110%] duration-300"
      }`}
    >
      <div className="pointer-events-auto max-w-[240px] rounded-2xl border-2 border-[#3a2a1a] bg-[#f4ead9] p-3 font-serif text-sm leading-snug text-[#3a2a1a] shadow-xl sm:mb-20 sm:max-w-[360px] sm:p-4">
        {callout.isHtml ? (
          // body_html je sanitizované už na UCA straně před uložením
          // (viz HtmlSanitizer.php) — admin-authored obsah, ne uživatelský
          // vstup, proto je dangerouslySetInnerHTML tady přijatelné.
          <p dangerouslySetInnerHTML={{ __html: callout.message }} />
        ) : (
          <p>{callout.message}</p>
        )}
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

      {/* Samostatný "×" mezi bublinou a postavou — schválně ne nalepený
          na roh bubliny, viz zadání. sm:mb-14 ho posadí o kus níž než
          bublinu (sm:mb-20), do vizuální mezery před postavou. */}
      <div className="pointer-events-auto flex shrink-0 items-center px-1 sm:mb-14">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Zavřít"
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#3a2a1a] bg-amber-400 text-base text-gray-900 shadow-md transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          ✕
        </button>
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
