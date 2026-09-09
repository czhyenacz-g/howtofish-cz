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
  /** Přepisuje výchozí <title>/meta description v generateMetadata (app/stream/[creator]/page.tsx), když chceme konkrétnější SEO text než obecná šablona pro tvůrce bez videa. */
  seoTitle?: string;
  seoDescription?: string;
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
  // dzeryyy21 (2026-09-09): jediný fakticky doložený zdroj je jeho vlastní
  // stream "PROFI RYBÁŘI w/ @kingosfn" (2. 9. 2026, kategorie How to Fish,
  // ~2 h 40 min záznam) — viz data/creator-videos.ts. Žádné viewer
  // statistiky (zadání bod 23), žádný vymyšlený VOD permalink.
  dzeryyy21:
    "dzeryyy21 je český Kick streamer, který se 2. 9. 2026 pustil do How to Fish společně s kingosfn — stream „PROFI RYBÁŘI w/ @kingosfn“ běžel v kategorii How to Fish a záznam měl přibližně 2 hodiny 40 minut.",
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
  // PixelorezLIVE (2026-09-05): Twitch stream ze 3. 9. 2026 (kategorie
  // zahrnovala How to Fish, ~3,5 h, cca 18:05 start) — žádné konkrétní
  // ověřené VOD URL v projektových datech, proto jen odkaz na profil,
  // stejný vzorec jako anymall/boshoo výš (žádný embed/VideoObject).
  {
    slug: "pixelorezlive",
    name: "PixelorezLIVE",
    country: "CZ",
    videos: [],
    bio: "PixelorezLIVE je český Twitch streamer, který se v září 2026 pustil do How to Fish. Na HowToFish.cz najdeš jeho Twitch profil a další české a slovenské tvůrce, kteří hru streamovali.",
    seoTitle: "PixelorezLIVE hraje How to Fish",
    seoDescription: "PixelorezLIVE patří mezi české Twitch tvůrce, kteří streamovali How to Fish. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Twitch profil", href: "https://www.twitch.tv/pixelorezlive" },
  },
  // Druhá vlna nových CZ tvůrců (2026-09-09) — dzeryyy21 je jediný s
  // dostatečně silným důkazem (vlastní stream, viz creator-videos.ts) na
  // to, aby šel do verifiedProfiles/carouselu; zbylých 6 zůstává tady
  // jako "cautious" profily (žádné vymyšlené video, jen doložená
  // zmínka/externí odkaz na skutečný profil, viz zadání).
  //
  // kingosfn se objevil jako HOST na streamu dzeryyy21 ("PROFI RYBÁŘI w/
  // @kingosfn", 2. 9. 2026) — NEMÁ vlastní ověřený How to Fish stream,
  // proto formulace důsledně říká "zahrál si společně s", nikdy
  // "streamoval" (viz zadání bod 7).
  {
    slug: "kingosfn",
    name: "kingosfn",
    country: "CZ",
    videos: [],
    bio: "kingosfn si zahrál How to Fish společně s dzeryyy21 na jeho streamu „PROFI RYBÁŘI w/ @kingosfn“ (2. 9. 2026). Vlastní ověřený How to Fish stream kingosfn zatím nemá.",
    relatedCreatorSlug: "dzeryyy21",
    externalLink: { label: "Profil na Kicku", href: "https://kick.com/kingosfn" },
  },
  // Malej_Erik — potvrzený Twitch stream s titulkem "UČÍM SE RYBAŘIT! HOW
  // TO FISH W/ KLAKSON!" (5. 9. 2026). Slug odpovídá skutečnému Twitch
  // handlu (podtržítko, ne pomlčka), stejná logika jako kapesnik69/
  // pixelorezlive výš (reálný handle, ne vynucené kebab-case).
  {
    slug: "malej_erik",
    name: "Malej_Erik",
    country: "CZ",
    videos: [],
    bio: "Malej_Erik je český Twitch tvůrce, který si How to Fish zahrál na streamu s titulkem „UČÍM SE RYBAŘIT! HOW TO FISH W/ KLAKSON!“ (5. 9. 2026).",
    seoTitle: "Malej_Erik hraje How to Fish",
    seoDescription: "Malej_Erik je český Twitch tvůrce, který si zahrál How to Fish — podívej se na jeho profil a další CZ/SK tvůrce hry na HowToFish.cz.",
    externalLink: { label: "Otevřít Twitch profil", href: "https://www.twitch.tv/malej_erik" },
  },
  // POtkanzoR — dva potvrzené How to Fish streamy se STEJNÝM titulkem
  // "Rybaříme s homies" (30. a 31. 8. 2026), tedy opakovaný obsah, ne
  // jednorázovka. Zobrazované jméno zachovává stylizovaný casing
  // ("POtkanzoR"), slug je normalizovaný na malá písmena (stejný vzorec
  // jako HaiseT/FattyPillow/PixelorezLIVE výš).
  {
    slug: "potkanzor",
    name: "POtkanzoR",
    country: "CZ",
    videos: [],
    bio: "POtkanzoR je český Twitch streamer, který se k How to Fish vrátil opakovaně — streamy „Rybaříme s homies“ z 30. a 31. srpna 2026.",
    seoTitle: "POtkanzoR opakovaně streamuje How to Fish",
    seoDescription: "POtkanzoR je český Twitch tvůrce, který si How to Fish zahrál opakovaně. Podívej se na jeho profil a další CZ/SK tvůrce hry na HowToFish.cz.",
    externalLink: { label: "Otevřít Twitch profil", href: "https://www.twitch.tv/potkanzor" },
  },
  // xdamkiraly — český Kick variety streamer s doloženým, ale ne blíže
  // upřesněným How to Fish obsahem z počátku září 2026 (žádný konkrétní
  // titulek streamu k dispozici, proto opatrnější formulace než u
  // Malej_Erik/POtkanzoR výš).
  {
    slug: "xdamkiraly",
    name: "xdamkiraly",
    country: "CZ",
    videos: [],
    bio: "xdamkiraly je český Kick variety streamer s doloženým How to Fish obsahem z počátku září 2026.",
    externalLink: { label: "Profil na Kicku", href: "https://kick.com/xdamkiraly" },
  },
  // dajinka — potvrzená vazba na How to Fish z konce srpna 2026, bez
  // dalšího upřesnění konkrétního streamu.
  {
    slug: "dajinka",
    name: "dajinka",
    country: "CZ",
    videos: [],
    bio: "dajinka je český Kick streamer s potvrzenou vazbou na How to Fish z konce srpna 2026.",
    externalLink: { label: "Profil na Kicku", href: "https://kick.com/dajinka" },
  },
  // Goldyjede — TŘI potvrzené How to Fish streamy během září 2026
  // (1., 2. a 8. 9.), tedy opakovaný obsah — silnější profil než
  // jednorázová zmínka, ale platforma Twitch (žádné "twitch" v
  // CreatorVideoPlatform, viz creator-videos.ts), takže zůstává cautious
  // profil s bohatším bio textem místo carouselu.
  {
    slug: "goldyjede",
    name: "Goldyjede",
    country: "CZ",
    videos: [],
    bio: "Goldyjede se k How to Fish během září 2026 několikrát vrátil — streamy „HOW TO FISH“ (1. 9.), „JDEME LOVIT RYBY W CHAT“ (2. 9.) a „HOW TO FISH – DNES TO PROJEDEME“ (8. 9.).",
    seoTitle: "Goldyjede opakovaně streamuje How to Fish",
    seoDescription: "Goldyjede je český Twitch tvůrce, který se k How to Fish v září 2026 několikrát vrátil. Podívej se na jeho profil a další CZ/SK tvůrce hry na HowToFish.cz.",
    externalLink: { label: "Otevřít Twitch profil", href: "https://www.twitch.tv/goldyjede" },
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
