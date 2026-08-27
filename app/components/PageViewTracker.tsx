"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isPageViewRoute } from "../../lib/analytics/page-view-routes";
import { trackClientEvent } from "../../lib/analytics/track-client-event";

/**
 * Neviditelná globální komponenta (mount v root layoutu) — zaloguje
 * "page_view" přesně jednou na skutečnou navigaci, ne při každém
 * re-renderu/mountu komponenty. `lastTrackedPathRef` přežije i React
 * StrictMode dvojité volání efektu v dev módu (ref hodnota se mezi
 * "mount -> cleanup -> mount" simulací neresetuje), takže ani v dev
 * módu nevznikne duplicitní page_view pro stejnou route — natožpak na
 * produkci, kde StrictMode dvojité efekty vůbec neexistují.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastTrackedPathRef.current === pathname) return;
    lastTrackedPathRef.current = pathname;

    if (!isPageViewRoute(pathname)) return;
    trackClientEvent("page_view", { path: pathname });
  }, [pathname]);

  return null;
}
