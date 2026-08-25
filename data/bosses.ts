// Kurátorovaná data pro /bossove — odvozeno ze STEJNÝCH ověřených a
// citovaných záznamů jako data/fish.ts (fishEntries s isBoss: true),
// jen přeskládaná do tvaru tabulky bossů. Žádný nový výzkum, žádný
// vymyšlený obsah — zdroje viz `sources` u každého záznamu (shodné se
// zdroji u odpovídající ryby ve fish.ts).
//
// Detail bosse existuje na /ryby/{slug} (fish.ts) — viz `detailSlug`.

export type CuratedSource = { label: string; url: string };

export type CuratedBoss = {
  slug: string;
  name: string;
  location?: string;
  howToFind?: string;
  tip?: string;
  detailSlug?: string;
  sources: CuratedSource[];
};

export const bosses: CuratedBoss[] = [
  {
    slug: "spider-crab",
    name: "Spider Crab",
    location: "Ostrov 1 (Maják)",
    howToFind:
      "Kup pivo v obchodě a odnes ho strážci majáku — vyprázdní ti plechovku, kterou nasadíš na prut jako speciální návnadu.",
    tip: "Nalákej kraba na výpad a uhni stranou, pak ho zezadu udeř během krátkého omráčení.",
    detailSlug: "spider-crab",
    sources: [
      { label: "Nerdschalk – Spider Crab Fight: Requirements, Tips, and Boat Keys", url: "https://nerdschalk.com/how-to-fish-spider-crab-boss/" },
      { label: "The Gamer – How To Defeat The Spider Crab In How To Fish", url: "https://www.thegamer.com/how-to-fish-spider-crab-beer-defeat/" },
    ],
  },
  {
    slug: "giant-piranha",
    name: "Giant Piranha",
    location: "Ostrov 2 (Les)",
    howToFind: "Nachytej tři pijavice a vyměň je u lesní paní za upravenou návnadu, kterou přivoláš bosse.",
    tip: "Piraňa se neomráčí — utíkej za strom a obíhej ho kolem, AI bosse to dost mate.",
    detailSlug: "giant-piranha",
    sources: [
      { label: "Mobalytics – How to Beat the Giant Piranha in How to Fish", url: "https://mobalytics.gg/gamebase/guides/how-to-fish-giant-piranha-boss-guide" },
      { label: "Nerdschalk – How to Fish Piranha Boss: Loadout, Fight Steps, and Skeleton Return", url: "https://nerdschalk.com/how-to-fish-piranha-boss/" },
    ],
  },
  {
    slug: "pufferfish",
    name: "Pufferfish",
    location: "Ostrov 3",
    howToFind: "Vyměň ohroženou rybu u NPC na 3. ostrově za carrot bait — souboj se spustí, jakmile ho máš v inventáři.",
    tip: "Bojuj u stromů nebo skalnatého terénu, boss se přes ně hůř převaluje a poskytnou ti kryt.",
    detailSlug: "pufferfish",
    sources: [
      { label: "Steam – oficiální screenshoty hry How to Fish", url: "https://store.steampowered.com/app/4001890/How_to_Fish/" },
      { label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches", url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/" },
    ],
  },
];
