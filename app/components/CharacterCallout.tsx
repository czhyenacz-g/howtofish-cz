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
  resolveCharacterCallout,
  resolvePromotionCallout,
  type CharacterId,
} from "../../lib/character-callouts/resolve-callout";
import { getSellerLastShownAt, getSellerShownRoutes, rememberSellerShown } from "../../lib/character-callouts/seller-state";
import { SELLER_DELAY_MS, shouldShowSeller } from "../../lib/character-callouts/seller-rules";
import { pickPromotion } from "../../lib/promotions/match-route";
import type { PromotionEntry } from "../../lib/universal-content-api/types";
import { useBannerVisible } from "./useBannerVisible";

const DELAY_MS = 6000;
const EXIT_MS = 300;
// /o-hre: profesor je úvodní průvodce stránky, ne náhodný event — objeví
// se prakticky hned (ne po standardním 6s DELAY_MS), viz zadání "profesor
// je defaultně otevřený". Malé nenulové zpoždění jen kvůli plynulému
// najetí animace po vykreslení stránky.
const O_HRE_PATHNAME = "/o-hre";
const PROFESSOR_INTRO_DELAY_MS = 300;

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

  // Prodejce nesmí naskočit přes viditelný banner (viz seller-rules.ts).
  // Event-driven přes IntersectionObserver, žádný polling. `bannerVisible`
  // se čte přes ref v setTimeout callbacku, aby zůstala aktuální i po 25s
  // čekání (closure by jinak zamrzla na hodnotě z okamžiku naplánování).
  const bannerVisible = useBannerVisible(pathname);
  const bannerVisibleRef = useRef(bannerVisible);
  useEffect(() => {
    bannerVisibleRef.current = bannerVisible;
  }, [bannerVisible]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    timers.current.forEach((id) => clearTimeout(id));
    timers.current = [];
    setPhase("idle");
    setCharacter(null);

    if (!isCharacterCalloutRoute(pathname)) return;

    // Jednodušší varianta z zadání: pokud je profesor na téhle route
    // zapamatovaný jako minimalizovaný, rovnou ukaž "?" a vůbec
    // neprováděj náhodný auto-callout (žádný nový timer, žádný los
    // prodejce) — uživatel si ho může kdykoliv ručně znovu otevřít.
    if (isProfessorMinimizedForRoute(pathname)) {
      setCharacter("professor");
      setPhase("minimized");
      return;
    }

    if (pathname === O_HRE_PATHNAME) {
      // Hard rule ze zadání: na /o-hre má profesor absolutní prioritu a
      // seller se tu nesmí objevit vůbec — proto se sem rozhodovací
      // funkce pro sellera ani nevolá (druhá, nezávislá pojistka je
      // isSellerAllowedOnRoute v resolve-callout.ts, které tuhle route
      // taky blokuje). Profesor se navíc neřídí náhodou/cooldownem jako
      // jinde — je to úvodní průvodce stránky, zobrazí se vždy.
      setCharacter("professor");
      const introTimer = window.setTimeout(() => {
        setPhase("entering");
        requestAnimationFrame(() => requestAnimationFrame(() => setPhase("open")));
      }, PROFESSOR_INTRO_DELAY_MS);
      timers.current.push(introTimer);
      return () => timers.current.forEach((id) => clearTimeout(id));
    }

    // Jediný slot pro postavu (viz Phase/character výše) dělá "profesor
    // otevřený blokuje prodejce" strukturálně nemožné — obě postavy nikdy
    // nemůžou být "open" současně. `professorVisibility` je tu proto vždy
    // "hidden": prodejce se rozhoduje nezávisle na profesorovi, ne o něj
    // koliduje (viz report k téhle části zadání).
    const chanceRoll = Math.random();
    const wantsSeller = shouldShowSeller({
      pathname,
      now: Date.now(),
      lastShownAt: getSellerLastShownAt(),
      shownRoutes: getSellerShownRoutes(),
      bannerVisible,
      professorVisibility: "hidden",
      chanceRoll,
    });

    if (!wantsSeller) {
      setCharacter("professor");
      const showTimer = window.setTimeout(() => {
        setPhase("entering");
        requestAnimationFrame(() => requestAnimationFrame(() => setPhase("open")));
      }, DELAY_MS);
      timers.current.push(showTimer);
      return () => timers.current.forEach((id) => clearTimeout(id));
    }

    // Prodejce má vlastní, delší delay (má působit jako vzácný event, ne
    // druhá reklama hned vedle profesora) — a těsně před zobrazením se
    // ještě jednou ověří živá viditelnost banneru (mohl se objevit
    // v mezičase). Pokud ano, tenhle pokus se tiše zahodí — žádný fallback
    // na profesora, žádné opakování na téhle route.
    setCharacter("seller");
    const sellerTimer = window.setTimeout(() => {
      if (bannerVisibleRef.current) return;
      rememberSellerShown(pathname, Date.now());
      setPhase("entering");
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("open")));
    }, SELLER_DELAY_MS);
    timers.current.push(sellerTimer);

    return () => {
      timers.current.forEach((id) => clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bannerVisible se čte přes bannerVisibleRef, aby se rozhodnutí "seller vs. professor" nepřepočítávalo při každé změně viditelnosti banneru mezi routami.
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
      // Značka pro jiné fixed prvky (MultiplayerIslandTab), že je právě
      // vysunutá postava — viz useCharacterCalloutOpen.ts. Přítomná po
      // celou dobu entering/open/closing (ne jen "open"), protože i
      // během přechodu postava zabírá vizuální prostor.
      data-character-callout-open="true"
      className={`pointer-events-none fixed right-0 bottom-2 z-40 flex flex-col-reverse items-end gap-1 transition-transform ease-out sm:bottom-auto sm:top-1/2 sm:flex-row sm:items-end sm:gap-0 sm:-translate-y-1/2 ${
        visible ? "translate-x-0 duration-500" : "translate-x-[110%] duration-300"
      }`}
    >
      <div className="pointer-events-auto max-w-[240px] rounded-2xl border-2 border-[#3a2a1a] bg-[#f4ead9] p-3 font-serif text-sm leading-snug text-[#3a2a1a] shadow-xl sm:mb-20 sm:max-w-[360px] sm:p-4">
        {callout.isHtml ? (
          // HTML jen ze dvou důvěryhodných zdrojů: sanitizované body_html
          // z UCA (viz HtmlSanitizer.php, admin-authored, ne uživatelský
          // vstup) nebo ručně psané tagy přímo v config.ts (žádný runtime
          // vstup) — dangerouslySetInnerHTML je proto v obou případech
          // bezpečné. whitespace-pre-line: \n\n v datech se má vykreslit
          // jako odstavcová mezera stejně jako u plain-text varianty níž.
          <p className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: callout.message }} />
        ) : (
          // whitespace-pre-line: \n\n v datech (config.ts) se má vykreslit
          // jako odstavcová mezera — texty postav mají mít max 2-3 věty za
          // sebou, delší zprávy se rozdělují na kratší odstavce.
          <p className="whitespace-pre-line">{callout.message}</p>
        )}
        {callout.isSponsored && (
          <p className="mt-2 text-[10px] font-sans uppercase tracking-wide text-[#8a6d4a]">Partnerský tip</p>
        )}
        {/* CTA je strukturálně omezené na sellera (character === "seller")
            — navigace i obsah stránky už mají vlastní tlačítka/odkazy,
            CTA v profesorově dialogu by bylo duplicitní (viz zadání).
            Seller CTA (reklama) zůstává beze změny funkční. */}
        {character === "seller" && callout.href && callout.linkLabel && callout.isSponsored && (
          <a
            href={callout.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-3 inline-flex min-h-[36px] items-center justify-center rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-gray-900 transition hover:bg-amber-400"
          >
            {callout.linkLabel}
          </a>
        )}
        {character === "seller" && callout.href && callout.linkLabel && !callout.isSponsored && (
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
