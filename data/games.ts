// Katalog her, ve kterých se dá rybařit — jeden zdroj dat pro veřejnou
// stránku /hry-s-rybarenim (viz app/(sections)/hry-s-rybarenim/page.tsx).
//
// Zatím jde o ručně psaný, kurátorovaný seed (žádný backend, žádný
// crawler) — stejný princip jako data/fish.ts: co tu není, to na webu
// není. Nic se nedomýšlí a nic se nenačítá odnikud zvenčí.
//
// PRAVIDLO PRO SÉRIE: v katalogu je maximálně JEDNA reprezentativní
// položka za herní sérii (viz `series`) — další díly série patří do
// `relatedGames` a na veřejnou kartu se dostanou až s vlastním detailem.
//
// MONITORING (připraveno, ZATÍM SE NIKDE NEPOUŽÍVÁ): `aliases`,
// `searchKeywords`, `relatedGames`, `audienceType` a `monitoringPriority`
// jsou data pro budoucí fázi (detail hry + hledání obsahu na YouTube/
// Twitchi/Kicku). Žádný crawler ani API volání k tomu teď není.

export type GameFishingImportance = "core" | "major" | "minor" | "minigame";
export type GameCatalogStatus = "available" | "preparing" | "planned";
/** Pro koho je hra atraktivní — určuje badge na kartě. */
export type GameAudienceType = "current" | "evergreen" | "nostalgia" | "fishing-core";
/** Jak moc má smysl hru později sledovat (YouTube/Twitch/Kick obsah) — zatím jen data. */
export type GameMonitoringPriority = "high" | "medium" | "low";

