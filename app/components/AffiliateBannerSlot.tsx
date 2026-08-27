"use client";

import { useEffect, useState } from "react";
import { trackClientEvent } from "../../lib/analytics/track-client-event";
import { excludeRecentlyClicked, isPromotionRecentlyClicked, markPromotionClicked } from "../../lib/promotions/clicked-promotions";
import { pickPromotion } from "../../lib/promotions/match-route";
import type { PromotionEntry } from "../../lib/universal-content-api/types";
import AdPlaceholder from "./AdPlaceholder";
import AffiliateBanner from "./AffiliateBanner";

/**
 * Klientská "poslední míle" banner výběru — server (AdSlot a spol.)
 * udělá stejný náhodný výběr ze VŠECH aktivních kandidátů jako dřív
 * (`initialPick`), takže SSR i první vykreslení nikdy nebliká (server
 * localStorage nevidí, a nechceme kvůli 7denní exclusion přidávat
 * backend/cookie sync, viz zadání). Teprve PO mountu se ověří, jestli
 * uživatel na tenhle konkrétní banner v posledních 7 dnech neklikl (viz
 * lib/promotions/clicked-promotions.ts) — pokud ano, provede se nový
 * výběr jen z odfiltrovaných kandidátů. Když k tomu není důvod, žádný
 * druhý los neproběhne (initialPick zůstává beze změny), ať banner
 * nebliká zbytečně při každé běžné návštěvě.
 *
 * `key={pathname}` na volajícím místě (viz AdSlot.tsx) zajišťuje čerstvý
 * mount (a tedy nový výběr) při každé změně route.
 */
export default function AffiliateBannerSlot({
  candidates,
  pathname,
  initialPick,
  placeholderOnEmpty = true,
}: {
  candidates: PromotionEntry[];
  pathname: string;
  initialPick: PromotionEntry | null;
  // /ryby záměrně nezobrazuje "Reklamní prostor" placeholder, viz
  // FishBrowser.tsx — jinde (AdSlot, StreamBrowser) zůstává výchozí chování.
  placeholderOnEmpty?: boolean;
}) {
  const [promotion, setPromotion] = useState<PromotionEntry | null>(initialPick);

  useEffect(() => {
    if (!promotion) return;
    if (!isPromotionRecentlyClicked(promotion.id)) return;

    const available = excludeRecentlyClicked(candidates);
    setPromotion(pickPromotion(available, pathname));
    // Jen jednou po mountu (nový mount = nová route díky key={pathname}
    // na volajícím místě) — ne při každém re-renderu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick() {
    if (!promotion) return;
    markPromotionClicked(promotion.id);
    trackClientEvent("affiliate_click", { metadata: { promotion_id: promotion.id, placement: "banner" } });
  }

  if (!promotion || !promotion.imageUrl) {
    return placeholderOnEmpty ? <AdPlaceholder /> : null;
  }

  return (
    <AffiliateBanner
      imageSrc={promotion.imageUrl}
      href={promotion.href}
      title={promotion.title}
      onClick={promotion.href ? handleClick : undefined}
    />
  );
}
