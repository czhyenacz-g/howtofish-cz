import type { SteamAchievement } from "../../../lib/steam/achievements";

// Jednoduché binární dělení pro filtr Vše/Běžné/Vzácné — žádné jemnější
// tiery, na to nemá smysl scope komplikovat (viz zadání).
export const RARE_THRESHOLD_PERCENT = 20;

export type AchievementRarity = "common" | "rare" | "unknown";

export function getAchievementRarity(achievement: SteamAchievement): AchievementRarity {
  if (achievement.globalPercent === undefined) return "unknown";
  return achievement.globalPercent < RARE_THRESHOLD_PERCENT ? "rare" : "common";
}

// Výchozí řazení: nejvzácnější napřed (nejnižší % nejdřív) — achievementy
// bez známého procenta (globalPercent undefined) jdou na konec, ne na
// začátek, ať nepůsobí falešně "nejvzácnější".
export function sortByRarest(achievements: SteamAchievement[]): SteamAchievement[] {
  return [...achievements].sort((a, b) => {
    const ap = a.globalPercent ?? Number.POSITIVE_INFINITY;
    const bp = b.globalPercent ?? Number.POSITIVE_INFINITY;
    return ap - bp;
  });
}
