import { isExternalHref } from "../promotions/match-route.ts";
import type { PromotionEntry } from "../universal-content-api/types";
import { PROFESSOR_MESSAGES, SELLER_MESSAGE, type CharacterMessage } from "./config.ts";

export type CharacterId = "professor" | "seller";

export type ResolvedCallout = CharacterMessage & {
  character: CharacterId;
  // Prodejce dostane sponsored jen když má skutečný href — bez odkazu
  // není co "partnersky" označovat (viz zadání).
  isSponsored: boolean;
  // true jen u promotion s body_html (sanitizováno na UCA straně před
  // uložením) — vykresluje se přes dangerouslySetInnerHTML, viz
  // CharacterCallout.tsx. Statické zprávy (config.ts) jsou vždy plain text.
  isHtml?: boolean;
};

const EXACT_ROUTES = new Set(["/ryby", "/predmety", "/bossove", "/lokace", "/navody", "/achievementy", "/stream", "/hra"]);

// /ryby/[slug] je povolená dynamická detail stránka, ale NE její
// /ryby/navrhnout sourozenec (formulářová stránka, viz zadání "Ne").
const FISH_DETAIL_PATTERN = /^\/ryby\/(?!navrhnout$)[^/]+$/;

export function isCharacterCalloutRoute(pathname: string): boolean {
  return EXACT_ROUTES.has(pathname) || FISH_DETAIL_PATTERN.test(pathname);
}

// Prodejce (komerční callout) se na /hra nikdy nezobrazuje — během
// hraní minihry by rušil. Profesor tam zůstává povolený.
export function isSellerAllowedOnRoute(pathname: string): boolean {
  return pathname !== "/hra";
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
