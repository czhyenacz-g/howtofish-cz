// Datový model pro budoucí "technika streamera" sekci na
// /streameri/[slug] (viz zadání) — struktura je připravená, ale záměrně
// PRÁZDNÁ: žádný aktuální tvůrce nemá v projektu ověřené vybavení, a
// zadání výslovně zakazuje cokoliv vymýšlet ("nevymýšlej, co kdo
// používá"). Dokud sem někdo ručně nepřidá ověřený záznam (screenshot/
// video/rozhovor jako `sourceUrl`), zůstane pole prázdné a sekce se na
// žádném profilu nevykreslí (viz getPublicGearForCreator).
export type GearConfidence = "verified" | "probable" | "historical" | "unverified";

/** Odkud se informace o vybavení vzala — vždy dohledatelný zdroj, ne odhad. */
export type GearSourceType = "video" | "stream" | "social-post" | "interview" | "other";

export type CreatorGearItem = {
  creatorSlug: string;
  /** Volný text (např. "prut", "sluchátka", "mikrofon", "křeslo") — dokud nemáme reálná data, nemá smysl vynucovat uzavřený enum kategorií. */
  category: string;
  productName: string;
  brand?: string;
  model?: string;
  /** Konkrétní video/stream/příspěvek, kde je vybavení vidět/zmíněné — POVINNÉ, žádný záznam bez dohledatelného zdroje. */
  sourceUrl: string;
  sourceType: GearSourceType;
  /** ISO datum, kdy byl záznam naposledy ověřen proti zdroji. */
  verifiedAt: string;
  confidence: GearConfidence;
  note?: string;
  /** Zatím se nikde nepoužívá — affiliate je samostatná pozdější fáze (viz zadání bod 11). Když se jednou vyplní, UI může zobrazit CTA "Zjistit cenu", ale zatím se tohle pole nikde nečte pro vykreslení odkazu. */
  affiliateUrl?: string;
  active: boolean;
};

// Zatím žádné záznamy — viz komentář nahoře.
export const creatorGear: CreatorGearItem[] = [];

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
