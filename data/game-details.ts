import type { GameEntry } from "./games.ts";

// Editorský obsah k detailům her (`/games/[slug]`) — schválně ODDĚLENÝ od
// data/games.ts, aby katalog zůstal přehledný (viz zadání bod 7: metadata
// hry patří do games.ts, delší texty sem).
//
// Všechno tady je psané ručně a jen k věcem, které jsou obecně známé nebo
// doložené v datech projektu — žádné AI lorem ipsum, žádné vymyšlené
// mechaniky. Když hra nemá vlastní `/games/[slug]` stránku, obsah tu
// nemusí být vůbec.

export type GameDetailContent = {
  slug: string;
  /** Proč je rybaření v této hře zajímavé — 1–2 věty do hero. */
  tagline: string;
  /** Odstavce sekce „Rybaření v této hře“. */
  fishing: string[];
  /** Uživatelsky přívětivé „co hledat“ (fallback: game.searchKeywords). */
  whatToLookFor?: string[];
  /** SEO title; fallback je „{hra} – rybaření a tipy | HowToFish.cz“. */
  seoTitle?: string;
  /** SEO description; fallback je obecná věta z dat hry. */
  metaDescription?: string;
};

export const gameDetails: GameDetailContent[] = [
  {
    slug: "minecraft",
    tagline:
      "Rybaření je v Minecraftu nenápadná mechanika, ze které se stala vlastní disciplína — od prvního prutu až po farmy na vzácné looty.",
    fishing: [
      "Prut vyrobíš ze tří klacků a dvou vláken a chytat se dá v podstatě v jakékoli vodě. Rybaření ale není jen o jídle: z vody se dají vytáhnout i poklady, a právě kvůli nim se kolem něj vyvinuly vlastní postupy.",
      "Enchanty Luck of the Sea a Lure zvyšují šanci na poklad a zrychlují záběr — s nimi se z rybaření stane dlouhodobá činnost. Ryby se navíc dají použít na jídlo i na obchod s vesničany.",
      "Samostatnou kapitolou jsou AFK farmy, kde za hráče chytá automatická konstrukce. V novějších verzích už to ale není tak snadné — loot se počítá jen z otevřené vody.",
    ],
    whatToLookFor: ["Fishing rod", "Luck of the Sea", "Lure", "Treasure fishing", "AFK fishing"],
    metaDescription:
      "Rybaření v Minecraftu: jak vyrobit prut, co dělají enchanty Luck of the Sea a Lure, treasure fishing a AFK farmy.",
  },
  {
    slug: "stardew-valley",
    tagline:
      "Ve Stardew Valley je rybaření plnohodnotná dovednost s vlastní mini-hrou, úrovněmi a legendárními rybami.",
    fishing: [
      "Chytání je mini-hra: držíš rybu v zeleném poli a zároveň jí nesmíš dát utéct. Lepší prut a návnada znamenají, že toho vytáhneš víc.",
      "Rybaření má vlastní úroveň i profese a postupně odemyká lepší vybavení a recepty. Je to jedna z mála činností, kterou můžeš dělat skoro kdykoliv a kdekoliv.",
      "Největší výzvou jsou legendární ryby — každá se loví na konkrétním místě za konkrétních podmínek (roční období, počasí, čas). Na farmě pak můžeš stavět fish pondy, ve kterých ryby produkují suroviny každý den.",
    ],
    whatToLookFor: ["Legendary fish", "Fishing guide", "Fishing level", "Fish pond", "Best fishing spot", "Fishing challenge"],
    metaDescription:
      "Rybaření ve Stardew Valley: mini-hra, úrovně a profese, legendární ryby, fish pondy a místa, kde se vyplatí lovit.",
  },
  {
    slug: "pokemon-brilliant-diamond-shining-pearl",
    tagline: "Rybaření je v Pokémonech od první generace — tři pruty, trpělivost a hromada Magikarpů.",
    fishing: [
      "Na vodu hodíš prut a spustíš tím souboj s vodním Pokémonem. Kvalita prutu (Old Rod, Good Rod, Super Rod) určuje, jak vzácné druhy na daném místě vůbec potkáš.",
      "Je to jedna z nejstarších „encounter“ mechanik série — a zároveň způsob, jak sehnat vodní Pokémony, kteří se v trávě neobjeví.",
      "V Brilliant Diamond / Shining Pearl je tahle klasika po ruce včetně Super Rodu. Řada hráčů u rybaření skončila déle, než původně plánovala.",
    ],
    whatToLookFor: ["Old Rod", "Good Rod", "Super Rod", "Magikarp", "Fishing Pokémon", "Fishing challenge"],
    metaDescription:
      "Rybaření v Pokémonech: Old Rod, Good Rod a Super Rod, Magikarp a vodní Pokémoni — a jak tahle klasika funguje v Brilliant Diamond / Shining Pearl.",
  },
  {
    slug: "sea-of-thieves",
    tagline: "V Sea of Thieves je rybaření samostatná frakce — Hunter's Call — a ryby se chytají jen s prutem a trpělivostí.",
    fishing: [
      "Prut a návnada stačí. Různé druhy ryb žijí na různých místech, v různém počasí a v různou denní dobu, takže lov je hlavně o tom vědět, kde a kdy.",
      "Vedle běžných ryb existují rare a trophy varianty, které mají větší cenu. Vše se prodává Hunter's Callu, takže z rybaření je vedlejší zdroj zlata i reputace.",
      "Rybařit se dá i ve více lidech na jedné lodi — je to ideální klidná činnost mezi souboji a plavbou za pokladem.",
    ],
    whatToLookFor: ["Hunter's Call", "Rare fish", "Trophy fish", "Fishing guide", "Fishing challenge"],
    metaDescription:
      "Rybaření v Sea of Thieves: prut a návnady, Hunter's Call, vzácné a trophy ryby a tipy, kde a kdy se vyplatí lovit.",
  },
  {
    slug: "terraria",
    seoTitle: "Terraria – rybaření, Angler a tipy | HowToFish.cz",
    tagline:
      "V Terrarii je rybaření vlastní systém — Angler a jeho questy, fishing power a výbava, která se neobejde bez správného biotopu.",
    fishing: [
      "Rybaření tu není jen doplněk: má vlastní výbavu (pruty, návnady, doplňky), vlastní stat „fishing power“ i vlastní odměny. Lepší výbava a vhodnější místo znamenají lepší úlovky.",
      "Angler rozdává rybářské questy — každý den chce konkrétní rybu z konkrétního biotopu. Za splněné questy dává odměny, které jinde neseženeš.",
      "Vyplatí se stavět si vlastní rybářská jezera: voda musí mít správnou velikost a nesmí být „kontaminovaná“ jiným biotopem, jinak chytíš něco jiného, než potřebuješ.",
    ],
    whatToLookFor: ["Angler quests", "Fishing power", "Bait", "Biome fishing pool", "Fishing guide"],
    metaDescription:
      "Rybaření v Terrarii: Angler questy, fishing power, návnady a biotopy — plus tipy, kde a jak lovit.",
  },
  {
    slug: "final-fantasy-xiv",
    seoTitle: "Final Fantasy XIV – rybaření a Fisher | HowToFish.cz",
    tagline: "Ve FFXIV je Fisher samostatný gathering job s vlastními úrovněmi, úlovky a dokonce vlastní lodí.",
    fishing: [
      "Fisher je jeden ze tří gathering jobů — má vlastní úrovně, dovednosti i sbírku úlovků. Rybařit se dá skoro všude, kde je voda.",
      "Samostatnou kapitolou je Ocean Fishing: výprava lodí Endeavor, kde se boduje podle toho, co a jak chytíš. Právě tam se dají získat vzácné úlovky i mount.",
      "Vedle běžných ryb existují collectables a vzácné „big fish“, které se loví za konkrétních podmínek — podle času, počasí a návnady.",
    ],
    whatToLookFor: ["Fisher job", "Ocean Fishing", "Big Fish", "Collectables", "Fisher guide"],
    metaDescription:
      "Rybaření ve Final Fantasy XIV: Fisher job, Ocean Fishing, vzácné úlovky a tipy, jak levelovat a co chytat.",
  },
  {
    slug: "world-of-warcraft",
    seoTitle: "World of Warcraft – rybaření a profese | HowToFish.cz",
    tagline: "Rybaření je ve WoW jedna z nejstarších profesí — klidná, výnosná a plná sezónních akcí.",
    fishing: [
      "Fishing je samostatná profese s vlastními úrovněmi. Dá se dělat kdekoliv, kde je voda — v Classicu i v současném retailu.",
      "Z rybaření je i slušný zdroj zlata: vzácné ryby se prodávají, z některých se vaří jídlo a jiné se používají v alchymii.",
      "K rybaření patří i komunitní akce, třeba Stranglethorn Fishing Extravaganza, kde se soutěží o vzácné úlovky.",
    ],
    whatToLookFor: ["Fishing profession", "Angler", "Rare fish", "Fishing for gold", "Stranglethorn Extravaganza"],
    metaDescription:
      "Rybaření ve World of Warcraft: profese, vzácné ryby, zlato z rybaření a sezónní akce — plus tipy a videa.",
  },
  {
    slug: "old-school-runescape",
    seoTitle: "Old School RuneScape – rybaření a trénink 1–99 | HowToFish.cz",
    tagline: "V OSRS je rybaření klasická dovednost: trénink 1–99, AFK metody a slušný zdroj zlata.",
    fishing: [
      "Rybaření se tréninkuje jako každá jiná dovednost — od prvních úlovků až po 99. Některé metody jsou záměrně AFK, jiné výnosnější.",
      "Vyšší úrovně odemykají lepší ryby i lokality, ale taky metody, které jsou pomalejší na zkušenosti a bohatší na zlato.",
      "Rybaření se pojí i s dalšími dovednostmi (vaření) a u ironman účtů bývá vlastní úlovek často jediná cesta k jídlu.",
    ],
    whatToLookFor: ["1–99 fishing", "AFK fishing", "Money making", "Anglerfish", "Fishing guide"],
    metaDescription: "Rybaření v Old School RuneScape: trénink 1–99, AFK metody, výdělek a tipy pro ironmany.",
  },
  {
    slug: "warframe",
    seoTitle: "Warframe – spear fishing a tipy | HowToFish.cz",
    tagline: "Ve Warframe se rybaří oštěpem v otevřených zónách — z úlovků se vyrábí výbava i reputace.",
    fishing: [
      "Rybaření funguje jen v otevřených lokacích (Plains of Eidolon, Orb Vallis, Cambion Drift). Loví se oštěpem a každá zóna má vlastní druhy.",
      "Úlovky se používají na výrobu, jako potrava pro zvířata nebo na reputaci u místních frakcí — vyplatí se vědět, co kde žije.",
      "Různé oštěpy a návnady ovlivňují, co vůbec můžeš chytit; roli hraje i denní doba a místo, kde se postavíš.",
    ],
    whatToLookFor: ["Spear fishing", "Plains of Eidolon", "Orb Vallis", "Cambion Drift", "Fishing guide"],
    metaDescription: "Rybaření ve Warframe: spear fishing v Plains of Eidolon, Orb Vallis a Cambion Drift — druhy, oštěpy a tipy.",
  },
  {
    slug: "palia",
    seoTitle: "Palia – rybaření a vzácné ryby | HowToFish.cz",
    tagline: "V Palii je rybaření jedna ze základních dovedností — klidná, odměňující a s vlastními vzácnými úlovky.",
    fishing: [
      "Rybaření má vlastní úroveň a postupně odemyká lepší pruty a návnady. Chytat se dá v řekách, jezerech i v moři.",
      "Různé druhy ryb se objevují podle místa, denní doby a počasí — vzácné úlovky často chtějí konkrétní kombinaci.",
      "Z úlovků je jídlo, dárky pro postavy i materiál pro výrobu, takže se rybaření vyplatí i mimo samotný lov.",
    ],
    whatToLookFor: ["Fishing level", "Rare fish", "Fishing locations", "Fishing guide"],
    metaDescription: "Rybaření v Palii: úrovně a pruty, vzácné ryby podle místa a času a tipy, jak na ně.",
  },
  {
    slug: "fallout-76",
    seoTitle: "Fallout 76 – rybaření a Gone Fission | HowToFish.cz",
    tagline: "Rybaření přišlo do Falloutu 76 s aktualizací Gone Fission — prut, přes 30 druhů ryb a vlastní výzvy.",
    fishing: [
      "Rybaření přidala aktualizace Gone Fission (červen 2025): prut, návnady a přes 30 druhů ryb v apalačských vodách.",
      "Prut se dá vylepšovat (Mark 1 až Mark 4) a postupně odemyká lepší úlovky. K tomu patří denní a týdenní rybářské výzvy.",
      "Ryby se dají jíst, použít do receptů nebo vystavit — a část rybaření se prolíná s dalšími aktivitami ve hře.",
    ],
    whatToLookFor: ["Gone Fission", "Fishing rod", "Fish challenge", "Fishing guide"],
    metaDescription: "Rybaření ve Falloutu 76: aktualizace Gone Fission, prut Mark 1–4, druhy ryb a rybářské výzvy.",
  },
  {
    slug: "fishing-planet",
    seoTitle: "Fishing Planet – rybaření a tipy | HowToFish.cz",
    tagline: "Fishing Planet je rybaření jako hlavní náplň — realistické revíry, náčiní a chování ryb.",
    fishing: [
      "Celá hra stojí na rybaření: vybíráš pruty, navijáky, vlasce a návnady a lovíš na skutečných lokalitách po celém světě.",
      "Důraz je na realistickém chování ryb — druh, počasí, denní doba i hloubka rozhodují, co zabere.",
      "Postupně odemykáš nové revíry i vybavení. Hra je free to play a dá se hrát i na konzolích a mobilu.",
    ],
    whatToLookFor: ["Beginner tips", "Power levelling", "Best spots", "Fishing guide"],
    metaDescription: "Fishing Planet: realistický rybářský simulátor — začátečnické tipy, levelování, revíry a návody.",
  },
];

export function getGameDetailContent(slug: string): GameDetailContent | undefined {
  return gameDetails.find((detail) => detail.slug === slug);
}

// --- Připraveno pro další fázi (monitoring) -----------------------------
// Datová vrstva pro sekci „Streameři, kteří tuhle hru hrají“. Zatím vrací
// PRÁZDNÝ seznam — žádný crawler, žádné API (viz zadání). Komponenta se
// při prázdném seznamu vůbec nevykreslí.
//
// Sekce s videi už reálná data má: čte je z tabulky `game_videos` přes
// lib/games/game-videos.ts (schválená videa), viz /games/[slug].

export type GameStreamerRef = { name: string; slug?: string; url?: string };

export function getGameStreamers(_game: GameEntry): GameStreamerRef[] {
  return [];
}
