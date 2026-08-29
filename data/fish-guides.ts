// SEO návody "jak chytit" / "kde najít" pro jednotlivé ryby/bossy —
// explicitní, ručně psaná data (žádná AI/odhad), sestavená výhradně z
// faktů už ověřených a citovaných v data/fish.ts a data/locations.ts.
// Guide vzniká JEN pro záznam, který má ve fish.ts dost reálného obsahu
// (howToCatch + tipy) — viz zadání "raději méně stránek než thin content".
//
// Proč zvlášť od data/fish.ts: fish.ts je encyklopedický detail (jedna
// stránka = jedna ryba, všechny fakta pohromadě). Tenhle soubor cílí na
// konkrétní search intent ("jak chytit X" / "kde najít X") a text je
// proto přeskládaný do kratších, samostatných kroků/odpovědí — ne kopie.

export type FishGuideSource = { label: string; url: string };

export type FishGuideRequirement = { name: string; text?: string };

export type FishGuideLocation = { slug?: string; name: string; text: string };

export type FishGuideType = "how-to-catch" | "where-to-find";

export type FishGuide = {
  slug: string;
  fishSlug: string;
  type: FishGuideType;

  title: string;
  description: string;

  intro: string;
  shortAnswer?: string;

  location?: FishGuideLocation;
  requirements?: FishGuideRequirement[];
  steps?: string[];
  tips?: string[];

  relatedFishSlugs?: string[];

  sources: FishGuideSource[];
  lastReviewed?: string;
};

