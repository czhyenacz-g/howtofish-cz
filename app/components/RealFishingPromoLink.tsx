"use client";

import Link from "next/link";
import { trackClientEvent } from "../../lib/analytics/track-client-event";
import { REAL_FISHING_PROMO_HREF } from "./real-fishing-promo";

// Jediná klientská část RealFishingPromo — CTA odkaz s měřením
// real_fishing_banner_click (zdrojová stránka jde v `path`).
export default function RealFishingPromoLink({ placement, label }: { placement: string; label: string }) {
  return (
    <Link
      href={REAL_FISHING_PROMO_HREF}
      onClick={() => trackClientEvent("real_fishing_banner_click", { metadata: { placement } })}
      className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-amber-400 px-5 py-2.5 font-serif text-sm text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
    >
      {label}
    </Link>
  );
}
