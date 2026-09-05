"use client";

import { trackClientEvent } from "../../lib/analytics/track-client-event";
import type { CreatorGearItem } from "../../data/creator-gear.ts";
import { getGearAffiliateLink, getGearCtaLabel } from "../../lib/creators/gear-affiliate.ts";

// Vlastní "use client" komponenta jen kvůli onClick trackingu (viz
// zadání bod 23 "gear_affiliate_click") — samotný href se počítá čistě
// lokálně (žádný fetch), viz lib/creators/gear-affiliate.ts.
export default function GearAffiliateCta({ item }: { item: CreatorGearItem }) {
  const { href, type } = getGearAffiliateLink(item);
  const label = getGearCtaLabel(type);

  function handleClick() {
    trackClientEvent("gear_affiliate_click", {
      metadata: {
        creator_slug: item.creatorSlug,
        product_name: item.productName,
        category: item.category,
        confidence: item.confidence,
        link_type: type,
      },
    });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className="mt-3 inline-flex min-h-[36px] items-center rounded-md bg-amber-400 px-3 py-1.5 text-xs font-semibold text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      {label}
    </a>
  );
}
