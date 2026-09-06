import type { PublicGearConfidence } from "../../data/creator-gear.ts";

// Jeden centrální slovník pro badge label + tooltip text podle
// confidence úrovně (viz zadání bod 2) — žádná duplikovaná/nekonzistentní
// formulace napříč komponentami. Text je vždy transparentní o tom, jak
// jisté je, že položku streamer skutečně používá — u "estimated" nikdy
// netvrdí, že jde o potvrzený setup (zadání bod 3, hard rule).
export const GEAR_CONFIDENCE_LABEL: Record<PublicGearConfidence, string> = {
  verified: "Ověřeno",
  historical: "Historické",
  estimated: "Odhad",
};

export const GEAR_CONFIDENCE_TOOLTIP: Record<PublicGearConfidence, string> = {
  verified: "Tento model je doložen veřejně dostupným zdrojem.",
  historical: "Tento model streamer veřejně uváděl v dřívějším setupu. Dnes už může používat jinou techniku.",
  estimated:
    "Přesný model se nám nepodařilo veřejně ověřit. Jde o orientační produkt odpovídající typu streamování, nikoli potvrzenou součást setupu.",
};

export function getGearConfidenceLabel(confidence: PublicGearConfidence): string {
  return GEAR_CONFIDENCE_LABEL[confidence];
}

export function getGearConfidenceTooltip(confidence: PublicGearConfidence): string {
  return GEAR_CONFIDENCE_TOOLTIP[confidence];
}
