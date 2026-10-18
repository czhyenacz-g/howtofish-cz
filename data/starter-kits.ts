// Startovací rybářské sety pro /prvni-rybareni — ručně ověřený, malý seznam
// (max. 3 položky, viz MAX_STARTER_KITS). Každá položka musí mít funkční
// produktovou URL, platný affiliate odkaz a známý obsah balení; nic se
// nedomýšlí a prázdné karty se nevykreslují.
//
// Záměrně BEZ ceny a skladové dostupnosti — obojí se u prodejce mění a web
// nemá automatickou aktualizaci (režim minimální údržby).
import { buildDognetAffiliateUrl } from "../lib/affiliate/dognet.ts";

export type StarterKit = {
  /** Stabilní identifikátor pro analytiku (starter_kit_affiliate_click). */
  id: string;
  name: string;
  merchant: string;
  /** Přímá produktová URL u obchodníka (bez affiliate parametrů). */
  productUrl: string;
  /** Pro jaký způsob lovu set je — a pro jaký ne. */
  suitableFor: string;
  notSuitableFor: string;
  /** Obsah balení podle popisu prodejce. */
  contents: string[];
  /** Varianty podle délky prutu (prodejce je nabízí jako provedení). */
  variants: string[];
  /** Kdy jsme obsah a URL naposledy ručně ověřili (YYYY-MM-DD). */
  verifiedAt: string;
};

export const MAX_STARTER_KITS = 3;

/** Dognet `d2` pro odkazy z průvodce /prvni-rybareni. */
export const FIRST_FISHING_D2 = "first-fishing";

export const starterKits: StarterKit[] = [
  {
    id: "delphin-yakuza-feeder",
    name: "DELPHIN Yakuza – feedrový set",
    merchant: "OKfish.cz",
    productUrl: "https://www.okfish.cz/feedrovy-set-delphin-yakuza",
    suitableFor:
      "Lov na položenou s method feederem na rybnících, jezerech a klidnějších řekách — typicky kapr, karas, cejn a další kaprovité ryby.",
    notSuitableFor:
      "Není to univerzální výbava: na plavanou, přívlač (dravci), muškaření ani na sumce se nehodí — na ty je potřeba jiný prut a montáž.",
    contents: [
      "feederový prut Delphin YAKUZA (3 díly, zátěž 100 g)",
      "naviják Delphin YAKUZA 4T s navinutým vlascem 0,22 mm",
      "2 krmítka Method QUIX (30 g a 50 g)",
      "plnicí forma Method QUIX",
      "3 hotové method návazce (8 cm, vlasec 0,18 mm, háček vel. 6)",
      "plastový box 20 × 13 × 4,5 cm",
    ],
    variants: ["prut 3,00 m", "prut 3,30 m", "prut 3,60 m"],
    verifiedAt: "2026-10-18",
  },
];

/** Affiliate URL pro startovací set v průvodci (chid + d1=htf z DOGNET_CONFIG). */
export function getStarterKitAffiliateUrl(kit: StarterKit): string {
  return buildDognetAffiliateUrl(kit.productUrl, FIRST_FISHING_D2);
}
