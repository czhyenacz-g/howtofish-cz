// Datový model pro "technika streamera" sekci na /streameri/[slug].
// confidence rozhoduje o veřejném vykreslení (viz getPublicGearForCreator
// a UI v app/components/CreatorGearSection.tsx) — tři veřejné úrovně
// (řazené v tomhle pořadí i v UI) a dvě interní:
//   verified   -> veřejně ANO, badge "Ověřeno"
//   historical -> veřejně ANO, badge "Historické" + "dříve používal/a"
//                 (nikdy se netváří jako současný stav)
//   estimated  -> veřejně ANO, badge "Odhad" + vždy nekompromisní
//                 disclaimer (NIKDY "streamer používá X", jen "X — odhad" /
//                 "možná alternativa") — přesný setup není veřejně
//                 potvrzen, jde o orientační produkt daného typu
//                 streamování, viz lib/creators/gear-confidence.ts.
//   probable   -> NIKDY veřejně (jen sekundární/neověřený zdroj, interní)
//   unverified -> NIKDY veřejně (interní)
// verified/historical vyžadují dohledatelný `sourceUrl` — nevymýšlené
// vybavení. estimated naopak sourceUrl NEMÁ MÍT (žádný vymyšlený zdroj,
// viz zadání bod 26), místo něj `sourceType: "estimate"`.
export type GearConfidence = "verified" | "probable" | "historical" | "unverified" | "estimated";

/** Odkud se informace o vybavení vzala. "estimate" = žádný konkrétní zdroj — jde o redakční odhad typického vybavení, ne o doložený fakt. */
export type GearSourceType = "video" | "stream" | "social-post" | "interview" | "other" | "estimate";

export type CreatorGearItem = {
  creatorSlug: string;
  /** Volný text (např. "prut", "sluchátka", "mikrofon", "křeslo") — dokud nemáme reálná data, nemá smysl vynucovat uzavřený enum kategorií. Veřejný label viz lib/creators/gear-categories.ts. */
  category: string;
  productName: string;
  brand?: string;
  model?: string;
  /** Konkrétní video/stream/příspěvek/stránka, kde je vybavení vidět/zmíněné — POVINNÉ pro verified/historical (žádný záznam bez dohledatelného zdroje). U estimated (sourceType: "estimate") se NEVYPLŇUJE — žádná vymyšlená URL, viz zadání bod 26. */
  sourceUrl?: string;
  sourceType: GearSourceType;
  /** ISO datum (aspoň rok), ke kterému se vybavení fakticky vztahuje (kdy bylo vidět/zmíněné) — odlišné od `verifiedAt`. Používá se pro "Zdroj z roku {rok}" u historical položek. */
  sourceDate?: string;
  /** ISO datum, kdy byl záznam naposledy ověřen/zredigován. */
  verifiedAt: string;
  confidence: GearConfidence;
  note?: string;
  /** Explicitní affiliate odkaz na konkrétní produkt/nabídku — má přednost před automatickým Allegro+Dognet fallbackem (viz lib/creators/gear-affiliate.ts). */
  affiliateUrl?: string;
  /** Ruční přepis vyhledávacího dotazu pro Allegro fallback, když by `productName` dával špatné výsledky (viz zadání bod 7, např. "ASUS ROG Swift PG279Q" -> "ASUS PG279Q"). */
  searchQuery?: string;
  active: boolean;
};

/** Confidence úrovně, které se smí někdy zobrazit veřejně (viz getPublicGearForCreator) — sdíleno s UI pro řazení/labely. */
export const PUBLIC_GEAR_CONFIDENCE = ["verified", "historical", "estimated"] as const;
export type PublicGearConfidence = (typeof PUBLIC_GEAR_CONFIDENCE)[number];

export function isPublicGearConfidence(confidence: GearConfidence): confidence is PublicGearConfidence {
  return (PUBLIC_GEAR_CONFIDENCE as readonly string[]).includes(confidence);
}

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

