// Čistá (testovatelná, framework-free) část useCharacterCalloutOpen.ts —
// žádný React/DOM import, viz app/components/useCharacterCalloutOpen.ts
// pro samotný hook. Stejný vzor jako banner-visibility.ts.

// CharacterCallout.tsx si tímhle atributem sám označí svůj kořenový
// element, dokud je profesor/prodejce viditelně vysunutý (entering/open/
// closing) — jiné komponenty (MultiplayerIslandTab) na něj reagují, aniž
// by musely znát vnitřní stav CharacterCallout.
export const CHARACTER_CALLOUT_OPEN_SELECTOR = '[data-character-callout-open="true"]';

export function computeCalloutOpen(matchCount: number): boolean {
  return matchCount > 0;
}
