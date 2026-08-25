// Kurátorovaná data pro /lokace — tři ostrovy zmíněné a citované v
// data/fish.ts a data/bosses.ts. Žádný nový výzkum, žádný vymyšlený
// obsah — zdroje viz `sources`.

export type CuratedSource = { label: string; url: string };

export type CuratedLocation = {
  slug: string;
  name: string;
  island?: string;
  notableThings?: string;
  note?: string;
  sources: CuratedSource[];
};

export const locations: CuratedLocation[] = [
  {
    slug: "ostrov-1-majak",
    name: "Ostrov 1 (Maják)",
    island: "Ostrov 1",
    notableThings: "Startovní ostrov hry. Boss Spider Crab, strážce majáku (obchod, výměna piva za návnadu).",
    note: "Po poražení Spider Crab dostaneš klíče od lodi a postup na další ostrov.",
    sources: [
      { label: "Nerdschalk – Spider Crab Fight: Requirements, Tips, and Boat Keys", url: "https://nerdschalk.com/how-to-fish-spider-crab-boss/" },
    ],
  },
  {
    slug: "ostrov-2-les",
    name: "Ostrov 2 (Les)",
    island: "Ostrov 2",
    notableThings: "Piraňa (běžná ryba) a boss Giant Piranha. Lesní paní vyměňuje pijavice za speciální návnadu.",
    note: "Quest lesní paní odemyká souřadnice dalšího ostrova.",
    sources: [
      { label: "Mobalytics – How to Beat the Giant Piranha in How to Fish", url: "https://mobalytics.gg/gamebase/guides/how-to-fish-giant-piranha-boss-guide" },
    ],
  },
  {
    slug: "ostrov-3",
    name: "Ostrov 3",
    island: "Ostrov 3",
    notableThings: "Salmon (běžná ryba) a boss Pufferfish. NPC vyměňuje ohroženou rybu za carrot bait.",
    note: "Trofej z boje s Pufferfish odemyká souřadnice dalšího ostrova.",
    sources: [
      { label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches", url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/" },
    ],
  },
];
