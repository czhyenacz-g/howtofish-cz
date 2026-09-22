// Čistá logika výběru videí pro homepage — bez DB a bez server-only
// importů, takže se dá testovat samostatně. Vlastní dotaz do DB zůstává
// v lib/games/game-videos.ts (getHomepageGameVideos).

/** Kolik videí se zobrazuje v homepage sekci „Rybářská videa ze světa her“. */
export const HOMEPAGE_GAME_VIDEOS_LIMIT = 6;

/**
 * Vybere videa s diverzitou mezi hrami: nejdřív jedno od každé hry, a
 * teprve když je her málo, doplní druhé video od stejné hry. Pořadí
 * vstupu (seřazeného podle kvality) se zachovává, takže nejlepší videa
 * zůstávají první.
 */
export function selectDiverseVideos<T extends { gameSlug: string }>(videos: T[], limit: number): T[] {
  const picked: T[] = [];
  const perGame = new Map<string, number>();

  // 1. kolo — max 1 video na hru
  for (const video of videos) {
    if (picked.length >= limit) break;
    if (perGame.has(video.gameSlug)) continue;
    perGame.set(video.gameSlug, 1);
    picked.push(video);
  }

  // 2. kolo — doplnění druhým videem, pokud her není dost
  if (picked.length < limit) {
    for (const video of videos) {
      if (picked.length >= limit) break;
      if (picked.includes(video)) continue;
      if ((perGame.get(video.gameSlug) ?? 0) >= 2) continue;
      perGame.set(video.gameSlug, (perGame.get(video.gameSlug) ?? 0) + 1);
      picked.push(video);
    }
  }

  return picked;
}
