// Čistá konfigurace interní kampaně "první skutečné rybaření" (bez JSX a
// "use client", ať jde importovat v testech pod --conditions=react-server).

export const REAL_FISHING_PROMO_HREF = "/prvni-rybareni";

export const REAL_FISHING_PROMO_COPY = {
  title: "Rybaříš ve hrách? Zkus to i naživo.",
  text: "Zjisti, co potřebuješ k prvnímu rybaření, a vyber si základní výbavu.",
  cta: "Jak začít rybařit →",
} as const;

/** Umístění banneru (jde do analytiky jako `placement`). */
export type RealFishingPromoPlacement = "homepage" | "game" | "guide";

/**
 * Kde se banner NIKDY nezobrazuje — cílová stránka sama, právní stránky.
 * (404 a stránky bez herního obsahu banner prostě nerenderují.)
 */
export const REAL_FISHING_PROMO_EXCLUDED_PATHS = ["/prvni-rybareni", "/pravni-informace", "/ochrana-soukromi"] as const;
