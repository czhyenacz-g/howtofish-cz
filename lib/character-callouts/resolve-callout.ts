import { PROFESSOR_MESSAGES, SELLER_MESSAGE, type CharacterMessage } from "./config.ts";

export type CharacterId = "professor" | "seller";

export type ResolvedCallout = CharacterMessage & {
  character: CharacterId;
  // Prodejce dostane sponsored jen když má skutečný href — bez odkazu
  // není co "partnersky" označovat (viz zadání).
  isSponsored: boolean;
};

const EXACT_ROUTES = new Set(["/ryby", "/predmety", "/bossove", "/lokace", "/navody", "/achievementy", "/stream", "/hra"]);

// /ryby/[slug] je povolená dynamická detail stránka, ale NE její
// /ryby/navrhnout sourozenec (formulářová stránka, viz zadání "Ne").
const FISH_DETAIL_PATTERN = /^\/ryby\/(?!navrhnout$)[^/]+$/;

export function isCharacterCalloutRoute(pathname: string): boolean {
  return EXACT_ROUTES.has(pathname) || FISH_DETAIL_PATTERN.test(pathname);
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
