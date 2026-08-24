// Datový model pro encyklopedii úlovků How to Fish CZ.
// Jeden zdroj dat pro /ryby (seznam), /ryby/[slug] (detail) i minihru /hra.
//
// `difficulty` je 1–5 (1 = snadné, 5 = nejtěžší).
//
// `verification` popisuje, jak byl záznam ověřen — v pořadí důvěryhodnosti:
//   "game-confirmed" — vidět přímo ve hře (oficiální screenshot/video/asset),
//   "official"       — z oficiálního obsahu Dazed Games / Steam stránky hry,
//   "community"       — shoda 2+ nezávislých kvalitních sekundárních zdrojů
//                        (herní žurnalistika, Steam Community diskuze),
//   "unverified"      — stojí jen na jednom slabším zdroji nebo se zdroje rozchází.
// Několik vzájemně opisujících/AI-generovaných wiki se NEPOČÍTÁ jako
// nezávislé zdroje (viz sources u jednotlivých záznamů a poznámka níže).
//
// Co nešlo ověřit nebo se zdroje rozcházely, je `undefined` — ne vymyšlené.
// Přesná čísla (ceny) pochází většinou jen z jednoho strukturovaného zdroje
// (nerdschalk.com) a jsou transparentně odcitovaná v `sources`.
//
// Vyřazený zdroj: how-to-fish.wiki — jeho seznam ryb se stoprocentně
// neshodoval se všemi ostatními nezávislými zdroji (jiná jména, jiné
// rarity), což je typický vzorec pro automaticky generovaný obsah.
// howtofishgame.wiki se nepoužívá vůbec (viz CLAUDE.md).

export type FishCategory = "ryba" | "tvor";

export type VerificationLevel =
  | "game-confirmed"
  | "official"
  | "community"
  | "unverified";

export const VERIFICATION_LABEL: Record<VerificationLevel, string> = {
  "game-confirmed": "Ověřeno ve hře",
  official: "Oficiální zdroj",
  community: "Komunitně ověřeno",
  unverified: "Neověřeno",
};

export type FishSource = {
  label: string;
  url: string;
};

export type FishEntry = {
  slug: string;
  name: string;
  czechName?: string;

  category: FishCategory;
  isBoss?: boolean;
  shortDescription: string;

  locations?: string[];
  rarity?: string;
  difficulty?: number;

  sellPrice?: string | number;

  requiredEquipment?: string[];
  bait?: string[];

  howToCatch?: string;
  tips?: string[];
  questUse?: string[];

  image?: string;

  gameVersion?: string;
  verification: VerificationLevel;
  updatedAt: string;

  sources: FishSource[];
};