const HOUSEBOX_GEAR: CreatorGearItem[] = [
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

// AGRAELUS — "TIGO Beast by Agraelus" (spolupráce se Smarty.cz),
// konkrétní specifikace ověřena přes Zing.cz (2026-09-06), článek
// publikovaný 2022-12-06. Aktivní, dodnes prodávaná produktová řada
// "TIGO by Agraelus" na Smarty.cz to potvrzuje jako reálnou, ne
// jednorázovou spolupráci — confidence "verified". CPU zdroj uvádí jen
// "13. generace Intel Core i9" bez přesného SKU (13900K/KF) — nevymýšlím
// přesnější model, než zdroj skutečně říká.
const AGRAELUS_SOURCE_URL =
  "https://zing.cz/article/agraelus-uzavrel-partnerstvi-s-jrc-a-postavil-nejvykonnejsi-pc-na-ceskem-trhu";
const AGRAELUS_SOURCE_DATE = "2022-12-06";
const AGRAELUS_VERIFIED_AT = "2026-09-06";

const AGRAELUS_GEAR: CreatorGearItem[] = [
  {
    creatorSlug: "agraelus",
    category: "gpu",
    productName: "GIGABYTE GeForce RTX 4090",
    brand: "GIGABYTE",
    model: "RTX 4090",
    sourceUrl: AGRAELUS_SOURCE_URL,
    sourceType: "other",
    sourceDate: AGRAELUS_SOURCE_DATE,
    verifiedAt: AGRAELUS_VERIFIED_AT,
    confidence: "verified",
    note: "Součást PC „TIGO Beast by Agraelus“ (spolupráce se Smarty.cz).",
    active: true,
  },
  {
    creatorSlug: "agraelus",
    category: "cpu",
    productName: "Intel Core i9 (13. generace)",
    brand: "Intel",
    searchQuery: "Intel Core i9 13. generace",
    sourceUrl: AGRAELUS_SOURCE_URL,
    sourceType: "other",
    sourceDate: AGRAELUS_SOURCE_DATE,
    verifiedAt: AGRAELUS_VERIFIED_AT,
    confidence: "verified",
    active: true,
  },
  {
    creatorSlug: "agraelus",
    category: "ram",
    productName: "Kingston FURY Beast 64GB DDR5 6000MHz",
    brand: "Kingston",
    model: "FURY Beast",
    searchQuery: "Kingston FURY Beast DDR5 64GB",
    sourceUrl: AGRAELUS_SOURCE_URL,
    sourceType: "other",
    sourceDate: AGRAELUS_SOURCE_DATE,
    verifiedAt: AGRAELUS_VERIFIED_AT,
    confidence: "verified",
    active: true,
  },
  {
    creatorSlug: "agraelus",
    category: "storage",
    productName: "2× Kingston FURY Renegade 2TB NVMe",
    brand: "Kingston",
    model: "FURY Renegade",
    searchQuery: "Kingston FURY Renegade 2TB",
    sourceUrl: AGRAELUS_SOURCE_URL,
    sourceType: "other",
    sourceDate: AGRAELUS_SOURCE_DATE,
    verifiedAt: AGRAELUS_VERIFIED_AT,
    confidence: "verified",
    active: true,
  },
  {
    creatorSlug: "agraelus",
    category: "cooling",
    productName: "GIGABYTE AORUS WATERFORCE X 360",
    brand: "GIGABYTE",
    model: "AORUS WATERFORCE X 360",
    sourceUrl: AGRAELUS_SOURCE_URL,
    sourceType: "other",
    sourceDate: AGRAELUS_SOURCE_DATE,
    verifiedAt: AGRAELUS_VERIFIED_AT,
    confidence: "verified",
    active: true,
  },
  {
    creatorSlug: "agraelus",
    category: "motherboard",
    productName: "GIGABYTE Z790 AERO G",
    brand: "GIGABYTE",
    model: "Z790 AERO G",
    sourceUrl: AGRAELUS_SOURCE_URL,
    sourceType: "other",
    sourceDate: AGRAELUS_SOURCE_DATE,
    verifiedAt: AGRAELUS_VERIFIED_AT,
    confidence: "verified",
    active: true,
  },
];

// FLYGUN — stejný gameo.cz "PC sestava" boilerplate vzorec jako
// HouseBox, ověřeno přímým načtením stránky (2026-09-06), datováno
// 2019-07-11. Stará (2019) sestava -> historical. Vybráno 6
// nejzajímavějších z 8 dohledaných položek (zadání bod 9), ne celý seznam.
const FLYGUN_SOURCE_URL = "https://gameo.cz/nadavani-se-spirit-dead-by-daylight-flyguncz/";
const FLYGUN_SOURCE_DATE = "2019-07-11";
const FLYGUN_VERIFIED_AT = "2026-09-06";

const FLYGUN_GEAR: CreatorGearItem[] = [
  {
    creatorSlug: "flygun",
    category: "gpu",
    productName: "NVIDIA GeForce GTX 1080",
    brand: "NVIDIA",
    model: "GTX 1080",
    sourceUrl: FLYGUN_SOURCE_URL,
    sourceType: "other",
    sourceDate: FLYGUN_SOURCE_DATE,
    verifiedAt: FLYGUN_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "flygun",
    category: "cpu",
    productName: "Intel Core i7-6700K",
    brand: "Intel",
    model: "i7-6700K",
    sourceUrl: FLYGUN_SOURCE_URL,
    sourceType: "other",
    sourceDate: FLYGUN_SOURCE_DATE,
    verifiedAt: FLYGUN_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "flygun",
    category: "motherboard",
    productName: "ASUS ROG Maximus VIII Hero",
    brand: "ASUS",
    model: "ROG Maximus VIII Hero",
    sourceUrl: FLYGUN_SOURCE_URL,
    sourceType: "other",
    sourceDate: FLYGUN_SOURCE_DATE,
    verifiedAt: FLYGUN_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "flygun",
    category: "ram",
    productName: "HyperX Fury Black 32GB DDR4 2400MHz",
    brand: "HyperX",
    model: "Fury Black",
    searchQuery: "HyperX Fury Black DDR4 32GB",
    sourceUrl: FLYGUN_SOURCE_URL,
    sourceType: "other",
    sourceDate: FLYGUN_SOURCE_DATE,
    verifiedAt: FLYGUN_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "flygun",
    category: "microphone",
    productName: "Blue Spark",
    brand: "Blue",
    model: "Spark",
    sourceUrl: FLYGUN_SOURCE_URL,
    sourceType: "other",
    sourceDate: FLYGUN_SOURCE_DATE,
    verifiedAt: FLYGUN_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
  {
    creatorSlug: "flygun",
    category: "cooling",
    productName: "Corsair Hydro Series H105",
    brand: "Corsair",
    model: "Hydro Series H105",
    sourceUrl: FLYGUN_SOURCE_URL,
    sourceType: "other",
    sourceDate: FLYGUN_SOURCE_DATE,
    verifiedAt: FLYGUN_VERIFIED_AT,
    confidence: "historical",
    active: true,
  },
];

// HERDYN — gameo.cz výslovně odkazuje "Herdynův PC" na konkrétní
// sponzorovanou sestavu HAL3000 MČR 2020 Ultimate (PCHS2379), ověřeno
// přímým načtením stránky (2026-09-06), datováno 2020-04-12. Přesná
// specifikace SKU dohledána u více nezávislých obchodů (CZC.cz,
// Heureka.cz, PeKro.cz). Stará (2020) sponzorovaná sestava -> historical.
const HERDYN_SOURCE_URL = "https://gameo.cz/dvojnasobny-mistr-cr-vs-auto-my-summer-car-herdyn/";
const HERDYN_SOURCE_DATE = "2020-04-12";
const HERDYN_VERIFIED_AT = "2026-09-06";
const HERDYN_NOTE = "Součást sponzorované sestavy HAL3000 MČR 2020 Ultimate.";

const HERDYN_GEAR: CreatorGearItem[] = [
  {
    creatorSlug: "herdyn",
    category: "cpu",
    productName: "AMD Ryzen 9 3900X",
    brand: "AMD",
    model: "Ryzen 9 3900X",
    sourceUrl: HERDYN_SOURCE_URL,
    sourceType: "other",
    sourceDate: HERDYN_SOURCE_DATE,
    verifiedAt: HERDYN_VERIFIED_AT,
    confidence: "historical",
    note: HERDYN_NOTE,
    active: true,
  },
  {
    creatorSlug: "herdyn",
    category: "gpu",
    productName: "GIGABYTE GeForce RTX 2080 SUPER Gaming OC",
    brand: "GIGABYTE",
    model: "RTX 2080 SUPER Gaming OC",
    searchQuery: "GIGABYTE RTX 2080 SUPER Gaming OC",
    sourceUrl: HERDYN_SOURCE_URL,
    sourceType: "other",
    sourceDate: HERDYN_SOURCE_DATE,
    verifiedAt: HERDYN_VERIFIED_AT,
    confidence: "historical",
    note: HERDYN_NOTE,
    active: true,
  },
  {
    creatorSlug: "herdyn",
    category: "ram",
    productName: "32GB DDR4 3200MHz RGB",
    searchQuery: "32GB DDR4 3200MHz RGB",
    sourceUrl: HERDYN_SOURCE_URL,
    sourceType: "other",
    sourceDate: HERDYN_SOURCE_DATE,
    verifiedAt: HERDYN_VERIFIED_AT,
    confidence: "historical",
    note: HERDYN_NOTE,
    active: true,
  },
  {
    creatorSlug: "herdyn",
    category: "psu",
    productName: "EVGA SuperNOVA 750 G3",
    brand: "EVGA",
    model: "SuperNOVA 750 G3",
    sourceUrl: HERDYN_SOURCE_URL,
    sourceType: "other",
    sourceDate: HERDYN_SOURCE_DATE,
    verifiedAt: HERDYN_VERIFIED_AT,
    confidence: "historical",
    note: HERDYN_NOTE,
    active: true,
  },
  {
    creatorSlug: "herdyn",
    category: "case",
    productName: "NZXT H710",
    brand: "NZXT",
    model: "H710",
    sourceUrl: HERDYN_SOURCE_URL,
    sourceType: "other",
    sourceDate: HERDYN_SOURCE_DATE,
    verifiedAt: HERDYN_VERIFIED_AT,
    confidence: "historical",
    note: HERDYN_NOTE,
    active: true,
  },
];

// DZERYYY21 — přímo z jeho vlastního veřejného Kick "About" profilu
// (kick.com/dzeryyy21), ověřeno 2026-09-09. Primární zdroj (tvůrce sám o
// sobě), confidence "verified" stejně jako AGRAELUS_GEAR výš. RAM: zdroj
// doslova uvádí "32gb RAM 7400 Mhz" — číslo přebíráme beze změny/opravy
// (viz zadání "neinterpretuj"), typ paměti ani výrobce zdroj neuvádí,
// proto se nedoplňuje. Mouse je "Logitech G Pro" PŘESNĚ podle zdroje —
// NIKDY nezaměňovat/nedoplňovat na "G Pro X Superlight" (jiný produkt,
// zadání bod 24).
const DZERYYY21_SOURCE_URL = "https://kick.com/dzeryyy21";
const DZERYYY21_VERIFIED_AT = "2026-09-09";

const DZERYYY21_GEAR: CreatorGearItem[] = [
  {
    creatorSlug: "dzeryyy21",
    category: "cpu",
    productName: "Intel Core i9-10850K",
    brand: "Intel",
    model: "i9-10850K",
    sourceUrl: DZERYYY21_SOURCE_URL,
    sourceType: "other",
    verifiedAt: DZERYYY21_VERIFIED_AT,
    confidence: "verified",
    active: true,
  },
  {
    creatorSlug: "dzeryyy21",
    category: "gpu",
    productName: "NVIDIA GeForce RTX 3080",
    brand: "NVIDIA",
    model: "RTX 3080",
    sourceUrl: DZERYYY21_SOURCE_URL,
    sourceType: "other",
    verifiedAt: DZERYYY21_VERIFIED_AT,
    confidence: "verified",
    active: true,
  },
  {
    creatorSlug: "dzeryyy21",
    category: "ram",
    productName: "32 GB RAM",
    sourceUrl: DZERYYY21_SOURCE_URL,
    sourceType: "other",
    verifiedAt: DZERYYY21_VERIFIED_AT,
    confidence: "verified",
    note: "Zdroj uvádí doslova „32gb RAM 7400 Mhz“ — typ paměti ani výrobce nejsou uvedeny.",
    active: true,
  },
  {
    creatorSlug: "dzeryyy21",
    category: "monitor",
    productName: "AOC 27G4HA",
    brand: "AOC",
    model: "27G4HA",
    sourceUrl: DZERYYY21_SOURCE_URL,
    sourceType: "other",
    verifiedAt: DZERYYY21_VERIFIED_AT,
    confidence: "verified",
    note: "Hlavní monitor, 200 Hz.",
    active: true,
  },
  {
    creatorSlug: "dzeryyy21",
    category: "monitor",
    productName: "HP E32k G5",
    brand: "HP",
    model: "E32k G5",
    sourceUrl: DZERYYY21_SOURCE_URL,
    sourceType: "other",
    verifiedAt: DZERYYY21_VERIFIED_AT,
    confidence: "verified",
    note: "Druhý monitor, 4K, 60 Hz.",
    active: true,
  },
  {
    creatorSlug: "dzeryyy21",
    category: "monitor",
    productName: "AOC 24B2XHM2",
    brand: "AOC",
    model: "24B2XHM2",
    sourceUrl: DZERYYY21_SOURCE_URL,
    sourceType: "other",
    verifiedAt: DZERYYY21_VERIFIED_AT,
    confidence: "verified",
    note: "Třetí monitor, 75 Hz.",
    active: true,
  },
  {
    creatorSlug: "dzeryyy21",
    category: "keyboard",
    productName: "Razer Huntsman Mini",
    brand: "Razer",
    model: "Huntsman Mini",
    sourceUrl: DZERYYY21_SOURCE_URL,
    sourceType: "other",
    verifiedAt: DZERYYY21_VERIFIED_AT,
    confidence: "verified",
    note: "Red switches.",
    active: true,
  },
  {
    creatorSlug: "dzeryyy21",
    category: "mouse",
    productName: "Logitech G Pro",
    brand: "Logitech",
    model: "G Pro",
    sourceUrl: DZERYYY21_SOURCE_URL,
    sourceType: "other",
    verifiedAt: DZERYYY21_VERIFIED_AT,
    confidence: "verified",
    active: true,
  },
  {
    creatorSlug: "dzeryyy21",
    category: "headset",
    productName: "HyperX Cloud II",
    brand: "HyperX",
    model: "Cloud II",
    sourceUrl: DZERYYY21_SOURCE_URL,
    sourceType: "other",
    verifiedAt: DZERYYY21_VERIFIED_AT,
    confidence: "verified",
    note: "Zdroj uvádí i variantu zápisu „HyperX Cloud 2“.",
    active: true,
  },
];

// ESTIMATED položky — u žádného z těchto tvůrců se při webovém research
// (2026-09-06) nepodařilo dohledat žádný veřejně dostupný, konkrétní
// zdroj (žádný gameo.cz/CZC.cz/kit.co apod. seznam vybavení pro dané
// jméno — CZC.cz "influencer sestava" odkazy jsou navíc dnes obecně
// mrtvé/přesměrované na generický Allegro obchod). Nejde o tvrzení, co
// streamer skutečně používá — jde o typické/orientační produkty pro daný
// typ streamování, vždy sourceType: "estimate", NIKDY sourceUrl (zadání
// bod 26). Veřejně se vykreslují jen pod jednoznačným "Jakou techniku
// může X používat?" nadpisem + disclaimerem (viz CreatorGearSection.tsx).
const ESTIMATED_VERIFIED_AT = "2026-09-06";

function estimated(creatorSlug: string, category: string, productName: string, brand?: string): CreatorGearItem {
  return {
    creatorSlug,
    category,
    productName,
    brand,
    sourceType: "estimate",
    verifiedAt: ESTIMATED_VERIFIED_AT,
    confidence: "estimated",
    active: true,
  };
}

const ESTIMATED_GEAR: CreatorGearItem[] = [
  // HAISET — relativně současné, kvalitně známé produkty pro daný typ
  // streamování, ale bez vlastního/důvěryhodně specifického zdroje.
  estimated("haiset", "microphone", "Shure SM7B", "Shure"),
  estimated("haiset", "headset", "Logitech G Pro X Wireless", "Logitech"),
  estimated("haiset", "mouse", "Razer Naga Pro", "Razer"),
  estimated("haiset", "keyboard", "Logitech G915 Lightspeed", "Logitech"),
  estimated("haiset", "cpu", "AMD Ryzen 7 9800X3D", "AMD"),
  estimated("haiset", "gpu", "NVIDIA GeForce RTX 5090", "NVIDIA"),

  // FATTYPILLOW — historicky typický setup pro dobu, ale bez dohledaného
  // zdroje konkrétně pro FattyPillow (CZC.cz odkazy na "Sestava
  // FattyPillow" jsou dnes mrtvé/přesměrované). Současná spolupráce se
  // Smarty ("TIGO by FattyPillow") existuje, ale bez dalšího důkazu z ní
  // neodvozujeme konkrétní současný produkt.
  estimated("fattypillow", "cpu", "Intel Core i9-9900KF", "Intel"),
  estimated("fattypillow", "gpu", "NVIDIA GeForce RTX 2080 Ti", "NVIDIA"),
  estimated("fattypillow", "ram", "32GB DDR4"),
  estimated("fattypillow", "headset", "Razer Kraken Pro", "Razer"),
  estimated("fattypillow", "microphone", "M-Audio Vocal Studio", "M-Audio"),

  // MARWEX — veřejně opakovaně zmiňované typy produktů, ale bez
  // dohledaného konkrétního zdroje (gameo.cz stránky MarweX obsahují jen
  // obecný odkaz na "Můj počítač", ne rozepsanou specifikaci).
  estimated("marwex", "camera", "Canon 80D", "Canon"),
  estimated("marwex", "microphone", "Shure SM7B", "Shure"),
  estimated("marwex", "headset", "SteelSeries Arctis Pro Wireless", "SteelSeries"),
  estimated("marwex", "mouse", "SteelSeries Aerox 3 Wireless", "SteelSeries"),
  estimated("marwex", "keyboard", "SteelSeries Apex Pro", "SteelSeries"),

  // KAPESNIK69
  estimated("kapesnik69", "microphone", "Shure SM7B", "Shure"),
  estimated("kapesnik69", "headset", "Logitech G Pro X 2 Lightspeed", "Logitech"),
  estimated("kapesnik69", "mouse", "Logitech G Pro X Superlight 2", "Logitech"),

  // MIKEN
  estimated("miken", "microphone", "Shure MV7+", "Shure"),
  estimated("miken", "mouse", "Logitech G Pro X Superlight 2", "Logitech"),
  estimated("miken", "keyboard", "SteelSeries Apex Pro TKL", "SteelSeries"),

  // ASTATORO
  estimated("astatoro", "microphone", "Shure MV7+", "Shure"),
  estimated("astatoro", "headset", "Logitech G Pro X 2 Lightspeed", "Logitech"),
  estimated("astatoro", "mouse", "Razer DeathAdder V3 Pro", "Razer"),

  // 2SEKUNDOVYMATO
  estimated("2sekundovymato", "microphone", "Shure MV7+", "Shure"),
  estimated("2sekundovymato", "headset", "Logitech G Pro X 2 Lightspeed", "Logitech"),
  estimated("2sekundovymato", "streamdeck", "Elgato Stream Deck MK.2", "Elgato"),

  // FREEZE — pozor, jde o CZ How to Fish streamera "Freeze", NE o jinou
  // stejnojmennou esport osobnost (viz zadání bod 18).
  estimated("freeze", "mouse", "Logitech G Pro X Superlight 2", "Logitech"),
  estimated("freeze", "keyboard", "SteelSeries Apex Pro TKL", "SteelSeries"),
  estimated("freeze", "headset", "HyperX Cloud III Wireless", "HyperX"),

  // ANYMALL — jen 2 položky (zadání bod 19).
  estimated("anymall", "microphone", "Shure MV7", "Shure"),
  estimated("anymall", "mouse", "Logitech G Pro X Superlight 2", "Logitech"),

  // BOSHOO — skutečný slug z projektu je "boshoo" (data/creators.ts).
  estimated("boshoo", "microphone", "Shure MV7", "Shure"),
  estimated("boshoo", "headset", "Logitech G Pro X 2 Lightspeed", "Logitech"),

  // PIXELOREZLIVE
  estimated("pixelorezlive", "microphone", "Shure MV7", "Shure"),
  estimated("pixelorezlive", "mouse", "Logitech G Pro X Superlight 2", "Logitech"),
];

export const creatorGear: CreatorGearItem[] = [
  ...HOUSEBOX_GEAR,
  ...AGRAELUS_GEAR,
  ...FLYGUN_GEAR,
  ...HERDYN_GEAR,
  ...DZERYYY21_GEAR,
  ...ESTIMATED_GEAR,
];

/**
 * Veřejně zobrazitelné vybavení daného tvůrce (zadání bod 5C, rozšířeno
 * o "estimated" v další fázi — viz PUBLIC_GEAR_CONFIDENCE výš):
 * - "verified"/"historical"/"estimated" se smí zobrazit (confidence
 *   badge + wording řeší UI komponenta, ne tahle funkce),
 * - "probable" a "unverified" se NIKDY nezobrazují veřejně,
 * - neaktivní (`active: false`) záznamy se nezobrazují vůbec.
 * Prázdný výsledek => komponenta sekci vůbec nevykreslí, žádné
 * "techniku doplníme později".
 */
export function getPublicGearForCreator(creatorSlug: string): CreatorGearItem[] {
  return creatorGear.filter(
    (item) => item.creatorSlug === creatorSlug && item.active && isPublicGearConfidence(item.confidence)
  );
}

/** Má tvůrce aspoň jednu doloženou (ne jen odhadovanou) položku? Pro SEO popisek (zadání bod 24 — u estimated se nemá tvrdit "najdeš tu jeho vybavení"). */
export function hasConfirmedGear(creatorSlug: string): boolean {
  return creatorGear.some(
    (item) => item.creatorSlug === creatorSlug && item.active && (item.confidence === "verified" || item.confidence === "historical")
  );
}
