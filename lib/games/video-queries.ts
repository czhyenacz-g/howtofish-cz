import type { GameEntry } from "../../data/games.ts";

// Kurátorované YouTube dotazy pro pilotní hry (POC, viz zadání bod 2).
//
// Záměrně je NEGENERUJEME jako aliases × searchKeywords — pro každou hru
// je jen omezený počet (max 5) ručně vybraných dotazů, které míří na
// rybaření. Vycházejí z dat v data/games.ts (aliases/searchKeywords),
// ale jsou to vlastní, kontrolované query.
//
// Hry bez záznamu tady discovery vůbec nespouští — cílem POC je ověřit
// kvalitu na 4 pilotních hrách, ne pokrýt všech 50 her.

export const MAX_QUERIES_PER_GAME = 5;

const CURATED_QUERIES: Record<string, string[]> = {
  minecraft: [
    "Minecraft fishing",
    "Minecraft fishing guide",
    "Minecraft fishing challenge",
    "Minecraft AFK fishing",
    "Minecraft Luck of the Sea",
  ],
  "stardew-valley": [
    "Stardew Valley fishing",
    "Stardew fishing guide",
    "Stardew legendary fish",
    "Stardew fishing challenge",
    "Stardew best fishing spots",
  ],
  "pokemon-brilliant-diamond-shining-pearl": [
    "Pokemon fishing",
    "Pokemon Old Rod",
    "Pokemon Super Rod",
    "Pokemon fishing challenge",
    "Pokemon Magikarp fishing",
  ],
  "sea-of-thieves": [
    "Sea of Thieves fishing",
    "Sea of Thieves Hunter's Call",
    "Sea of Thieves rare fish",
    "Sea of Thieves trophy fish",
    "Sea of Thieves fishing guide",
  ],

  // --- Druhá vlna (10 her, 2026-09-22) — záměrně 3 dotazy na hru kvůli
  // kvótě (search.list = 100 jednotek/volání). Terminologie vychází
  // z herních mechanik (Fisher job, Gone Fission, Aquarius, Angler quests,
  // spear fishing), ne z obecných „fishing“ frází.
  "final-fantasy-xiv": ["FFXIV fishing", "FFXIV ocean fishing", "FFXIV fisher guide"],
  "world-of-warcraft": ["WoW fishing", "World of Warcraft fishing guide", "WoW rare fish"],
  "old-school-runescape": ["OSRS fishing", "OSRS fishing guide", "OSRS fishing money making"],
  "fallout-76": ["Fallout 76 fishing", "Fallout 76 fishing guide", "Fallout 76 Gone Fission fishing"],
  palia: ["Palia fishing", "Palia fishing guide", "Palia rare fish"],
  terraria: ["Terraria fishing", "Terraria fishing guide", "Terraria Angler quests"],
  "no-mans-sky": ["No Man's Sky fishing", "No Man's Sky Aquarius fishing", "No Man's Sky fishing guide"],
  warframe: ["Warframe fishing", "Warframe spear fishing", "Warframe fishing guide"],
  dredge: ["DREDGE fishing", "DREDGE rare fish", "DREDGE fishing guide"],
  "fishing-planet": ["Fishing Planet", "Fishing Planet guide", "Fishing Planet tips"],
};

/** Dotazy pro hru — prázdné pole znamená „tuhle hru zatím nesledujeme“. */
export function getVideoQueriesForGame(game: Pick<GameEntry, "slug">): string[] {
  return (CURATED_QUERIES[game.slug] ?? []).slice(0, MAX_QUERIES_PER_GAME);
}

/** Má hra kurátorované dotazy (tj. bude součástí discovery runu)? */
export function hasVideoQueries(game: Pick<GameEntry, "slug">): boolean {
  return getVideoQueriesForGame(game).length > 0;
}

/** Slugy her, pro které umíme spustit discovery — používá to CLI i testy. */
export function getGamesWithVideoQueries(): string[] {
  return Object.keys(CURATED_QUERIES);
}

// Kurátorované NEGATIVNÍ fráze pro konkrétní hru — výhradně tam, kde audit
// kandidátů reálně našel false positives (IRL rybaření pod herní značkou,
// sběratelské kartičky apod.). Záměrně per-game, ne globální blacklist:
// „rod“ je u Pokémonů legitimní (Old/Good/Super Rod), „lure“ je tam ale
// jen reálná návnada — zatímco v Minecraftu je Lure platný enchant.
const CURATED_NEGATIVE_TERMS: Record<string, string[]> = {
  "pokemon-brilliant-diamond-shining-pearl": [
    "fishing lure",
    "pokemon lure",
    "pikachu lure",
    "lure challenge",
    "topwater",
    "tcg",
    "pokemontcg",
    "trading card",
    "booster",
    "unboxing",
  ],
};

export function getCuratedNegativeTerms(game: Pick<GameEntry, "slug">): string[] {
  return CURATED_NEGATIVE_TERMS[game.slug] ?? [];
}
