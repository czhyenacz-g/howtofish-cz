import type { CreatorGearItem } from "../../data/creator-gear.ts";
import { buildAllegroSearchUrl, buildDognetAffiliateUrl, normalizeTrackingSlug } from "../affiliate/dognet.ts";

export type GearAffiliateLinkType = "direct" | "allegro-search";

export type GearAffiliateLink = {
  href: string;
  type: GearAffiliateLinkType;
};

/** Vyhledávací dotaz pro Allegro fallback: explicitní `searchQuery` > `productName` > `brand + model` (viz zadání bod 7). */
export function resolveGearSearchQuery(item: Pick<CreatorGearItem, "searchQuery" | "productName" | "brand" | "model">): string {
  if (item.searchQuery) return item.searchQuery;
  if (item.productName) return item.productName;
  return [item.brand, item.model].filter(Boolean).join(" ");
}

/** `gear-{creatorSlug}-{productSlug}` tracking pattern — preferovaná produktová varianta (viz zadání bod 8). */
export function buildGearD2(item: Pick<CreatorGearItem, "creatorSlug" | "productName">): string {
  return `gear-${normalizeTrackingSlug(item.creatorSlug)}-${normalizeTrackingSlug(item.productName)}`;
}

/**
 * Priorita: explicitní `affiliateUrl` (konkrétní nabídka) > automatický
 * Allegro+Dognet fallback (viz zadání bod 5). Čistá funkce, žádný fetch.
 */
export function getGearAffiliateLink(item: CreatorGearItem): GearAffiliateLink {
  if (item.affiliateUrl) {
    return { href: item.affiliateUrl, type: "direct" };
  }

  const destination = buildAllegroSearchUrl(resolveGearSearchQuery(item));
  const d2 = buildGearD2(item);
  return { href: buildDognetAffiliateUrl(destination, d2), type: "allegro-search" };
}

/** "Koupit" se záměrně nepoužívá — cena/skladovost se může kdykoliv změnit (viz zadání bod 9). */
export function getGearCtaLabel(type: GearAffiliateLinkType): string {
  return type === "direct" ? "Zobrazit nabídku" : "Najít na Allegro";
}
