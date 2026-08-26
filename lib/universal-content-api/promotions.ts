import "server-only";
import { pickPromotion } from "../promotions/match-route.ts";
import { getApprovedCommunityRecords } from "./community.ts";
import type { PromotionEntry, PromotionPlacement, UcaRecord } from "./types.ts";

const COLLECTION = "promotions";
// Promotion obsah není realtime (admin ho spravuje ručně) — o něco delší
// okno než ostatní community collections (60s), viz zadání ("cca 2 minuty").
const REVALIDATE_SECONDS = 120;

/**
 * null = record není zobrazitelná promotion (chybí povinné pole, banner
 * bez obrázku/odkazu, neplatný placement, nebo `active !== true`) — UCA
 * o `active` nic neví (je to jen další pole v `data`), filtrování je
 * čistě na nás. Viz PromotionsTest.php na UCA straně, které dokumentuje,
 * že generický endpoint neaktivní promotions klidně vrátí.
 */
function mapRecordToPromotion(record: UcaRecord): PromotionEntry | null {
  const data = record.data;

  if (data.active !== true) return null;

  const placement = data.placement;
  if (placement !== "banner" && placement !== "seller") return null;

  const pagePattern = typeof data.page_pattern === "string" ? data.page_pattern : null;
  const title = typeof data.title === "string" ? data.title : null;
  if (!pagePattern || !title) return null;

  // Poslední navázané médium vyhrává — admin může na edit stránce nahrát
  // nový obrázek, staré médium se nemaže (add-only), ale nové má vždy
  // přednost při zobrazení (viz UCA EditPromotion.php).
  const media = record.media[record.media.length - 1];
  const imageUrl = media?.public_url;
  const href = typeof data.href === "string" && data.href ? data.href : undefined;

  // Banner bez obrázku nebo bez cíle nedává smysl zobrazit — radši
  // spadnout na AdPlaceholder fallback (viz AdSlot) než ukázat rozbitý banner.
  if (placement === "banner" && (!imageUrl || !href)) return null;

  const weightRaw = data.weight;
  const weight = typeof weightRaw === "number" && weightRaw > 0 ? weightRaw : 1;

  return {
    id: `community-${record.id}`,
    placement,
    pagePattern,
    title,
    bodyHtml: typeof data.body_html === "string" && data.body_html ? data.body_html : undefined,
    ctaLabel: typeof data.cta_label === "string" && data.cta_label ? data.cta_label : undefined,
    href,
    imageUrl,
    weight,
  };
}

/**
 * Všechny aktivní promotions daného placementu — cachováno ~2 min (viz
 * community.ts). Malý, ne-citlivý seznam (admin-psaný marketing text),
 * proto je v pořádku ho pro seller placement předat i jako plain prop do
 * "use client" CharacterCallout (viz report) — pro banner ho ale nikdy
 * nevidí browser, AdSlot dělá výběr server-side (getActivePromotionForRoute).
 */
export async function getActivePromotions(placement: PromotionPlacement): Promise<PromotionEntry[]> {
  const records = await getApprovedCommunityRecords(COLLECTION, 100, REVALIDATE_SECONDS).catch(() => []);
  return records
    .map(mapRecordToPromotion)
    .filter((p): p is PromotionEntry => p !== null && p.placement === placement);
}

export async function getActivePromotionForRoute(
  placement: PromotionPlacement,
  pathname: string
): Promise<PromotionEntry | null> {
  const candidates = await getActivePromotions(placement);
  return pickPromotion(candidates, pathname);
}