export const fishEntries: FishEntry[] = [
  {
    slug: "spider-crab",
    name: "Spider Crab",
    czechName: "Krab pavoučí",
    category: "tvor",
    isBoss: true,
    shortDescription:
      "První hlavní boss hry na 1. ostrově (Maják) — přivoláš ho prázdnou plechovkou od piva a musíš ho zdolat s dobře nabroušenými boxerskými klouby.",
    locations: ["Ostrov 1 (Maják)"],
    difficulty: 2,
    sellPrice: 10000,
    requiredEquipment: ["Boxerské klouby (nabroušené na maximum)"],
    bait: ["Prázdná plechovka od piva"],
    howToCatch:
      "V obchodě si kup pivo a odnes ho strážci majáku — vyprázdní ti plechovku, kterou pak nasadíš jako speciální návnadu na prut. Po zahození návnady se krab sám objeví a chytíš ho jako běžnou rybu, čímž spustíš souboj.",
    tips: [
      "Před soubojem si kup a nabruš boxerské klouby na maximum — bez toho souboj zbytečně dlouho trvá.",
      "Nalákej kraba na výpad a uhni stranou, pak ho zezadu udeř během krátkého omráčení, které po výpadu následuje.",
      "Neutíkej příliš daleko — na delší vzdálenost přechází z výpadů na skoky a přijdeš tak o rytmus omráčení.",
      "Pod jeho životy je bílý časovač — když doběhne, krab uteče a celé přivolání musíš nastavit znovu.",
    ],
    questUse: [
      "Po poražení upustí krunýř, který je potřeba odnést strážci majáku výměnou za klíče od lodi a postup na další ostrov.",
    ],
    verification: "community",
    updatedAt: "2026-08-24",
    sources: [
      {
        label: "Destructoid – All fishes in How to Fish and how to catch them",
        url: "https://www.destructoid.com/all-fishes-in-how-to-fish-and-how-to-catch-them/",
      },
      {
        label: "The Gamer – How To Defeat The Spider Crab In How To Fish",
        url: "https://www.thegamer.com/how-to-fish-spider-crab-beer-defeat/",
      },
      {
        label: "Nerdschalk – Spider Crab Fight: Requirements, Tips, and Boat Keys",
        url: "https://nerdschalk.com/how-to-fish-spider-crab-boss/",
      },
      {
        label: "Game Rant – How to Catch and Beat the Spider Crab",
        url: "https://gamerant.com/how-to-fish-spider-crab-location-lighthouse-beer-quest/",
      },
    ],
  },
  {
    slug: "giant-piranha",
    name: "Giant Piranha",
    czechName: "Obří piraňa",
    category: "ryba",
    isBoss: true,
    shortDescription:
      "Druhý hlavní boss na 2. ostrově (Les) — mnohem větší varianta běžné piraně, kterou přivoláš pijavicemi vyměněnými u lesní paní.",
    locations: ["Ostrov 2 (Les)"],
    difficulty: 3,
    sellPrice: 11000,
    requiredEquipment: ["Brokovnice", "Boxerské klouby (na menší přivolané piraně)", "Uvařené jídlo (na doplnění zdraví)"],
    bait: ["Upravená návnada (za 3 pijavice od lesní paní)"],
    howToCatch:
      "V lese nachytej tři pijavice a odnes je lesní paní — výměnou dostaneš upravenou návnadu, kterou nasadíš na prut a přivoláš jí obří piraňu.",
    tips: [
      "Piraňa se na rozdíl od jiných bossů neomráčí, takže se musíš neustále pohybovat a udržovat odstup.",
      "Na menší piraně, které boss v průběhu boje přivolává, použij radši boxerské klouby než brokovnici — nebo je i sněz, doplní ti to zdraví/hlad.",
      "Uteč za strom a obíhej ho kolem — AI bosse to dost mate a můžeš ho takhle bezpečně postřelovat zezadu.",
      "Vezmi si s sebou uvařené jídlo na doplnění zdraví; dynamit se kvůli vlastnímu poškození nevyplácí.",
    ],
    questUse: [
      "Boss je součástí questu lesní paní — po poražení musíš sebrat upuštěnou kostru a donést jí ji zpět, což odemyká souřadnice dalšího ostrova.",
    ],
    verification: "community",
    updatedAt: "2026-08-24",
    sources: [
      {
        label: "Destructoid – All fishes in How to Fish and how to catch them",
        url: "https://www.destructoid.com/all-fishes-in-how-to-fish-and-how-to-catch-them/",
      },
      {
        label: "Mobalytics – How to Beat the Giant Piranha in How to Fish",
        url: "https://mobalytics.gg/gamebase/guides/how-to-fish-giant-piranha-boss-guide",
      },
      {
        label: "Nerdschalk – How to Fish Piranha Boss: Loadout, Fight Steps, and Skeleton Return",
        url: "https://nerdschalk.com/how-to-fish-piranha-boss/",
      },
      {
        label: "Steam Community – How do I solo beat giant piranha boss?",
        url: "https://steamcommunity.com/app/4001890/discussions/0/582806239606520442/",
      },
    ],
  },
  {
    slug: "pufferfish",
    name: "Pufferfish",
    czechName: "Čtverzubec",
    category: "ryba",
    isBoss: true,
    shortDescription:
      "Třetí hlavní boss na 3. ostrově — nafukuje se do ostnaté koule, která se snaží rozdrtit tebe i tvoji loď. Patří k nejtěžším soubojům v úvodní části hry.",
    locations: ["Ostrov 3"],
    difficulty: 4,
    sellPrice: 12000,
    requiredEquipment: ["SMG nebo útočná puška (pistole na něj nestačí)"],
    bait: ["Carrot bait (mrkvová návnada)"],
    howToCatch:
      "Carrot bait získáš výměnou za ohroženou rybu u NPC na 3. ostrově. Až ji budeš mít v inventáři, souboj s Pufferfishem se spustí sám.",
    tips: [
      "Bojuj v okolí stromů nebo skalnatého terénu — boss se hůř převaluje přes prudší terén, takže ti poskytne kryt.",
      "V multiplayeru je dobré určit jednoho hráče jako návnadu, zatímco ostatní soustředí palbu.",
      "Trofej (ocas), kterou boss upustí, nenech ukrást racky — bez ní bys musel celý souboj opakovat od začátku.",
    ],
    questUse: [
      "Trofej z boje odemyká souřadnice dalšího ostrova, takže je to nutná podmínka k dalšímu postupu.",
    ],
    // Přímo vidět na oficiálním Steam screenshotu hry: velký ostnatý
    // nafouklý tvor a hráč proti němu používá SMG — přesně odpovídá
    // popisu boje i požadovanému vybavení ze sekundárních zdrojů.
    verification: "game-confirmed",
    updatedAt: "2026-08-24",
    sources: [
      {
        label: "Steam – oficiální screenshoty hry How to Fish (boj s Pufferfish viditelný přímo na screenshotu)",
        url: "https://store.steampowered.com/app/4001890/How_to_Fish/",
      },
      {
        label: "Destructoid – All fishes in How to Fish and how to catch them",
        url: "https://www.destructoid.com/all-fishes-in-how-to-fish-and-how-to-catch-them/",
      },
      {
        label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches",
        url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/",
      },
      {
        label: "Steam Community – how do i beat pufferfish? third boss",
        url: "https://steamcommunity.com/app/4001890/discussions/0/582805931178533097/",
      },
    ],
  },
  {
    slug: "piranha",
    name: "Piranha",
    czechName: "Piraňa",
    category: "ryba",
    isBoss: false,
    shortDescription:
      "Běžná dravá rybka z 2. ostrova (Les). Existuje i mnohem větší a nebezpečnější varianta — Giant Piranha, boss stejného ostrova.",
    locations: ["Ostrov 2 (Les)"],
    rarity: "Základní",
    difficulty: 1,
    bait: ["Hot Dog"],
    verification: "community",
    updatedAt: "2026-08-24",
    sources: [
      {
        label: "Destructoid – All fishes in How to Fish and how to catch them",
        url: "https://www.destructoid.com/all-fishes-in-how-to-fish-and-how-to-catch-them/",
      },
      {
        label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches",
        url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/",
      },
    ],
  },
  {
    slug: "salmon",
    name: "Salmon",
    czechName: "Losos",
    category: "ryba",
    isBoss: false,
    shortDescription: "Běžná ryba z 3. ostrova, chytatelná běžným prutem na standardní návnadu.",
    locations: ["Ostrov 3"],
    difficulty: 1,
    sellPrice: 14,
    verification: "community",
    updatedAt: "2026-08-24",
    sources: [
      {
        label: "Destructoid – All fishes in How to Fish and how to catch them",
        url: "https://www.destructoid.com/all-fishes-in-how-to-fish-and-how-to-catch-them/",
      },
      {
        label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches",
        url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/",
      },
    ],
  },
];
