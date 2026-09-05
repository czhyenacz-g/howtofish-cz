// Jeden centrální slovník pro české labely kategorií gearu (viz zadání
// bod 16) — žádné natvrdo vložené české texty v komponentách. `category`
// v CreatorGearItem zůstává volný text (viz data/creator-gear.ts),
// takže neznámá kategorie se nezobrazí rozbitá, jen beze změny (raw).
export const GEAR_CATEGORY_LABEL: Record<string, string> = {
  mouse: "Myš",
  keyboard: "Klávesnice",
  headset: "Headset",
  headphones: "Sluchátka",
  microphone: "Mikrofon",
  "microphone-arm": "Rameno na mikrofon",
  monitor: "Monitor",
  camera: "Kamera",
  "camera-lens": "Objektiv",
  "video-microphone": "Mikrofon pro video",
  "audio-interface": "Audio rozhraní",
  gpu: "Grafická karta",
  cpu: "Procesor",
  pc: "Počítač",
};

export function getGearCategoryLabel(category: string): string {
  return GEAR_CATEGORY_LABEL[category] ?? category;
}
