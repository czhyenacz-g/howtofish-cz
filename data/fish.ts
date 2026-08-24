// Datový model pro encyklopedii úlovků How to Fish CZ.
// Jeden zdroj dat pro /ryby (seznam) i /ryby/[slug] (detail).
//
// `difficulty` je 1–5 (1 = snadné, 5 = nejtěžší). `verified` říká, jestli
// existence a hlavní fakta o tvorovi mají oporu ve 2+ nezávislých
// veřejných zdrojích (viz `sources` u každého záznamu) — ne že je ověřené
// úplně každé dílčí číslo. Co nešlo ověřit, je `undefined`, ne vymyšlené.

export type FishCategory = "ryba" | "tvor";

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
  verified: boolean;
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
      "První hlavní boss hry na 1. ostrově — přivoláš ho prázdnou plechovkou od piva a musíš ho zdolat s dobře nabroušenými boxerskými klouby.",
    locations: ["Ostrov 1"],
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
    verified: true,
    updatedAt: "2026-08-24",
    sources: [
      {
        label: "Nerdschalk – Spider Crab Fight: Requirements, Tips, and Boat Keys",
        url: "https://nerdschalk.com/how-to-fish-spider-crab-boss/",
      },
      {
        label: "Game Rant – How to Catch and Beat the Spider Crab",
        url: "https://gamerant.com/how-to-fish-spider-crab-location-lighthouse-beer-quest/",
      },
      {
        label: "TPoseGaming – How to Fish Game Guide: All the Islands Walkthrough",
        url: "https://tposegaming.com/how-to-fish-guide/",
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
      "Druhý hlavní boss na 2. ostrově — mnohem větší varianta běžné piraně, kterou přivoláš pijavicemi vyměněnými u lesní paní.",
    locations: ["Ostrov 2"],
    difficulty: 3,
    sellPrice: 11000,
    requiredEquipment: ["Brokovnice", "Boxerské klouby (na menší přivolané piraně)", "Uvařená ryba (na doplnění zdraví)"],
    bait: ["Upravená návnada (za 3 pijavice od lesní paní)"],
    howToCatch:
      "V lese nachytej tři pijavice a odnes je lesní paní — výměnou dostaneš upravenou návnadu, kterou nasadíš na prut a přivoláš jí obří piraňu.",
    tips: [
      "Piraňa se na rozdíl od jiných bossů neomráčí, takže se musíš neustále pohybovat a udržovat odstup.",
      "Na menší piraně, které boss v průběhu boje přivolává, použij radši boxerské klouby než brokovnici.",
      "Vezmi si s sebou uvařenou rybu na doplnění zdraví; dynamit se kvůli vlastnímu poškození nevyplácí.",
    ],
    questUse: [
      "Boss je součástí questu lesní paní — po poražení musíš sebrat upuštěnou kostru a donést jí ji zpět, jinak quest nedokončíš.",
    ],
    verified: true,
    updatedAt: "2026-08-24",
    sources: [
      {
        label: "Nerdschalk – How to Fish Piranha Boss: Loadout, Fight Steps, and Skeleton Return",
        url: "https://nerdschalk.com/how-to-fish-piranha-boss/",
      },
      {
        label: "TPoseGaming – How to Fish Game Guide: All the Islands Walkthrough",
        url: "https://tposegaming.com/how-to-fish-guide/",
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
    verified: true,
    updatedAt: "2026-08-24",
    sources: [
      {
        label: "HowToFishGame.com – Pufferfish Boss: Full Fight Guide",
        url: "https://howtofishgame.com/pufferfish-boss.html",
      },
      {
        label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches",
        url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/",
      },
      {
        label: "Steam Community – how do i beat pufferfish? third boss",
        url: "https://steamcommunity.com/app/4001890/discussions/0/582805931178533097/",
      },
      {
        label: "TPoseGaming – How to Fish Game Guide: All the Islands Walkthrough",
        url: "https://tposegaming.com/how-to-fish-guide/",
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
      "Běžná dravá rybka ze základního rybářského okruhu 1. ostrova. Existuje i mnohem větší a nebezpečnější varianta — Giant Piranha, boss 2. ostrova.",
    locations: ["Ostrov 1"],
    rarity: "Základní (beginner lure pool)",
    difficulty: 1,
    verified: true,
    updatedAt: "2026-08-24",
    sources: [
      {
        label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches",
        url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/",
      },
      {
        label: "TPoseGaming – How to Fish Game Guide: All the Islands Walkthrough",
        url: "https://tposegaming.com/how-to-fish-guide/",
      },
    ],
  },
  {
    slug: "salmon",
    name: "Salmon",
    czechName: "Losos",
    category: "ryba",
    isBoss: false,
    shortDescription:
      "Běžná ryba ze základního rybářského okruhu 1. ostrova, chytatelná na základní návnadu hned od začátku hry.",
    locations: ["Ostrov 1"],
    rarity: "Základní (beginner lure pool)",
    difficulty: 1,
    sellPrice: 14,
    verified: true,
    updatedAt: "2026-08-24",
    sources: [
      {
        label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches",
        url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/",
      },
      {
        label: "TPoseGaming – How to Fish Game Guide: All the Islands Walkthrough",
        url: "https://tposegaming.com/how-to-fish-guide/",
      },
    ],
  },
];
