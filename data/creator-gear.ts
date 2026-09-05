// Datový model pro "technika streamera" sekci na /streameri/[slug].
// confidence rozhoduje o veřejném vykreslení (viz getPublicGearForCreator
// a UI v app/components/CreatorGearSection.tsx):
//   verified   -> veřejně ANO
//   historical -> veřejně ANO, vždy s badge "historické" a formulací
//                 "dříve používal/a" (nikdy se netváří jako současný stav)
//   probable   -> NIKDY veřejně (jen sekundární/neověřený zdroj)
//   unverified -> NIKDY veřejně
// Žádný záznam bez dohledatelného `sourceUrl` — nevymýšlené vybavení.
export type GearConfidence = "verified" | "probable" | "historical" | "unverified";

/** Odkud se informace o vybavení vzala — vždy dohledatelný zdroj, ne odhad. */
export type GearSourceType = "video" | "stream" | "social-post" | "interview" | "other";

export type CreatorGearItem = {
  creatorSlug: string;
  /** Volný text (např. "prut", "sluchátka", "mikrofon", "křeslo") — dokud nemáme reálná data, nemá smysl vynucovat uzavřený enum kategorií. Veřejný label viz lib/creators/gear-categories.ts. */
  category: string;
  productName: string;
  brand?: string;
  model?: string;
  /** Konkrétní video/stream/příspěvek/stránka, kde je vybavení vidět/zmíněné — POVINNÉ, žádný záznam bez dohledatelného zdroje. */
  sourceUrl: string;
  sourceType: GearSourceType;
  /** ISO datum (aspoň rok), ke kterému se vybavení fakticky vztahuje (kdy bylo vidět/zmíněné) — odlišné od `verifiedAt`. Používá se pro "Zdroj z roku {rok}" u historical položek. */
  sourceDate?: string;
  /** ISO datum, kdy byl záznam naposledy ověřen proti zdroji. */
  verifiedAt: string;
  confidence: GearConfidence;
  note?: string;
  /** Explicitní affiliate odkaz na konkrétní produkt/nabídku — má přednost před automatickým Allegro+Dognet fallbackem (viz lib/creators/gear-affiliate.ts). */
  affiliateUrl?: string;
  /** Ruční přepis vyhledávacího dotazu pro Allegro fallback, když by `productName` dával špatné výsledky (viz zadání bod 7, např. "ASUS ROG Swift PG279Q" -> "ASUS PG279Q"). */
  searchQuery?: string;
  active: boolean;
};

// gameo.cz publikuje u videí HouseBoxe (viz sourceUrl) opakovaně stejný
// přehled jeho tehdejší techniky — ověřeno přímým načtením stránky
// (2026-09-05), datováno k 2019-05-23. Jde o starou (2015-2019) sestavu
// pro vlogy/lets-playe, ne o současné vybavení -> confidence: "historical"
// u všech položek (viz zadání bod 11). Žádné novější HouseBox položky
// (Shure SM7B, GoXLR Mini, Sony ZV-1/A7 III, RTX 3080, RØDE Wireless GO
// II/VideoMic NTG) se sem NEPŘIDÁVAJÍ — pro ně se v tomto repozitáři ani
// při webovém research nenašel žádný dohledatelný zdroj (viz zadání
// "nepřidávej je jen z promptu automaticky").
const HOUSEBOX_SOURCE_URL = "https://gameo.cz/simulator-pewdiepie-housebox/";
const HOUSEBOX_SOURCE_DATE = "2019-05-23";
const HOUSEBOX_VERIFIED_AT = "2026-09-05";

