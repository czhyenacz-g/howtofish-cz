"use client";

import { trackClientEvent } from "../../lib/analytics/track-client-event";

// Odchozí partnerský odkaz na startovací set — "use client" jen kvůli
// onClick trackingu (starter_kit_affiliate_click). Href se počítá na
// serveru (data/starter-kits.ts), žádný fetch; klik nikdy neblokujeme.
export default function StarterKitAffiliateLink({
  href,
  productId,
  placement,
  children,
}: {
  href: string;
  productId: string;
  placement: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() => trackClientEvent("starter_kit_affiliate_click", { metadata: { product_id: productId, placement } })}
      className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-amber-400 px-6 py-2.5 font-serif text-sm text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
    >
      {children}
    </a>
  );
}
