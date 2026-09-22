// Katalog her, ve kterých se dá rybařit — jeden zdroj dat pro veřejnou
// stránku /hry-s-rybarenim (viz app/(sections)/hry-s-rybarenim/page.tsx).
//
// Zatím jde o ručně psaný, kurátorovaný seed (žádný backend, žádný
// crawler) — stejný princip jako data/fish.ts: co tu není, to na webu
// není. Nic se nedomýšlí a nic se nenačítá odnikud zvenčí.
//
// PRAVIDLO PRO SÉRIE: v katalogu je maximálně JEDNA reprezentativní
// položka za herní sérii (viz `series`) — další tituly série se mají
// ukázat až na detailu série/hry, ne jako další karty tady.

export type GameFishingImportance = "core" | "major" | "minor" | "minigame";
export type GameCatalogStatus = "available" | "preparing" | "planned";

export type GameEntry = {
  name: string;
  slug: string;
  /** Herní série (např. "Pokémon") — undefined = samostatná hra / vlastní série. */
  series?: string;
  /**
   * Cover obrázek. Zatím záměrně u NIKOHO není — nemáme vlastní licencované
   * artworky a hotlinkovat cizí nejde (viz zadání bod 7). Karty proto
   * vykreslují jednotný stylový placeholder (app/components/GameCover.tsx);
   * jakmile bude obrázek k dispozici, stačí sem doplnit cestu.
   */
  image?: string;
  fishingImportance: GameFishingImportance;
  /** Krátké štítky na kartě (žánr / nálada / "Nostalgie"). */
  tags: string[];
  platforms: string[];
  status: GameCatalogStatus;
  /** Má hra na webu vlastní obsah, na který se dá odkázat? (viz `detailHref`) */
  hasDetail: boolean;
  /** Vyznačená redakční volba — na kartě se zobrazí jako "Tip". */
  isFeatured: boolean;
  /** Interní odkaz na existující obsah webu. Jen když `hasDetail` — karta bez detailu nikdy neodkazuje (žádné 404). */
  detailHref?: string;

  // --- Připraveno pro budoucí rozšíření (zatím se NIKDE nepoužívá) ---
  // Zadání: struktura má jít rozšířit o tyhle údaje, ale funkce (Twitch/
  // YouTube/Kick monitoring, hledání, související hry) se teď neimplementují.
  aliases?: string[];
  searchKeywords?: string[];
  twitchCategory?: string;
  youtubeSearch?: string;
  kickSearch?: string;
  relatedGames?: string[];
};

/** České labely pro `fishingImportance` — jediné místo, kde se mapují (karta + filtr). */
export const FISHING_IMPORTANCE_LABEL: Record<GameFishingImportance, string> = {
  core: "Fishing core",
  major: "Výrazné rybaření",
  minor: "Rybaření navíc",
  minigame: "Fishing minihra",
};

/** České labely stavu karty — "Brzy" je záměrně měkčí než "Připravujeme". */
export const GAME_STATUS_LABEL: Record<GameCatalogStatus, string> = {
  available: "Máme obsah",
  preparing: "Připravujeme",
  planned: "Brzy",
};

/** Pořadí stavů v gridu (available → preparing → planned), ne ranking kvality. */
export const GAME_STATUS_ORDER: GameCatalogStatus[] = ["available", "preparing", "planned"];

/** Pořadí důležitosti rybaření (core → minigame) — používá se pro řazení sekcí. */
export const FISHING_IMPORTANCE_ORDER: GameFishingImportance[] = ["core", "major", "minor", "minigame"];

function game(
  name: string,
  slug: string,
  fishingImportance: GameFishingImportance,
  tags: string[],
  platforms: string[],
  extra: Partial<GameEntry> = {}
): GameEntry {
  return {
    name,
    slug,
    fishingImportance,
    tags,
    platforms,
    status: "planned",
    hasDetail: false,
    isFeatured: false,
    ...extra,
  };
}