export const creatorGear: CreatorGearItem[] = [
  {
    creatorSlug: "housebox",
    category: "microphone",
    productName: "RØDE NT-USB",
    brand: "RØDE",
    model: "NT-USB",
    sourceUrl: HOUSEBOX_SOURCE_URL,
    sourceType: "other",
    sourceDate: HOUSEBOX_SOURCE_DATE,
    verifiedAt: HOUSEBOX_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "housebox",
    category: "microphone-arm",
    productName: "RØDE PSA1",
    brand: "RØDE",
    model: "PSA1",
    sourceUrl: HOUSEBOX_SOURCE_URL,
    sourceType: "other",
    sourceDate: HOUSEBOX_SOURCE_DATE,
    verifiedAt: HOUSEBOX_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "housebox",
    category: "monitor",
    productName: "ASUS ROG PG279Q",
    brand: "ASUS",
    model: "ROG PG279Q",
    sourceUrl: HOUSEBOX_SOURCE_URL,
    sourceType: "other",
    sourceDate: HOUSEBOX_SOURCE_DATE,
    verifiedAt: HOUSEBOX_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "housebox",
    category: "mouse",
    productName: "ASUS Cerberus Mouse",
    brand: "ASUS",
    model: "Cerberus",
    sourceUrl: HOUSEBOX_SOURCE_URL,
    sourceType: "other",
    sourceDate: HOUSEBOX_SOURCE_DATE,
    verifiedAt: HOUSEBOX_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "housebox",
    category: "keyboard",
    productName: "ASUS Cerberus Keyboard",
    brand: "ASUS",
    model: "Cerberus",
    sourceUrl: HOUSEBOX_SOURCE_URL,
    sourceType: "other",
    sourceDate: HOUSEBOX_SOURCE_DATE,
    verifiedAt: HOUSEBOX_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "housebox",
    category: "headset",
    productName: "ASUS Cerberus Arctic",
    brand: "ASUS",
    model: "Cerberus Arctic",
    sourceUrl: HOUSEBOX_SOURCE_URL,
    sourceType: "other",
    sourceDate: HOUSEBOX_SOURCE_DATE,
    verifiedAt: HOUSEBOX_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "housebox",
    category: "camera",
    productName: "Canon EOS 70D",
    brand: "Canon",
    model: "70D",
    sourceUrl: HOUSEBOX_SOURCE_URL,
    sourceType: "other",
    sourceDate: HOUSEBOX_SOURCE_DATE,
    verifiedAt: HOUSEBOX_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "housebox",
    category: "camera-lens",
    productName: "Sigma 18-35mm f/1.8",
    brand: "Sigma",
    model: "18-35mm f/1.8",
    sourceUrl: HOUSEBOX_SOURCE_URL,
    sourceType: "other",
    sourceDate: HOUSEBOX_SOURCE_DATE,
    verifiedAt: HOUSEBOX_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "housebox",
    category: "video-microphone",
    productName: "RØDE VideoMic Pro",
    brand: "RØDE",
    model: "VideoMic Pro",
    sourceUrl: HOUSEBOX_SOURCE_URL,
    sourceType: "other",
    sourceDate: HOUSEBOX_SOURCE_DATE,
    verifiedAt: HOUSEBOX_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "housebox",
    category: "camera",
    productName: "Canon PowerShot G7 X",
    brand: "Canon",
    model: "G7 X",
    sourceUrl: HOUSEBOX_SOURCE_URL,
    sourceType: "other",
    sourceDate: HOUSEBOX_SOURCE_DATE,
    verifiedAt: HOUSEBOX_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
];

// Vyhodnocené a VYŘAZENÉ v tomhle kole (žádný dohledatelný sourceUrl
// nenalezen v repozitáři ani při webovém research 2026-09-05) —
// zaznamenáno tady, ať se příště zbytečně neopakuje stejný slepý
// research. Nevkládat do `creatorGear` bez skutečného zdroje:
//   - Agraelus: Blue Yeti Pro (mikrofon) — žádný dohledaný zdroj.
//   - Herdyn: Ryzen 9 3900X / RTX 2080 Super / X570 Aorus Elite /
//     HyperX Fury RGB 32GB / EVGA SuperNOVA 750 G3 / NZXT H710.
//   - HaiseT: Shure SM7B / Razer Naga Pro Wireless / Logitech G915
//     Lightspeed / Logitech G Pro X Wireless / ASUS TUF VG27AQ /
//     LG UltraGear 32GP850-B / LG UltraGear 32GN600.
//   - Marwex: Shure SM7B / SteelSeries Aerox 3 Wireless / SteelSeries
//     Apex Pro / SteelSeries Arctis Pro Wireless / Canon 80D.

/**
 * Veřejně zobrazitelné vybavení daného tvůrce (zadání bod 5C):
 * - "verified" a "historical" se smí zobrazit (historical s označením
 *   "dříve používal", řeší UI komponenta, ne tahle funkce),
 * - "probable" a "unverified" se NIKDY nezobrazují veřejně,
 * - neaktivní (`active: false`) záznamy se nezobrazují vůbec.
 * Prázdný výsledek => komponenta sekci vůbec nevykreslí, žádné
 * "techniku doplníme později".
 */
export function getPublicGearForCreator(creatorSlug: string): CreatorGearItem[] {
  return creatorGear.filter(
    (item) => item.creatorSlug === creatorSlug && item.active && (item.confidence === "verified" || item.confidence === "historical")
  );
}
