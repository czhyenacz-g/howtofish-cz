// Připravená (zatím prázdná) datová struktura pro budoucí brand
// partnerships / branded products (viz zadání bod 12) — schválně
// ODDĚLENÁ od CreatorGearItem (data/creator-gear.ts), ať se "co streamer
// reálně používá" nikdy neplete s "s čím má obchodní spolupráci".
// Prázdná ze stejného důvodu, proč byl creator-gear.ts dřív prázdný: bez
// uloženého dohledatelného sourceUrl pro konkrétní spolupráci (TIGO,
// MADMONQ, Smarty, ...) nejde nic vymyslet ani veřejně publikovat — až
// se najde ověřený zdroj, přidá se sem ručně. Zatím se NIKDE veřejně
// nevykresluje (primární cíl této fáze je gear + affiliate).
export type CreatorCollaborationType = "brand-partnership" | "branded-product" | "creator-edition";

export type CreatorCollaboration = {
  creatorSlug: string;
  brand: string;
  productName?: string;
  url?: string;
  /** Konkrétní doložený zdroj spolupráce — POVINNÉ, stejně jako u CreatorGearItem. */
  sourceUrl: string;
  type: CreatorCollaborationType;
  active: boolean;
};

// Zatím žádné záznamy — viz komentář nahoře.
export const creatorCollaborations: CreatorCollaboration[] = [];
