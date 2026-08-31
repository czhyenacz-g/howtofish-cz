// SEO profily tvůrců pro /stream/[creator] — ČTE data/creator-videos.ts
// (žádná duplikace faktů), ale nepřidává nic do něj a nijak ho neupravuje,
// aby zůstal homepage carousel (CreatorVideoCarousel) beze změny/rizika.
// Slug = jméno tvůrce zmenšené na malá písmena — všechna aktuální jména
// jsou bez diakritiky/mezer, takže žádný složitější slugify není potřeba.

import { creatorVideos, type CreatorVideo } from "./creator-videos.ts";

export type CreatorProfileVideo = {
  title: string;
  subtitle: string;
  platform: CreatorVideo["platform"];
  url: string;
  youtubeId?: string;
  image?: string;
};

export type CreatorProfile = {
  slug: string;
  name: string;
  videos: CreatorProfileVideo[];
  /**
   * Přepisuje výchozí úvodní větu ("patří mezi CZ/SK tvůrce, kteří si
   * zahráli How to Fish") — použij, když nemáme jistotu o rozsahu/
   * pravidelnosti hraní a chceme opatrnější formulaci (viz zadání).
   */
  bio?: string;
  /** Odkaz na profil/platformu, pokud ho máme, ale nemáme konkrétní ověřené video k zobrazení. */
  externalLink?: { label: string; href: string };
  /** Slug jiného tvůrce s doloženou souvislostí (např. společné hraní) — vykreslí se jako věta s interním odkazem. */
  relatedCreatorSlug?: string;
};

const creatorNames = Array.from(new Set(creatorVideos.map((v) => v.creator)));

const verifiedProfiles: CreatorProfile[] = creatorNames.map((name) => ({
  slug: name.toLowerCase(),
  name,
  videos: creatorVideos
    .filter((v) => v.creator === name)
    .map((v) => ({ title: v.title, subtitle: v.subtitle, platform: v.platform, url: v.url, youtubeId: v.youtubeId, image: v.image })),
}));

// Tvůrci, u kterých nemáme ověřené konkrétní video/klip (žádný YouTube ID,
// žádný potvrzený Kick odkaz) — jen opatrně formulovaná zmínka, že se
// objevili v souvislosti s How to Fish v české komunitě. Žádné vymyšlené
// statistiky, data ani pořadí (viz zadání).
const cautiousProfiles: CreatorProfile[] = [
  {
    slug: "haiset",
    name: "HaiseT",
    videos: [],
    bio: "HaiseT patří mezi české streamery, kteří se v poslední době objevili u How to Fish.",
  },
  {
    slug: "kapesnik69",
    name: "Kapesník",
    videos: [],
    bio: "Kapesník je součástí české streamer scény kolem How to Fish.",
    relatedCreatorSlug: "flygun",
  },
  {
    slug: "fattypillow",
    name: "FattyPillow",
    videos: [],
    bio: "FattyPillow se objevil mezi českými tvůrci, kteří hráli nebo streamovali How to Fish.",
  },
  {
    slug: "marwex",
    name: "Marwex",
    videos: [],
    bio: "Marwex se objevil mezi českými tvůrci, kteří hráli nebo streamovali How to Fish.",
  },
];

export const creatorProfiles: CreatorProfile[] = [...verifiedProfiles, ...cautiousProfiles];

export function getCreatorProfile(slug: string): CreatorProfile | undefined {
  return creatorProfiles.find((c) => c.slug === slug);
}