export const fishGuides: FishGuide[] = [
  // --- Spider Crab ---------------------------------------------------
  {
    slug: "jak-chytit-spider-crab",
    fishSlug: "spider-crab",
    type: "how-to-catch",
    title: "Jak chytit Spider Crab v How to Fish",
    description:
      "Návod, jak přivolat a chytit Spider Crab (prvního bosse) v How to Fish — jaká návnada a vybavení jsou potřeba.",
    intro:
      "Spider Crab je první hlavní boss hry a čeká hned na startovním ostrově. Nechytíš ho na běžnou návnadu — potřebuješ speciální plechovku od piva, kterou získáš výměnou u strážce majáku.",
    shortAnswer:
      "Kup pivo v obchodě, odnes ho strážci majáku výměnou za prázdnou plechovku, tu nasaď na prut jako návnadu a zahoď ji — krab se objeví sám a chycením spustíš souboj.",
    requirements: [
      { name: "Boxerské klouby", text: "Nabroušené na maximum — bez toho souboj zbytečně dlouho trvá." },
      { name: "Prázdná plechovka od piva", text: "Získáš výměnou u strážce majáku za koupené pivo." },
    ],
    steps: [
      "Kup pivo v obchodě na Ostrově 1.",
      "Odnes pivo strážci majáku — vyprázdní ti plechovku.",
      "Nasaď prázdnou plechovku jako návnadu na prut.",
      "Zahoď návnadu — Spider Crab se objeví sám.",
      "Chyť ho jako běžnou rybu, čímž se spustí souboj.",
    ],
    tips: [
      "Před soubojem si kup a nabruš boxerské klouby na maximum.",
      "Nalákej kraba na výpad a uhni stranou, pak ho zezadu udeř během krátkého omráčení, které po výpadu následuje.",
      "Neutíkej příliš daleko — na delší vzdálenost přechází z výpadů na skoky a přijdeš tak o rytmus omráčení.",
      "Pod jeho životy je bílý časovač — když doběhne, krab uteče a celé přivolání musíš nastavit znovu.",
    ],
    relatedFishSlugs: ["spider-crab"],
    sources: [
      { label: "Nerdschalk – Spider Crab Fight: Requirements, Tips, and Boat Keys", url: "https://nerdschalk.com/how-to-fish-spider-crab-boss/" },
      { label: "Destructoid – All fishes in How to Fish and how to catch them", url: "https://www.destructoid.com/all-fishes-in-how-to-fish-and-how-to-catch-them/" },
    ],
    lastReviewed: "2026-08-29",
  },
  {
    slug: "kde-najit-spider-crab",
    fishSlug: "spider-crab",
    type: "where-to-find",
    title: "Kde najít Spider Crab v How to Fish",
    description: "Kde v How to Fish najdeš Spider Crab (prvního bosse) a co dalšího je na Ostrově 1 (Maják).",
    intro:
      "Spider Crab, první hlavní boss hry, se nachází hned na startovním ostrově — Ostrově 1 (Maják). Nemusíš ho hledat po mapě, stačí na místě splnit podmínku pro jeho přivolání.",
    shortAnswer: "Spider Crab je na Ostrově 1 (Maják), stejném ostrově, kde hra začíná.",
    location: {
      slug: "ostrov-1-majak",
      name: "Ostrov 1 (Maják)",
      text:
        "Startovní ostrov hry. Kromě bosse tu najdeš strážce majáku a obchod — u strážce vyměníš koupené pivo za prázdnou plechovku, kterou pak použiješ jako speciální návnadu na Spider Craba.",
    },
    relatedFishSlugs: ["spider-crab"],
    sources: [
      { label: "Nerdschalk – Spider Crab Fight: Requirements, Tips, and Boat Keys", url: "https://nerdschalk.com/how-to-fish-spider-crab-boss/" },
    ],
    lastReviewed: "2026-08-29",
  },

  // --- Giant Piranha ---------------------------------------------------
  {
    slug: "jak-chytit-giant-piranha",
    fishSlug: "giant-piranha",
    type: "how-to-catch",
    title: "Jak chytit Giant Piranha v How to Fish",
    description:
      "Návod, jak přivolat a chytit Giant Piranha (druhého bosse) v How to Fish — jakou návnadu potřebuješ a jak ji získat.",
    intro:
      "Giant Piranha je druhý hlavní boss hry, mnohem větší varianta běžné piraně, a čeká na Ostrově 2 (Les). Nejdřív musíš získat speciální návnadu od lesní paní výměnou za nachytané pijavice.",
    shortAnswer:
      "Nachytej tři pijavice v lese a odnes je lesní paní — dostaneš upravenou návnadu, kterou nasadíš na prut a přivoláš jí obří piraňu.",
    requirements: [
      { name: "Brokovnice", text: "Hlavní zbraň proti bossovi." },
      { name: "Boxerské klouby", text: "Na menší piraně, které boss v průběhu boje přivolává." },
      { name: "Uvařené jídlo", text: "Na doplnění zdraví během souboje." },
    ],
    steps: [
      "Nachytej v lese tři pijavice.",
      "Odnes pijavice lesní paní.",
      "Výměnou dostaneš upravenou návnadu.",
      "Nasaď návnadu na prut a zahoď ji — přivoláš tím Giant Piranhu.",
    ],
    tips: [
      "Piraňa se na rozdíl od jiných bossů neomráčí, takže se musíš neustále pohybovat a udržovat odstup.",
      "Na menší piraně, které boss v průběhu boje přivolává, použij radši boxerské klouby než brokovnici — nebo je sněz, doplní ti to zdraví.",
      "Uteč za strom a obíhej ho kolem — AI bosse to dost mate a můžeš ho takhle bezpečně postřelovat zezadu.",
      "Vezmi si s sebou uvařené jídlo na doplnění zdraví.",
    ],
    relatedFishSlugs: ["giant-piranha", "piranha"],
    sources: [
      { label: "Mobalytics – How to Beat the Giant Piranha in How to Fish", url: "https://mobalytics.gg/gamebase/guides/how-to-fish-giant-piranha-boss-guide" },
      { label: "Nerdschalk – How to Fish Piranha Boss: Loadout, Fight Steps, and Skeleton Return", url: "https://nerdschalk.com/how-to-fish-piranha-boss/" },
    ],
    lastReviewed: "2026-08-29",
  },
  {
    slug: "kde-najit-giant-piranha",
    fishSlug: "giant-piranha",
    type: "where-to-find",
    title: "Kde najít Giant Piranha v How to Fish",
    description: "Kde v How to Fish najdeš Giant Piranha (druhého bosse) a co dalšího je na Ostrově 2 (Les).",
    intro:
      "Giant Piranha, druhý hlavní boss hry, se nachází na Ostrově 2 (Les) — druhém ostrově, kam se ve hře dostaneš po poražení Spider Craba.",
    shortAnswer: "Giant Piranha je na Ostrově 2 (Les).",
    location: {
      slug: "ostrov-2-les",
      name: "Ostrov 2 (Les)",
      text:
        "Lesnatý ostrov, kde kromě bosse najdeš i běžnou Piraňu (menší variantu) a lesní paní, u které za nachytané pijavice vyměníš speciální návnadu na Giant Piranhu.",
    },
    relatedFishSlugs: ["giant-piranha", "piranha"],
    sources: [
      { label: "Mobalytics – How to Beat the Giant Piranha in How to Fish", url: "https://mobalytics.gg/gamebase/guides/how-to-fish-giant-piranha-boss-guide" },
    ],
    lastReviewed: "2026-08-29",
  },

  // --- Pufferfish ---------------------------------------------------
  {
    slug: "jak-chytit-pufferfish",
    fishSlug: "pufferfish",
    type: "how-to-catch",
    title: "Jak chytit Pufferfish v How to Fish",
    description:
      "Návod, jak přivolat Pufferfish (třetího bosse) v How to Fish — jakou návnadu potřebuješ a odkud ji sehnat.",
    intro:
      "Pufferfish je třetí hlavní boss hry na Ostrově 3 a patří k nejtěžším soubojům v úvodní části hry. Na rozdíl od předchozích dvou bossů ho nepřivoláš návnadou na prutu, ale získáním speciálního předmětu do inventáře.",
    shortAnswer:
      "Vyměň ohroženou rybu u NPC na 3. ostrově za carrot bait — jakmile ho máš v inventáři, souboj s Pufferfishem se spustí sám.",
    requirements: [
      { name: "SMG nebo útočná puška", text: "Obyčejná pistole na něj podle komunitních zpráv nestačí." },
      { name: "Carrot bait", text: "Mrkvová návnada, kterou získáš výměnou u NPC na 3. ostrově." },
    ],
    steps: [
      "Ulov ohroženou rybu na 3. ostrově.",
      "Vyměň ji u NPC za carrot bait.",
      "Jakmile máš carrot bait v inventáři, souboj s Pufferfishem se spustí automaticky.",
    ],
    tips: [
      "Bojuj v okolí stromů nebo skalnatého terénu — boss se hůř převaluje přes prudší terén, takže ti poskytne kryt.",
      "V multiplayeru je dobré určit jednoho hráče jako návnadu, zatímco ostatní soustředí palbu.",
      "Trofej (ocas), kterou boss upustí, nenech ukrást racky — bez ní bys musel celý souboj opakovat od začátku.",
    ],
    relatedFishSlugs: ["pufferfish"],
    sources: [
      { label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches", url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/" },
      { label: "Steam – oficiální screenshoty hry How to Fish", url: "https://store.steampowered.com/app/4001890/How_to_Fish/" },
    ],
    lastReviewed: "2026-08-29",
  },
  {
    slug: "kde-najit-pufferfish",
    fishSlug: "pufferfish",
    type: "where-to-find",
    title: "Kde najít Pufferfish v How to Fish",
    description: "Kde v How to Fish najdeš Pufferfish (třetího bosse) a co dalšího je na Ostrově 3.",
    intro:
      "Pufferfish, třetí hlavní boss hry, se nachází na Ostrově 3 — třetím ostrově, kam se dostaneš po poražení Giant Piranhy.",
    shortAnswer: "Pufferfish je na Ostrově 3.",
    location: {
      slug: "ostrov-3",
      name: "Ostrov 3",
      text:
        "Ostrov, kde kromě bosse najdeš i běžnou rybu Salmon a NPC, u kterého za ulovenou ohroženou rybu vyměníš carrot bait potřebný k přivolání Pufferfishe.",
    },
    relatedFishSlugs: ["pufferfish", "salmon"],
    sources: [
      { label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches", url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/" },
    ],
    lastReviewed: "2026-08-29",
  },
];

export function getFishGuide(slug: string): FishGuide | undefined {
  return fishGuides.find((g) => g.slug === slug);
}

export function getFishGuidesForFish(fishSlug: string): FishGuide[] {
  return fishGuides.filter((g) => g.fishSlug === fishSlug);
}
