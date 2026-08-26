import { isExternalHref } from "../promotions/match-route.ts";
import type { PromotionEntry } from "../universal-content-api/types";
import { PROFESSOR_MESSAGES, SELLER_MESSAGE, type CharacterMessage } from "./config.ts";

export type CharacterId = "professor" | "seller";

export type ResolvedCallout = CharacterMessage & {
  character: CharacterId;
  // Prodejce dostane sponsored jen když má skutečný href — bez odkazu
  // není co "partnersky" označovat (viz zadání).
  isSponsored: boolean;
  // true pro promotion s body_html (sanitizováno na UCA straně před
  // uložením) NEBO pro statickou zprávu (config.ts), která má pár
  // hardcoded HTML tagů (např. tučné jméno) — obojí se vykresluje přes
  // dangerouslySetInnerHTML, viz CharacterCallout.tsx.
  isHtml?: boolean;
};

const EXACT_ROUTES = new Set([
  "/ryby",
  "/predmety",
  "/bossove",
  "/lokace",
  "/navody",
  "/achievementy",
  "/stream",
  "/hra",
  "/o-hre",
]);

// /ryby/[slug] je povolená dynamická detail stránka, ale NE její
// /ryby/navrhnout sourozenec (formulářová stránka, viz zadání "Ne").
const FISH_DETAIL_PATTERN = /^\/ryby\/(?!navrhnout$)[^/]+$/;

export function isCharacterCalloutRoute(pathname: string): boolean {
  return EXACT_ROUTES.has(pathname) || FISH_DETAIL_PATTERN.test(pathname);
}

// Prodejce (komerční callout) se nikdy nezobrazuje na /hra (během hraní
// minihry by rušil) ani na /o-hre (hard rule ze zadání — profesor tam má
// absolutní prioritu jako úvodní průvodce, žádná komerční postava). Tohle
// je JEDNO ze dvou nezávislých míst, která seller na /o-hre blokují — viz
// i CharacterCallout.tsx, kde se pro tuhle route seller rozhodování vůbec
// nespouští.
export function isSellerAllowedOnRoute(pathname: string): boolean {
  return pathname !== "/hra" && pathname !== "/o-hre";
}

function resolveProfessorMessage(pathname: string): CharacterMessage {
  if (FISH_DETAIL_PATTERN.test(pathname)) return PROFESSOR_MESSAGES["/ryby/[slug]"];
  return PROFESSOR_MESSAGES[pathname] ?? PROFESSOR_MESSAGES["/ryby"];
}

export function resolveCharacterCallout(pathname: string, character: CharacterId): ResolvedCallout {
  if (character === "seller") {
    return { ...SELLER_MESSAGE, character: "seller", isSponsored: Boolean(SELLER_MESSAGE.href) };
  }
  return { ...resolveProfessorMessage(pathname), character: "professor", isSponsored: false };
}

/**
 * Aktivní seller promotion (z UCA, viz lib/universal-content-api/
 * promotions.ts) namapovaná na stejný ResolvedCallout tvar jako statická
 * SELLER_MESSAGE — komponenta tak nemusí rozlišovat "je to promotion,
 * nebo fallback". `body_html` (sanitizováno už na UCA straně) má
 * přednost před `title` jako zobrazovaný text.
 */
export function resolvePromotionCallout(promotion: PromotionEntry): ResolvedCallout {
  return {
    character: "seller",
    message: promotion.bodyHtml ?? promotion.title,
    isHtml: Boolean(promotion.bodyHtml),
    href: promotion.href,
    linkLabel: promotion.ctaLabel,
    isSponsored: promotion.href !== undefined && isExternalHref(promotion.href),
  };
}
