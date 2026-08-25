import "server-only";

// Achievementy pro How to Fish (Steam App ID 4001890) — dva veřejné
// Steam Web API endpointy:
//  - GetSchemaForGame: zdroj pravdy pro apiName -> displayName/popis/ikony
//    (vyžaduje STEAM_API_KEY, cache ~1h, mění se zřídka)
//  - GetGlobalAchievementPercentagesForApp: procenta hráčů, kteří
//    achievement získali (bez klíče, cache ~15 min, mění se častěji)
const STEAM_APP_ID = "4001890";
const SCHEMA_REVALIDATE_SECONDS = 3600;
const PERCENTAGES_REVALIDATE_SECONDS = 900;

export type SteamAchievement = {
  apiName: string;
  name: string;
  description?: string;
  iconUrl?: string;
  hidden: boolean;
  globalPercent?: number;
};

type SchemaAchievement = {
  name?: unknown;
  displayName?: unknown;
  description?: unknown;
  icon?: unknown;
  hidden?: unknown;
};

type SchemaResponse = {
  game?: {
    availableGameStats?: {
      achievements?: SchemaAchievement[];
    };
  };
};

type PercentagesResponse = {
  achievementpercentages?: {
    achievements?: { name?: unknown; percent?: unknown }[];
  };
};

async function fetchSchema(): Promise<SchemaAchievement[] | null> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    console.error("Steam achievementy: chybí STEAM_API_KEY, GetSchemaForGame nelze zavolat.");
    return null;
  }

  const url = new URL("https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("appid", STEAM_APP_ID);
  url.searchParams.set("l", "czech");

  try {
    const response = await fetch(url.toString(), { next: { revalidate: SCHEMA_REVALIDATE_SECONDS } });
    if (!response.ok) {
      console.error("Steam achievementy: GetSchemaForGame selhalo, status", response.status);
      return null;
    }
    const data = (await response.json()) as SchemaResponse;
    const achievements = data.game?.availableGameStats?.achievements;
    return Array.isArray(achievements) ? achievements : null;
  } catch (error) {
    console.error(
      "Steam achievementy: GetSchemaForGame selhalo",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

async function fetchGlobalPercentages(): Promise<Map<string, number>> {
  const url = new URL("https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/");
  url.searchParams.set("gameid", STEAM_APP_ID);

  const percentages = new Map<string, number>();
  try {
    const response = await fetch(url.toString(), { next: { revalidate: PERCENTAGES_REVALIDATE_SECONDS } });
    if (!response.ok) {
      console.error(
        "Steam achievementy: GetGlobalAchievementPercentagesForApp selhalo, status",
        response.status
      );
      return percentages;
    }
    const data = (await response.json()) as PercentagesResponse;
    for (const entry of data.achievementpercentages?.achievements ?? []) {
      if (typeof entry.name === "string" && typeof entry.percent === "string") {
        const percent = Number.parseFloat(entry.percent);
        if (Number.isFinite(percent)) percentages.set(entry.name, percent);
      }
    }
  } catch (error) {
    console.error(
      "Steam achievementy: GetGlobalAchievementPercentagesForApp selhalo",
      error instanceof Error ? error.message : error
    );
  }
  return percentages;
}

/**
 * null = Steam schema pro tuto hru není veřejně dostupná (chybí klíč,
 * chyba API nebo hra žádnou nemá) — v tom případě NIC nevymýšlíme,
 * stránka ukáže informační stav. Schema je zdroj pravdy pro čitelný
 * název/popis; bez něj by šlo zobrazit jen syrové apiName, což by bylo
 * matoucí, ne "originální název".
 */
export async function getSteamAchievements(): Promise<SteamAchievement[] | null> {
  const [schema, percentages] = await Promise.all([fetchSchema(), fetchGlobalPercentages()]);

  if (!schema || schema.length === 0) return null;

  return schema
    .filter((a): a is SchemaAchievement & { name: string } => typeof a.name === "string" && a.name.length > 0)
    .map((a) => ({
      apiName: a.name,
      name: typeof a.displayName === "string" && a.displayName.trim() ? a.displayName.trim() : a.name,
      description:
        typeof a.description === "string" && a.description.trim() ? a.description.trim() : undefined,
      iconUrl: typeof a.icon === "string" && a.icon ? a.icon : undefined,
      hidden: a.hidden === 1,
      globalPercent: percentages.get(a.name),
    }));
}