export const gameEntries: GameEntry[] = [
  // --- 1–10 -------------------------------------------------------------
  game("Minecraft", "minecraft", "minor", ["Survival", "Sandbox", "Nostalgie"], ["PC", "Switch", "PlayStation", "Xbox", "Mobil"], {
    isFeatured: true,
  }),
  game("Stardew Valley", "stardew-valley", "major", ["Cozy", "Farming", "RPG"], ["PC", "Switch", "PlayStation", "Xbox", "Mobil"]),
  game("Red Dead Redemption 2", "red-dead-redemption-2", "major", ["Open world", "Akční", "Western"], ["PC", "PlayStation", "Xbox"], {
    series: "Red Dead Redemption",
  }),
  game("Animal Crossing: New Horizons", "animal-crossing-new-horizons", "major", ["Cozy", "Life sim"], ["Switch"], {
    series: "Animal Crossing",
  }),
  game("Pokémon Brilliant Diamond / Shining Pearl", "pokemon-brilliant-diamond-shining-pearl", "minigame", ["Nostalgie", "RPG"], ["Switch"], {
    series: "Pokémon",
  }),
  game("Terraria", "terraria", "major", ["Sandbox", "Survival", "RPG"], ["PC", "Switch", "PlayStation", "Xbox", "Mobil"]),
  game("Sea of Thieves", "sea-of-thieves", "major", ["Pirátství", "Open world", "Co-op"], ["PC", "PlayStation", "Xbox"], {
    isFeatured: true,
  }),
  game("Final Fantasy XIV", "final-fantasy-xiv", "major", ["MMO", "RPG"], ["PC", "PlayStation", "Xbox"], { series: "Final Fantasy" }),
  game("World of Warcraft", "world-of-warcraft", "major", ["MMO", "RPG", "Nostalgie"], ["PC"]),
  game("Old School RuneScape", "old-school-runescape", "major", ["MMO", "RPG", "Nostalgie"], ["PC", "Mobil"]),

  // --- 11–20 ------------------------------------------------------------
  game("Fortnite", "fortnite", "minigame", ["Battle royale", "Akční"], ["PC", "Switch", "PlayStation", "Xbox", "Mobil"]),
  game("Genshin Impact", "genshin-impact", "major", ["Open world", "RPG", "Gacha"], ["PC", "PlayStation", "Mobil"]),
  game("The Elder Scrolls V: Skyrim", "skyrim", "minor", ["RPG", "Open world", "Nostalgie"], ["PC", "Switch", "PlayStation", "Xbox"], {
    series: "The Elder Scrolls",
  }),
  game("Fallout 76", "fallout-76", "minor", ["Survival", "RPG", "Online"], ["PC", "PlayStation", "Xbox"], { series: "Fallout" }),
  game("No Man's Sky", "no-mans-sky", "major", ["Vesmír", "Survival", "Open world"], ["PC", "Switch", "PlayStation", "Xbox"]),
  game("Valheim", "valheim", "major", ["Survival", "Vikingové", "Co-op"], ["PC", "Xbox"]),
  game("Rust", "rust", "minor", ["Survival", "PvP"], ["PC", "PlayStation", "Xbox"]),
  game("Palia", "palia", "major", ["Cozy", "MMO", "Life sim"], ["PC", "Switch"]),
  game("Black Desert Online", "black-desert-online", "major", ["MMO", "RPG", "Life skills"], ["PC", "PlayStation", "Xbox"]),
  game("Guild Wars 2", "guild-wars-2", "major", ["MMO", "RPG"], ["PC"]),

  // --- 21–30 ------------------------------------------------------------
  game("The Elder Scrolls Online", "the-elder-scrolls-online", "major", ["MMO", "RPG"], ["PC", "PlayStation", "Xbox"], { series: "The Elder Scrolls" }),
  game("New World", "new-world", "major", ["MMO", "RPG", "Survival"], ["PC"]),
  game("Final Fantasy XV", "final-fantasy-xv", "major", ["RPG", "Open world", "Nostalgie"], ["PC", "PlayStation", "Xbox"], { series: "Final Fantasy" }),
  game("Monster Hunter: World", "monster-hunter-world", "minor", ["Akční", "RPG", "Co-op"], ["PC", "PlayStation", "Xbox"], { series: "Monster Hunter" }),
  game("Persona 5 Royal", "persona-5-royal", "minigame", ["JRPG", "Nostalgie"], ["PC", "Switch", "PlayStation", "Xbox"], { series: "Persona" }),
  game("NieR: Automata", "nier-automata", "minigame", ["Akční", "JRPG"], ["PC", "Switch", "PlayStation", "Xbox"]),
  game("Yakuza 0", "yakuza-0", "minigame", ["Akční", "Nostalgie"], ["PC", "PlayStation", "Xbox"], { series: "Yakuza / Like a Dragon" }),
  game("The Legend of Zelda: Ocarina of Time", "zelda-ocarina-of-time", "minigame", ["Nostalgie", "Dobrodružství"], ["Switch", "Nintendo 64"], {
    series: "The Legend of Zelda",
  }),
  game("Sonic Frontiers", "sonic-frontiers", "minigame", ["Akční", "Open world"], ["PC", "Switch", "PlayStation", "Xbox"], { series: "Sonic" }),
  game("Hades", "hades", "minigame", ["Roguelike", "Akční"], ["PC", "Switch", "PlayStation", "Xbox"]),

  // --- 31–40 ------------------------------------------------------------
  game("Fire Emblem: Three Houses", "fire-emblem-three-houses", "minigame", ["Tahová strategie", "JRPG"], ["Switch"], { series: "Fire Emblem" }),
  game("The Sims 4", "the-sims-4", "minor", ["Life sim", "Stavění"], ["PC", "PlayStation", "Xbox"], { series: "The Sims" }),
  game("Disney Dreamlight Valley", "disney-dreamlight-valley", "major", ["Cozy", "Life sim"], ["PC", "Switch", "PlayStation", "Xbox"]),
  game("Don't Starve Together", "dont-starve-together", "minor", ["Survival", "Co-op", "Roguelike"], ["PC", "Switch", "PlayStation", "Xbox"]),
  game("Raft", "raft", "major", ["Survival", "Co-op", "Oceán"], ["PC"]),
  game("Core Keeper", "core-keeper", "major", ["Survival", "Sandbox", "Co-op"], ["PC", "Switch", "PlayStation", "Xbox"]),
  game("Coral Island", "coral-island", "major", ["Cozy", "Farming", "Life sim"], ["PC", "Switch", "PlayStation", "Xbox"]),
  game("Dinkum", "dinkum", "major", ["Cozy", "Survival", "Stavění"], ["PC", "Switch"]),
  game("Spiritfarer", "spiritfarer", "minigame", ["Cozy", "Příběhové"], ["PC", "Switch", "PlayStation", "Xbox"]),
  game("Cult of the Lamb", "cult-of-the-lamb", "minigame", ["Roguelike", "Cozy"], ["PC", "Switch", "PlayStation", "Xbox"]),

  // --- 41–50 ------------------------------------------------------------
  game("DREDGE", "dredge", "core", ["Horor", "Cozy", "Oceán"], ["PC", "Switch", "PlayStation", "Xbox"], {
    status: "preparing",
    isFeatured: true,
  }),
  game("Dave the Diver", "dave-the-diver", "core", ["Dobrodružství", "Cozy", "Oceán"], ["PC", "Switch", "PlayStation"], { status: "preparing" }),
  game("Fishing Planet", "fishing-planet", "core", ["Simulátor", "Free to play"], ["PC", "PlayStation", "Xbox", "Mobil"], { status: "preparing" }),
  game("Russian Fishing 4", "russian-fishing-4", "core", ["Simulátor", "Free to play"], ["PC"], { status: "preparing" }),
  game("Call of the Wild: The Angler", "call-of-the-wild-the-angler", "core", ["Simulátor", "Open world"], ["PC", "PlayStation", "Xbox"], {
    status: "preparing",
  }),
  game("WEBFISHING", "webfishing", "core", ["Cozy", "Multiplayer", "Indie"], ["PC"], { status: "preparing", isFeatured: true }),
  // Naše domovská hra — jediná, ke které na webu reálně máme obsah
  // (encyklopedie úlovků na /ryby). Proto jako jediná `available` a
  // s interním odkazem; všechny ostatní karty jsou zatím neklikací.
  game("How to Fish", "how-to-fish", "core", ["Cozy", "Indie", "Multiplayer"], ["PC"], {
    status: "available",
    hasDetail: true,
    detailHref: "/ryby",
    isFeatured: true,
  }),
  game("Sun Haven", "sun-haven", "major", ["Cozy", "Farming", "RPG"], ["PC", "Switch"]),
  game("Story of Seasons: Friends of Mineral Town", "story-of-seasons-friends-of-mineral-town", "major", ["Cozy", "Farming", "Nostalgie"], ["PC", "Switch", "PlayStation", "Xbox"], {
    series: "Story of Seasons / Harvest Moon",
  }),
  game("Graveyard Keeper", "graveyard-keeper", "minor", ["Simulátor", "Černý humor"], ["PC", "Switch", "PlayStation", "Xbox"]),
];

const STATUS_RANK: Record<GameCatalogStatus, number> = { available: 0, preparing: 1, planned: 2 };

/**
 * Katalog v pořadí pro vykreslení: nejdřív hry, kde máme/už brzy budeme mít
 * obsah, jinak zůstává pořadí seedu (seed NENÍ ranking kvality — viz zadání).
 */
export function getOrderedGames(): GameEntry[] {
  return gameEntries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => STATUS_RANK[a.entry.status] - STATUS_RANK[b.entry.status] || a.index - b.index)
    .map(({ entry }) => entry);
}

/** Jen hry se skutečně existujícím interním odkazem — používá se pro JSON-LD. */
export function getGamesWithDetail(): GameEntry[] {
  return gameEntries.filter((g) => g.hasDetail && g.detailHref);
}
