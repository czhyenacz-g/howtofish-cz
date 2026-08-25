// Kurátorovaná data pro /predmety — vybavení a návnady zmíněné a
// citované už u konkrétních záznamů v data/fish.ts a data/bosses.ts.
// Žádný nový výzkum, žádný vymyšlený obsah — zdroje viz `sources`.

export type CuratedSource = { label: string; url: string };

export type CuratedItem = {
  slug: string;
  name: string;
  itemType?: string;
  obtainedAt?: string;
  use?: string;
  sources: CuratedSource[];
};

export const items: CuratedItem[] = [
  {
    slug: "boxerske-klouby",
    name: "Boxerské klouby",
    itemType: "zbraň",
    obtainedAt: "Obchod — je potřeba je nabrousit na maximum",
    use: "Základní zbraň na souboj se Spider Crab a na menší piraně přivolávané bossem Giant Piranha.",
    sources: [
      { label: "Nerdschalk – Spider Crab Fight: Requirements, Tips, and Boat Keys", url: "https://nerdschalk.com/how-to-fish-spider-crab-boss/" },
      { label: "Mobalytics – How to Beat the Giant Piranha in How to Fish", url: "https://mobalytics.gg/gamebase/guides/how-to-fish-giant-piranha-boss-guide" },
    ],
  },
  {
    slug: "prazdna-plechovka-od-piva",
    name: "Prázdná plechovka od piva",
    itemType: "návnada",
    obtainedAt: "Kup pivo v obchodě a odnes ho strážci majáku na Ostrově 1 — vyprázdní ti ji.",
    use: "Speciální návnada na prut, kterou přivoláš bosse Spider Crab.",
    sources: [
      { label: "The Gamer – How To Defeat The Spider Crab In How To Fish", url: "https://www.thegamer.com/how-to-fish-spider-crab-beer-defeat/" },
      { label: "Game Rant – How to Catch and Beat the Spider Crab", url: "https://gamerant.com/how-to-fish-spider-crab-location-lighthouse-beer-quest/" },
    ],
  },
  {
    slug: "upravena-navnada",
    name: "Upravená návnada",
    itemType: "návnada",
    obtainedAt: "Vyměň 3 nachytané pijavice u lesní paní na Ostrově 2 (Les).",
    use: "Přivolá bosse Giant Piranha.",
    sources: [
      { label: "Nerdschalk – How to Fish Piranha Boss: Loadout, Fight Steps, and Skeleton Return", url: "https://nerdschalk.com/how-to-fish-piranha-boss/" },
    ],
  },
  {
    slug: "carrot-bait",
    name: "Carrot bait (mrkvová návnada)",
    itemType: "návnada",
    obtainedAt: "Výměna za ohroženou rybu u NPC na Ostrově 3.",
    use: "Spustí souboj s bossem Pufferfish.",
    sources: [
      { label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches", url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/" },
    ],
  },
  {
    slug: "smg-nebo-utocna-puska",
    name: "SMG nebo útočná puška",
    itemType: "zbraň",
    use: "Nutné vybavení na souboj s Pufferfish — obyčejná pistole na něj podle komunitních zpráv nestačí.",
    sources: [
      { label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches", url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/" },
      { label: "Steam Community – how do i beat pufferfish? third boss", url: "https://steamcommunity.com/app/4001890/discussions/0/582805931178533097/" },
    ],
  },
  {
    slug: "hot-dog",
    name: "Hot Dog",
    itemType: "návnada",
    use: "Návnada na běžnou Piraňu na Ostrově 2 (Les).",
    sources: [
      { label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches", url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/" },
    ],
  },
];
