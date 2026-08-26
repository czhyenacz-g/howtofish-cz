import { isSellerAllowedOnRoute } from "./resolve-callout.ts";

// Pojmenované konstanty (ne magic numbers) — viz zadání. Prodejce má
// působit jako vzácný herní event, ne jako druhá trvalá reklama vedle
// banneru.
export const SELLER_DELAY_MS = 25_000;
export const SELLER_CHANCE = 0.3;
export const SELLER_COOLDOWN_MS = 10 * 60_000;
// Obě "true" hodnoty jsou tady jen zdokumentované jako pojmenované
// konstanty (zadání je explicitně žádá) — v `shouldShowSeller` jsou
// napevno zapracované jako pravidlo, ne jako přepínatelná volba.
export const SELLER_ONCE_PER_ROUTE = true;
export const SELLER_BLOCKED_WHILE_BANNER_VISIBLE = true;
export const SELLER_BLOCKED_WHILE_PROFESSOR_OPEN = true;

export type ProfessorVisibility = "open" | "minimized" | "hidden";

export type ShouldShowSellerInput = {
  pathname: string;
  now: number;
  /** `sessionStorage` timestamp poslední zobrazení, nebo `null`. */
  lastShownAt: number | null;
  /** Routy, kde už byl prodejce v týhle session skutečně zobrazen. */
  shownRoutes: readonly string[];
  bannerVisible: boolean;
  professorVisibility: ProfessorVisibility;
  /**
   * Výsledek JEDNOHO `Math.random()` hodu — voláno mimo tuhle funkci
   * a předáno sem, aby `shouldShowSeller` zůstala čistá/deterministická
   * a testovatelná (a aby volající mohl bezpečně zavolat funkci
   * vícekrát se stejným hodem, když se mění jen `bannerVisible`, viz
   * zadání "random rozhodnutí proveď maximálně jednou").
   */
  chanceRoll: number;
};

/**
 * Jediné místo, kde se rozhoduje, jestli se prodejce smí zobrazit.
 * Čistá funkce — žádný sessionStorage/DOM přístup, žádný Math.random()
 * uvnitř (viz `chanceRoll` výše). Pořadí kontrol odpovídá pořadí v
 * zadání: route -> profesor otevřený -> once-per-route -> cooldown ->
 * banner viditelný -> 30% šance.
 */
export function shouldShowSeller(input: ShouldShowSellerInput): boolean {
  if (!isSellerAllowedOnRoute(input.pathname)) return false;
  if (input.professorVisibility === "open") return false;
  if (input.shownRoutes.includes(input.pathname)) return false;
  if (input.lastShownAt !== null && input.now - input.lastShownAt < SELLER_COOLDOWN_MS) return false;
  if (input.bannerVisible) return false;

  return input.chanceRoll < SELLER_CHANCE;
}
