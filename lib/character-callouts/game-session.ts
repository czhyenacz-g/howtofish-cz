// Čistě in-memory (NE localStorage/sessionStorage) signál "hráč právě
// spustil minihru na /hra" — má platit jen do refreshe stránky nebo
// opuštění routy (viz zadání "nezobrazovat až do refreshe / přepnutí na
// jinou stránku"), ne trvale napříč návštěvami. CrabRushGame ho nastaví
// při startu/restartu hry a vynuluje při vlastním (re)mountu (= čerstvá
// návštěva /hra po SPA navigaci), CharacterCallout (globální singleton v
// root layoutu, nikdy neremountuje mezi routami) ho čte přes
// useSyncExternalStore a dokud hra běží, postavu (profesor/prodejce) na
// /hra vůbec nenabídne — a pokud už byla otevřená, okamžitě ji skryje.
let started = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function markGameStarted(): void {
  if (started) return;
  started = true;
  notify();
}

export function resetGameStarted(): void {
  if (!started) return;
  started = false;
  notify();
}

export function getGameStarted(): boolean {
  return started;
}

export function subscribeGameStarted(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