export type GameEntry = {
  name: string;
  slug: string;
  /** Herní série (např. "Pokémon") — undefined = samostatná hra / vlastní série. */
  series?: string;
  /**
   * Cover obrázek — cesta k našemu vlastnímu assetu v `public/images/games/`
   * (např. `/images/games/minecraft.webp`). Vyplněný jen tam, kde vlastní
   * artwork existuje; hry bez něj vykreslují stylový placeholder
   * (app/components/GameCover.tsx). Nikdy sem nepatří hotlink na cizí CDN
   * (Steam/IGDB/wiki) — viz zadání.
   */
  image?: string;
  fishingImportance: GameFishingImportance;
  /** Krátké štítky na kartě (žánr / nálada). */
  tags: string[];
  platforms: string[];
  status: GameCatalogStatus;
  /** Má hra na webu vlastní obsah, na který se dá odkázat? (viz `detailHref`) */
  hasDetail: boolean;
  /** Vyznačená redakční volba — zvýrazní rámeček karty (viz GameCard). */
  isFeatured: boolean;
  /** Interní odkaz na existující obsah webu. Jen když `hasDetail` — karta bez detailu nikdy neodkazuje (žádné 404). */
  detailHref?: string;
  /** Pro koho je hra atraktivní (badge na kartě). */
  audienceType: GameAudienceType;
  /** Priorita pro budoucí monitoring obsahu. Zatím se nikde nevykresluje. */
  monitoringPriority: GameMonitoringPriority;

  // --- Metadata pro budoucí fázi (detail hry + monitoring) ---------------
  // Plně vyplněné u PILOT_GAME_SLUGS; u ostatních her se doplňují až
  // s jejich detailem (nevymýšlíme hromadně klíčová slova pro 48 her).
  /** Jiné zápisy názvu, pod kterými hru lidé hledají (bez diakritiky, zkratky). */
  aliases?: string[];
  /** Konkrétní výrazy pro budoucí hledání obsahu (fishing mechaniky hry). */
  searchKeywords?: string[];
  /** Další hry ze stejné série / úzce související — ZATÍM bez vlastních karet a rout. */
  relatedGames?: string[];
  /**
   * Krátké nostalgické citáty pro hero detailu hry (`/games/[slug]`).
   * Mají být krátké, herní a bez faktických tvrzení, která nejdou ověřit
   * — vyplněné jen u pilotních her, ne hromadně u všech.
   */
  quotes?: string[];
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

/** Labely publika — badge na kartě (viz zadání bod 8). */
export const AUDIENCE_TYPE_LABEL: Record<GameAudienceType, string> = {
  current: "Aktivní komunita",
  evergreen: "Evergreen",
  nostalgia: "Nostalgie",
  "fishing-core": "Fishing core",
};

/** Labely priority pro interní použití v další fázi (nikde veřejně). */
export const MONITORING_PRIORITY_LABEL: Record<GameMonitoringPriority, string> = {
  high: "Vysoká priorita",
  medium: "Střední priorita",
  low: "Nízká priorita",
};

/** Pořadí stavů v gridu (available → preparing → planned), ne ranking kvality. */
export const GAME_STATUS_ORDER: GameCatalogStatus[] = ["available", "preparing", "planned"];

/** Pořadí důležitosti rybaření (core → minigame). */
export const FISHING_IMPORTANCE_ORDER: GameFishingImportance[] = ["core", "major", "minor", "minigame"];

/**
 * Pět pilotních her pro další fázi (vlastní detail + monitoring) — viz
 * zadání bod 4. U nich je metadata vyplněná kompletně (aliases,
 * searchKeywords, relatedGames) a počítá se s nimi při rozhodování, co
 * dostane detail jako první.
 */
export const PILOT_GAME_SLUGS = [
  "minecraft",
  "stardew-valley",
  "pokemon-brilliant-diamond-shining-pearl",
  "sea-of-thieves",
  "how-to-fish",
] as const;

function game(
  name: string,
  slug: string,
  fishingImportance: GameFishingImportance,
  tags: string[],
  platforms: string[],
  audienceType: GameAudienceType,
  monitoringPriority: GameMonitoringPriority,
  extra: Partial<GameEntry> = {}
): GameEntry {
  return {
    name,
    slug,
    fishingImportance,
    tags,
    platforms,
    audienceType,
    monitoringPriority,
    status: "planned",
    hasDetail: false,
    isFeatured: false,
    ...extra,
  };
}

export const gameEntries: GameEntry[] = [
  // --- 1–10 -------------------------------------------------------------
  game("Minecraft", "minecraft", "minor", ["Survival", "Sandbox", "Nostalgie"], ["PC", "Switch", "PlayStation", "Xbox", "Mobil"], "evergreen", "high", {
    series: "Minecraft",
    isFeatured: true,
    hasDetail: true,
    detailHref: "/games/minecraft",
    image: "/images/games/minecraft.webp",
    quotes: ["Chtěl jsem jen rybu. Vytáhl jsem enchanted book."],
    aliases: ["Minecraft", "Minecraft Java", "Minecraft Bedrock", "Minecraft: Java Edition", "Minecraft: Bedrock Edition"],
    searchKeywords: ["fishing", "fishing rod", "AFK fishing", "treasure fishing", "Luck of the Sea", "Lure", "fishing challenge"],
    relatedGames: ["Minecraft: Dungeons", "Minecraft Legends"],
  }),
  game("Stardew Valley", "stardew-valley", "major", ["Cozy", "Farming", "RPG"], ["PC", "Switch", "PlayStation", "Xbox", "Mobil"], "evergreen", "high", {
    series: "Stardew Valley",
    hasDetail: true,
    detailHref: "/games/stardew-valley",
    image: "/images/games/stardew-valley.webp",
    quotes: ["Šel jsem pro jednu rybu. Zůstal jsem tam mnohem déle."],
    aliases: ["Stardew Valley", "Stardew"],
    searchKeywords: ["fishing", "legendary fish", "fishing guide", "fishing level", "fish pond", "best fishing spot", "fishing challenge"],
    relatedGames: ["Haunted Chocolatier", "Graveyard Keeper"],
  }),
  game("Red Dead Redemption 2", "red-dead-redemption-2", "major", ["Open world", "Akční", "Western"], ["PC", "PlayStation", "Xbox"], "evergreen", "medium", {
    series: "Red Dead Redemption",
    relatedGames: ["Red Dead Redemption", "Red Dead Online"],
  }),
  game("Animal Crossing: New Horizons", "animal-crossing-new-horizons", "major", ["Cozy", "Life sim"], ["Switch"], "evergreen", "medium", {
    series: "Animal Crossing",
    relatedGames: ["Animal Crossing: New Leaf", "Animal Crossing: Wild World", "Animal Crossing: City Folk"],
  }),
  game("Pokémon Brilliant Diamond / Shining Pearl", "pokemon-brilliant-diamond-shining-pearl", "minigame", ["Nostalgie", "RPG"], ["Switch"], "nostalgia", "high", {
    series: "Pokémon",
    hasDetail: true,
    detailHref: "/games/pokemon-brilliant-diamond-shining-pearl",
    image: "/images/games/pokemon-brilliant-diamond-shining-pearl.webp",
    quotes: ["Old Rod a Magikarp. Na některé věci se nezapomíná."],
    aliases: [
      "Pokemon",
      "Pokémon",
      "Pokemon Brilliant Diamond",
      "Pokemon Shining Pearl",
      "BDSP",
      "Brilliant Diamond",
      "Shining Pearl",
    ],
    searchKeywords: [
      "fishing",
      "Old Rod",
      "Good Rod",
      "Super Rod",
      "Magikarp",
      "fishing Pokemon",
      "Pokemon fishing challenge",
    ],
    relatedGames: [
      "Pokémon Red / Blue / Yellow",
      "Pokémon Gold / Silver / Crystal",
      "Pokémon Ruby / Sapphire / Emerald",
      "Pokémon Diamond / Pearl / Platinum",
      "Pokémon HeartGold / SoulSilver",
      "Pokémon Sword / Shield",
    ],
  }),
  game("Terraria", "terraria", "major", ["Sandbox", "Survival", "RPG"], ["PC", "Switch", "PlayStation", "Xbox", "Mobil"], "evergreen", "medium", {
    hasDetail: true,
    detailHref: "/games/terraria",
    image: "/images/games/terraria.webp",
    searchKeywords: ["fishing", "Angler quests", "fishing power", "bait", "fishing guide"],
  }),
  game("Sea of Thieves", "sea-of-thieves", "major", ["Pirátství", "Open world", "Co-op"], ["PC", "PlayStation", "Xbox"], "current", "high", {
    series: "Sea of Thieves",
    isFeatured: true,
    hasDetail: true,
    detailHref: "/games/sea-of-thieves",
    image: "/images/games/sea-of-thieves.webp",
    quotes: ["Vypluli jsme za pokladem a stejně jsem skončil s prutem u Hunter's Callu."],
    aliases: ["Sea of Thieves", "SoT"],
    searchKeywords: ["fishing", "Hunter's Call", "rare fish", "trophy fish", "fishing guide", "fishing challenge"],
  }),
  // Final Fantasy zastupuje v katalogu jediná karta — FF XIV. Fisher je
  // samostatný gathering job s vlastními úrovněmi, úlovky a komunitou,
  // takže je pro tenhle web (i budoucí monitoring) vhodnější než
  // single-player díly; FF XV je proto jen v relatedGames.
  game("Final Fantasy XIV", "final-fantasy-xiv", "major", ["MMO", "RPG"], ["PC", "PlayStation", "Xbox"], "current", "high", {
    series: "Final Fantasy",
    hasDetail: true,
    detailHref: "/games/final-fantasy-xiv",
    image: "/images/games/final-fantasy-xiv.webp",
    aliases: ["Final Fantasy XIV", "FFXIV", "FF14", "Final Fantasy 14"],
    searchKeywords: ["fishing", "Fisher job", "Ocean Fishing", "Big Fish", "fishing guide"],
    relatedGames: ["Final Fantasy XV", "Final Fantasy XI", "Final Fantasy VII Remake"],
  }),
  game("World of Warcraft", "world-of-warcraft", "major", ["MMO", "RPG", "Nostalgie"], ["PC"], "current", "high", {
    hasDetail: true,
    detailHref: "/games/world-of-warcraft",
    image: "/images/games/world-of-warcraft.webp",
    aliases: ["World of Warcraft", "WoW", "Warcraft"],
    searchKeywords: ["fishing", "fishing profession", "Angler", "rare fish", "fishing guide"],
  }),
  game("Old School RuneScape", "old-school-runescape", "major", ["MMO", "RPG", "Nostalgie"], ["PC", "Mobil"], "evergreen", "medium", {
    hasDetail: true,
    detailHref: "/games/old-school-runescape",
    image: "/images/games/old-school-runescape.webp",
    aliases: ["Old School RuneScape", "OSRS", "RuneScape"],
    searchKeywords: ["fishing", "fishing skill", "fishing level", "money making", "fishing guide"],
  }),

  // --- 11–20 ------------------------------------------------------------
  game("Fortnite", "fortnite", "minigame", ["Battle royale", "Akční"], ["PC", "Switch", "PlayStation", "Xbox", "Mobil"], "current", "high"),
  game("Genshin Impact", "genshin-impact", "major", ["Open world", "RPG", "Gacha"], ["PC", "PlayStation", "Mobil"], "current", "high"),
  // The Elder Scrolls zastupuje Skyrim (nejznámější díl série), ESO je
  // v relatedGames — viz pravidlo "max 1 karta na sérii". Pozn.: ve
  // Skyrimu je rybaření jen součástí Anniversary Edition (Creation
  // "Fishing", 2021) a jen na vyhrazených místech, proto "minor".
  game("The Elder Scrolls V: Skyrim", "skyrim", "minor", ["RPG", "Open world", "Nostalgie"], ["PC", "Switch", "PlayStation", "Xbox"], "evergreen", "medium", {
    series: "The Elder Scrolls",
    relatedGames: [
      "The Elder Scrolls Online",
      "The Elder Scrolls IV: Oblivion",
      "The Elder Scrolls III: Morrowind",
    ],
  }),
  // Pozn.: rybaření přibylo v aktualizaci "Gone Fission" (3. 6. 2025) —
  // 30+ druhů ryb, prut a rybářské výzvy, proto "major" a vysoká priorita.
  game("Fallout 76", "fallout-76", "major", ["Survival", "RPG", "Online"], ["PC", "PlayStation", "Xbox"], "current", "high", {
    series: "Fallout",
    hasDetail: true,
    detailHref: "/games/fallout-76",
    image: "/images/games/fallout-76.webp",
    relatedGames: ["Fallout 4", "Fallout: New Vegas", "Fallout 3"],
    aliases: ["Fallout 76", "FO76"],
    searchKeywords: ["fishing", "Gone Fission", "fishing rod", "fish challenge", "fishing guide"],
  }),
  game("No Man's Sky", "no-mans-sky", "major", ["Vesmír", "Survival", "Open world"], ["PC", "Switch", "PlayStation", "Xbox"], "evergreen", "high", {
    aliases: ["No Man's Sky", "NMS"],
    searchKeywords: ["fishing", "Aquarius", "fishing skiff", "fishing guide"],
  }),
  game("Valheim", "valheim", "major", ["Survival", "Vikingové", "Co-op"], ["PC", "Xbox"], "evergreen", "medium"),
  game("Rust", "rust", "minor", ["Survival", "PvP"], ["PC", "PlayStation", "Xbox"], "current", "medium"),
  game("Palia", "palia", "major", ["Cozy", "MMO", "Life sim"], ["PC", "Switch"], "current", "high", {
    hasDetail: true,
    detailHref: "/games/palia",
    image: "/images/games/palia.webp",
    searchKeywords: ["fishing", "rare fish", "fishing locations", "fishing guide"],
  }),
  game("Black Desert Online", "black-desert-online", "major", ["MMO", "RPG", "Life skills"], ["PC", "PlayStation", "Xbox"], "current", "medium"),
  game("Guild Wars 2", "guild-wars-2", "major", ["MMO", "RPG"], ["PC"], "evergreen", "medium"),
  game("New World", "new-world", "major", ["MMO", "RPG", "Survival"], ["PC"], "evergreen", "medium"),

  // --- 21–30 ------------------------------------------------------------
  game("Monster Hunter: World", "monster-hunter-world", "minor", ["Akční", "RPG", "Co-op"], ["PC", "PlayStation", "Xbox"], "evergreen", "medium", {
    series: "Monster Hunter",
    relatedGames: ["Monster Hunter Rise", "Monster Hunter Wilds"],
  }),
  game("Persona 5 Royal", "persona-5-royal", "minigame", ["JRPG", "Nostalgie"], ["PC", "Switch", "PlayStation", "Xbox"], "evergreen", "medium", {
    series: "Persona",
    relatedGames: ["Persona 3 Reload", "Persona 4 Golden"],
  }),
  game("NieR: Automata", "nier-automata", "minigame", ["Akční", "JRPG"], ["PC", "Switch", "PlayStation", "Xbox"], "evergreen", "low"),
  game("Yakuza 0", "yakuza-0", "minigame", ["Akční", "Nostalgie"], ["PC", "PlayStation", "Xbox"], "nostalgia", "low", {
    series: "Yakuza / Like a Dragon",
    relatedGames: ["Yakuza: Like a Dragon", "Like a Dragon: Infinite Wealth", "Judgment"],
  }),
  game("The Legend of Zelda: Ocarina of Time", "zelda-ocarina-of-time", "minigame", ["Nostalgie", "Dobrodružství"], ["Switch", "Nintendo 64"], "nostalgia", "low", {
    series: "The Legend of Zelda",
    relatedGames: [
      "The Legend of Zelda: Twilight Princess",
      "The Legend of Zelda: Link's Awakening",
      "The Legend of Zelda: Phantom Hourglass",
    ],
  }),
  game("Sonic Frontiers", "sonic-frontiers", "minigame", ["Akční", "Open world"], ["PC", "Switch", "PlayStation", "Xbox"], "evergreen", "low", {
    series: "Sonic",
    relatedGames: ["Sonic Adventure 2", "Sonic Mania"],
  }),
  game("Hades", "hades", "minigame", ["Roguelike", "Akční"], ["PC", "Switch", "PlayStation", "Xbox"], "evergreen", "low"),
  game("Fire Emblem: Three Houses", "fire-emblem-three-houses", "minigame", ["Tahová strategie", "JRPG"], ["Switch"], "evergreen", "low", {
    series: "Fire Emblem",
    relatedGames: ["Fire Emblem Engage", "Fire Emblem: The Three Hopes"],
  }),
  game("The Sims 4", "the-sims-4", "minor", ["Life sim", "Stavění"], ["PC", "PlayStation", "Xbox"], "evergreen", "medium", {
    series: "The Sims",
    relatedGames: ["The Sims 3", "The Sims 2"],
  }),

  // --- 31–40 ------------------------------------------------------------
  game("Disney Dreamlight Valley", "disney-dreamlight-valley", "major", ["Cozy", "Life sim"], ["PC", "Switch", "PlayStation", "Xbox"], "current", "medium"),
  game("Don't Starve Together", "dont-starve-together", "minor", ["Survival", "Co-op", "Roguelike"], ["PC", "Switch", "PlayStation", "Xbox"], "evergreen", "medium"),
  game("Raft", "raft", "major", ["Survival", "Co-op", "Oceán"], ["PC"], "evergreen", "medium"),
  game("Core Keeper", "core-keeper", "major", ["Survival", "Sandbox", "Co-op"], ["PC", "Switch", "PlayStation", "Xbox"], "evergreen", "medium"),
  game("Coral Island", "coral-island", "major", ["Cozy", "Farming", "Life sim"], ["PC", "Switch", "PlayStation", "Xbox"], "current", "medium"),
  game("Dinkum", "dinkum", "major", ["Cozy", "Survival", "Stavění"], ["PC", "Switch"], "evergreen", "low"),
  game("Spiritfarer", "spiritfarer", "minigame", ["Cozy", "Příběhové"], ["PC", "Switch", "PlayStation", "Xbox"], "evergreen", "low"),
  game("Cult of the Lamb", "cult-of-the-lamb", "minigame", ["Roguelike", "Cozy"], ["PC", "Switch", "PlayStation", "Xbox"], "evergreen", "low"),

  // --- 41–48 ------------------------------------------------------------
  game("DREDGE", "dredge", "core", ["Horor", "Cozy", "Oceán"], ["PC", "Switch", "PlayStation", "Xbox"], "fishing-core", "high", {
    status: "preparing",
    isFeatured: true,
    searchKeywords: ["fishing", "rare fish", "aberrations", "fishing guide"],
  }),
  game("Dave the Diver", "dave-the-diver", "core", ["Dobrodružství", "Cozy", "Oceán"], ["PC", "Switch", "PlayStation"], "fishing-core", "high", {
    status: "preparing",
  }),
  // Pozn.: název hry sám obsahuje „Fishing“, takže každý titul s názvem hry
  // je zároveň „rybářský" signál — scoring proto nevyžaduje další slovo
  // „fishing“ v titulku (viz scoreVideoCandidate).
  game("Fishing Planet", "fishing-planet", "core", ["Simulátor", "Free to play"], ["PC", "PlayStation", "Xbox", "Mobil"], "fishing-core", "high", {
    status: "preparing",
    hasDetail: true,
    detailHref: "/games/fishing-planet",
    image: "/images/games/fishing-planet.webp",
    searchKeywords: ["fishing", "fishing guide", "fishing tips", "beginner guide"],
  }),
  game("Russian Fishing 4", "russian-fishing-4", "core", ["Simulátor", "Free to play"], ["PC"], "fishing-core", "medium", { status: "preparing" }),
  game("Call of the Wild: The Angler", "call-of-the-wild-the-angler", "core", ["Simulátor", "Open world"], ["PC", "PlayStation", "Xbox"], "fishing-core", "medium", {
    status: "preparing",
  }),
  game("WEBFISHING", "webfishing", "core", ["Cozy", "Multiplayer", "Indie"], ["PC"], "fishing-core", "medium", {
    status: "preparing",
    isFeatured: true,
  }),
  // Naše domovská hra — jediná, ke které na webu reálně máme obsah
  // (encyklopedie úlovků na /ryby). Cover je vlastní asset projektu
  // (public/images/howtofish-generic-fallback.webp), ne cizí artwork.
  // searchKeywords vycházejí ze SKUTEČNÉHO obsahu hry (data/fish.ts,
  // data/locations.ts), ne z odhadu.
  game("How to Fish", "how-to-fish", "core", ["Cozy", "Indie", "Multiplayer"], ["PC"], "fishing-core", "high", {
    series: "How to Fish",
    status: "available",
    hasDetail: true,
    detailHref: "/ryby",
    isFeatured: true,
    quotes: ["Na Ostrově 1 u majáku to začalo. Pak přišel Spider Crab a bylo jasné, že u toho zůstanu."],
    image: "/images/howtofish-generic-fallback.webp",
    aliases: ["How to Fish", "HowToFish", "How to Fish CZ"],
    searchKeywords: [
      "How to Fish",
      "How to Fish gameplay",
      "How to Fish CZ",
      "Spider Crab",
      "Giant Piranha",
      "Pufferfish",
      "Salmon",
      "Ostrov 1 maják",
    ],
  }),
  game("Sun Haven", "sun-haven", "major", ["Cozy", "Farming", "RPG"], ["PC", "Switch"], "evergreen", "low"),
  game("Story of Seasons: Friends of Mineral Town", "story-of-seasons-friends-of-mineral-town", "major", ["Cozy", "Farming", "Nostalgie"], ["PC", "Switch", "PlayStation", "Xbox"], "nostalgia", "low", {
    series: "Story of Seasons / Harvest Moon",
    relatedGames: ["Story of Seasons: A Wonderful Life", "Harvest Moon: Back to Nature"],
  }),
  game("Graveyard Keeper", "graveyard-keeper", "minor", ["Simulátor", "Černý humor"], ["PC", "Switch", "PlayStation", "Xbox"], "evergreen", "low"),

  // --- 49–50 (doplněno 2026-09-22) — katalog na finálních 50 ------------
  game("Warframe", "warframe", "major", ["Akční", "Looter shooter", "Free to play"], ["PC", "Switch", "PlayStation", "Xbox", "Mobil"], "current", "high", {
    series: "Warframe",
    hasDetail: true,
    detailHref: "/games/warframe",
    image: "/images/games/warframe.webp",
    aliases: ["Warframe"],
    searchKeywords: [
      "fishing",
      "spear fishing",
      "Plains of Eidolon fishing",
      "Orb Vallis fishing",
      "Cambion Drift fishing",
      "fishing guide",
    ],
  }),
  game("The Long Dark", "the-long-dark", "minor", ["Survival", "Zima", "Single-player"], ["PC", "Switch", "PlayStation", "Xbox"], "evergreen", "medium", {
    series: "The Long Dark",
    aliases: ["The Long Dark", "TLD"],
    searchKeywords: ["fishing", "ice fishing", "fishing hut", "fishing tackle", "fishing guide"],
  }),
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

/** Jedna hra podle slugu (nezávisle na tom, jestli má vlastní detail). */
export function getGameBySlug(slug: string): GameEntry | undefined {
  return gameEntries.find((g) => g.slug === slug);
}

/**
 * Hry, které mají VLASTNÍ stránku na `/games/[slug]` — tedy `detailHref`
 * ukazuje právě na tuhle routu. How to Fish mezi ně nepatří: jeho obsah
 * bydlí v existujících sekcích a `detailHref` míří na `/ryby` (žádná
 * duplicita, viz zadání). Ostatní hry detail nemají a karta u nich
 * zůstává neklikací.
 */
export function getGamesWithGameDetailPage(): GameEntry[] {
  return gameEntries.filter((g) => g.hasDetail && g.detailHref === `/games/${g.slug}`);
}

/** Má hra vlastní `/games/[slug]` stránku? (dvoukontrola pro route i metadata) */
export function hasGameDetailPage(game: GameEntry): boolean {
  return game.hasDetail && game.detailHref === `/games/${game.slug}`;
}

/** Pět pilotních her (viz PILOT_GAME_SLUGS) v pořadí, v jakém jsou v katalogu. */
export function getPilotGames(): GameEntry[] {
  return gameEntries.filter((g) => (PILOT_GAME_SLUGS as readonly string[]).includes(g.slug));
}

export type GameQuote = { text: string; href: string; gameName: string };

/**
 * Citáty pro rotující hlášky (homepage) — jen od her, které mají vlastní
 * detail, na který může citát odkazovat. Nic se nevymýšlí: zdrojem je
 * `quotes` v datech hry.
 */
export function getGameQuotes(): GameQuote[] {
  return gameEntries
    .filter((game) => (game.quotes?.length ?? 0) > 0 && Boolean(game.detailHref))
    .flatMap((game) =>
      (game.quotes ?? []).map((text) => ({ text, href: game.detailHref as string, gameName: game.name }))
    );
}
