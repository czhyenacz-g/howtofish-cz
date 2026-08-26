"use client";

import { useEffect, useState } from "react";
import { computeAnyVisible, PROMOTION_BANNER_SELECTOR } from "../../lib/character-callouts/banner-visibility";

export { PROMOTION_BANNER_SELECTOR };

/**
 * True, pokud je právě teď ve viewportu vidět aspoň jeden promo banner.
 * Event-driven přes IntersectionObserver (žádný polling) — používá seller
 * callout, aby se nezobrazil přes viditelnou reklamu (viz seller-rules.ts).
 * Znovu se napojuje při každé změně route (banner elementy se mezitím
 * mohly úplně vyměnit).
 */
export function useBannerVisible(pathname: string): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);

    const elements = document.querySelectorAll<HTMLElement>(PROMOTION_BANNER_SELECTOR);
    if (elements.length === 0) return;

    const intersecting = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          intersecting.add(entry.target);
        } else {
          intersecting.delete(entry.target);
        }
      }
      setVisible(computeAnyVisible(intersecting.size));
    });

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [pathname]);

  return visible;
}
