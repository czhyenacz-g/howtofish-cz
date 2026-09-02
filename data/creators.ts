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
  /** Odvozeno z creator-videos.ts `language` (sk -> SK, jinak CZ) u ověřených profilů, jinak nastaveno ručně — jen pro malý, nenápadný country badge (viz zadání). */
  country: "CZ" | "SK";
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

// Ručně psané intro věty pro ověřené (creator-videos.ts) tvůrce, u
// kterých nechceme obecnou šablonovou větu (viz zadání "nevytvářej
// jednu stejnou větu pro 10 stránek") — kdo tu není, dostane beze
// změny dosavadní generickou větu z app/stream/[creator]/page.tsx.
const verifiedBioOverrides: Record<string, string> = {
  HouseBox:
    "HouseBox patří mezi známé české gamingové tvůrce, kteří se pustili do How to Fish. Hře věnoval samostatná videa, ve kterých postupně objevuje rybaření, vylepšení a další herní mechaniky.",
  astatoro:
    "Astatoro patří mezi slovenské tvůrce, kteří streamovali How to Fish. Tady najdeš odkaz na jeho profil na Kicku a další CZ/SK tvůrce ze stejné scény.",
  "2sekundovymato":
    "2sekundovymato je slovenský streamer, který se objevil také u How to Fish. Tady najdeš jeho dostupný obsah ze hry a další CZ/SK tvůrce.",
};

const verifiedProfiles: CreatorProfile[] = creatorNames.map((name) => ({
  slug: name.toLowerCase(),
  name,
  country: creatorVideos.find((v) => v.creator === name)?.language === "sk" ? "SK" : "CZ",
  bio: verifiedBioOverrides[name],
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
    country: "CZ",
    videos: [],
    bio: "HaiseT patří mezi české streamery, kteří se v poslední době objevili u How to Fish.",
  },
  {
    slug: "kapesnik69",
    name: "Kapesník",
    country: "CZ",
    videos: [],
    bio: "Kapesník je součástí české streamer scény kolem How to Fish.",
    relatedCreatorSlug: "flygun",
  },
  {
    slug: "fattypillow",
    name: "FattyPillow",
    country: "CZ",
    videos: [],
    bio: "FattyPillow se objevil mezi českými tvůrci, kteří hráli nebo streamovali How to Fish.",
  },
  {
    slug: "marwex",
    name: "Marwex",
    country: "CZ",
    videos: [],
    bio: "Marwex se objevil mezi českými tvůrci, kteří hráli nebo streamovali How to Fish.",
  },
  // anymall/boshoo: stejně jako astatoro/2sekundovymato výš — Kick účty
  // ověřené přes Kick API (/api/v2/channels/{slug}, HTTP 200, existující
  // channel_id), ale bez konkrétního ověřeného How to Fish videa/klipu,
  // takže žádné `videos` a jen obecná formulace + odkaz na skutečný profil.
  {
    slug: "anymall",
    name: "anymall",
    country: "SK",
    videos: [],
    bio: "anymall patří mezi slovenské tvůrce, kteří si zahráli How to Fish.",
    externalLink: { label: "Profil na Kicku", href: "https://kick.com/anymall" },
  },
  {
    slug: "boshoo",
    name: "boshoo",
    country: "SK",
    videos: [],
    bio: "boshoo patří mezi slovenské streamery, kteří si zahráli How to Fish.",
    externalLink: { label: "Profil na Kicku", href: "https://kick.com/boshoo" },
  },
];

// Touken byl v předchozím research seznamu zmíněný jako možný slovenský
// How to Fish tvůrce — creator candidate, čeká na ověření. V repu ani
// v aktuálně dostupných zdrojích není žádný konkrétní důkaz (VOD, klip,
// stream history), takže se sem NEpřidává jako vlastní indexovatelná
// stránka (viz zadání "nevymýšlej, jen protože byl dřív zmíněn").

export const creatorProfiles: CreatorProfile[] = [...verifiedProfiles, ...cautiousProfiles];

export function getCreatorProfile(slug: string): CreatorProfile | undefined {
  return creatorProfiles.find((c) => c.slug === slug);
}
