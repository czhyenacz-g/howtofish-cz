import { pickPromotion } from "../../lib/promotions/match-route";
import { getActivePromotions } from "../../lib/universal-content-api/promotions";
import AffiliateBannerSlot from "./AffiliateBannerSlot";

/**
 * Server Component — načte VŠECHNY aktivní banner promotions (malý,
 * veřejný seznam bez UCA tokenu, žádné citlivé/interní pole — viz
 * PromotionEntry) a udělá stejný server-side weighted-random výběr jako
 * dřív (`initialPick`), ať SSR/první vykreslení nikdy nebliká. Server
 * nevidí localStorage, takže 7denní "už jsem na tohle klikl" vyřazení
 * (viz lib/promotions/clicked-promotions.ts) dořeší až klientská
 * "poslední míle" v AffiliateBannerSlot po mountu. `key={pathname}` ať
 * se při client-side navigaci na novou route provede čerstvý mount (a
 * tedy nový výběr), ne recyklace staré instance.
 */
export default async function AdSlot({ pathname }: { pathname: string }) {
  const candidates = await getActivePromotions("banner").catch(() => []);
  const initialPick = pickPromotion(candidates, pathname);

  return <AffiliateBannerSlot key={pathname} candidates={candidates} pathname={pathname} initialPick={initialPick} />;
}
