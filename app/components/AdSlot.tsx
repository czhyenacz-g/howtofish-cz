import { getActivePromotionForRoute } from "../../lib/universal-content-api/promotions";
import AdPlaceholder from "./AdPlaceholder";
import AffiliateBanner from "./AffiliateBanner";

// Server Component — vybírá aktivní "banner" promotion pro danou route
// server-side (nikdy neposílá kandidáty do browseru, jen výsledek), viz
// report k volbě Varianty A pro banner placement. Beze změny promotion →
// beze změny stránky, žádný redeploy při nové kampani.
export default async function AdSlot({ pathname }: { pathname: string }) {
  const promotion = await getActivePromotionForRoute("banner", pathname).catch(() => null);

  if (!promotion || !promotion.imageUrl || !promotion.href) {
    return <AdPlaceholder />;
  }

  return <AffiliateBanner imageSrc={promotion.imageUrl} href={promotion.href} title={promotion.title} />;
}
