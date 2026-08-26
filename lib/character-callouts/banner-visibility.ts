// Čistá (testovatelná, framework-free) část useBannerVisible.ts — žádný
// React/DOM import, viz app/components/useBannerVisible.ts pro samotný hook.

// Banner komponenty (AffiliateBanner) se označují tímhle atributem — viz
// AffiliateBanner.tsx. AdPlaceholder ho záměrně nemá (není to reklama).
export const PROMOTION_BANNER_SELECTOR = '[data-promotion-banner="true"]';

// Počet aktuálně protínajících se elementů určuje, jestli je "aspoň jeden
// banner viditelný".
export function computeAnyVisible(intersectingCount: number): boolean {
  return intersectingCount > 0;
}
