// Video content vrstva pro How to Fish videa českých tvůrců.
//
// DŮLEŽITÉ ROZLIŠENÍ (viz zadání): video má AUTORA (kdo ho natočil/
// nahrál) a může mít VÍC "featured" tvůrců (kdo se ve videu objevuje) —
// tohle NENÍ totéž. Např. video od kanálu "Prezz" featuruje FlyGuna,
// Haiseta, Freeze a Herdyna, ale autorem je Prezz, ne žádný z nich.
//
// Zdroj metadat: YouTube Data API v3 (`videos.list`, `part=snippet`),
// ověřeno 2026-08-31 — `title`, `publishedAt`, `channelTitle`,
// `description`, `thumbnails` jsou přímo z API, ne odhad ani přepis
// cizího textu. `summary` je vždy náš vlastní, originální text — nikdy
// kopie popisu z YouTube.
//
// Žádné vymyšlené herní entity: `fishSlugs`/`bossSlugs`/`locationSlugs`/
// `itemSlugs`/`guideSlugs` zůstávají prázdné, dokud název/popis videa
// konkrétní entitu skutečně nejmenuje — u aktuálních 4 videí to není
// případ (názvy/popisy mluví o tvůrcích a obecně o hře, ne o
// konkrétních rybách/bossech), viz report.
//
// Video https://www.youtube.com/watch?v=pexyrbH8KCM (FlyGunCZ, "Feed
// and Grow: Fish") sem záměrně NENÍ zařazené — jde o jinou hru, ne
// How to Fish (ověřeno stejným API voláním).

export type VideoAuthor = {
  name: string;
  channelUrl: string;
  /** Slug v data/creators.ts — jen pokud autora sledujeme jako vlastní profil na webu. */
  creatorSlug?: string;
};

export type HowToFishVideo = {
  slug: string;
  platform: "youtube";
  videoId: string;
  url: string;
  /** Skutečný title z YouTube — nikdy neupravovaný/zkrácený beze změny významu. */
  title: string;
  /**
   * Čistší SEO title pro <title>/H1 kontext, jen když je originální title
   * přeplněný (emoji, @zmínky, datum) — viz zadání "ne keyword stuffing".
   * Bez nového tvrzení navíc, jen zkrácený/pročištěný zápis stejné věci.
   * Když chybí, používá se `title`.
   */
  seoTitle?: string;
  /** ISO datum z YouTube Data API snippet.publishedAt. */
  publishedAt: string;
  thumbnailUrl: string;
  author: VideoAuthor;
  /**
   * Slugy tvůrců, kteří se ve videu doloženě objevují (potvrzeno v
   * title/description, ne jen v obecných kanálových tagách) — může,
   * ale nemusí zahrnovat autora samotného.
   */
  featuredCreatorSlugs: string[];
  /** True jen když title/description skutečně potvrzuje hru How to Fish. */
  howToFishConfirmed: boolean;
  /** Náš vlastní, originální souhrn — nikdy převzatý popis/titulky. */
  summary: string;
  fishSlugs: string[];
  bossSlugs: string[];
  locationSlugs: string[];
  itemSlugs: string[];
  guideSlugs: string[];
  /** false = karta na profilech, ale bez vlastní indexovatelné /videa/[slug] stránky. */
  indexable: boolean;
};

const FLYGUN_AUTHOR: VideoAuthor = {
  name: "FlyGun+",
  channelUrl: "https://www.youtube.com/@FlyGunPlus",
  creatorSlug: "flygun",
};

export const howToFishVideos: HowToFishVideo[] = [
  {
    slug: "flygun-rybareni-zabavny",
    platform: "youtube",
    videoId: "ZPxf_8mB1Cc",
    url: "https://www.youtube.com/watch?v=ZPxf_8mB1Cc",
    title: "Rybaření Ještě Nikdy Nebylo Takhle Zábavný",
    publishedAt: "2026-08-25T16:12:26Z",
    thumbnailUrl: "https://i.ytimg.com/vi/ZPxf_8mB1Cc/maxresdefault.jpg",
    author: FLYGUN_AUTHOR,
    featuredCreatorSlugs: ["flygun"],
    howToFishConfirmed: false,
    summary:
      "FlyGun v tomhle videu z 25. srpna 2026 natáčí herní záznam zaměřený na rybaření. Ani název, ani popis videa konkrétní hru výslovně nejmenují, takže nejde s jistotou potvrdit, že jde přímo o How to Fish. Vzhledem k tomu, že FlyGun je jeden z českých tvůrců dlouhodobě spojovaných s touto hrou, video sem řadíme jako tematicky blízkou ukázku jeho rybářského obsahu — ne jako potvrzený záznam z How to Fish.",
    fishSlugs: [],
    bossSlugs: [],
    locationSlugs: [],
    itemSlugs: [],
    guideSlugs: [],
    indexable: true,
  },
  {
    slug: "flygun-lethal-company-haiset",
    platform: "youtube",
    videoId: "W5T_2NSfkZU",
    url: "https://www.youtube.com/watch?v=W5T_2NSfkZU",
    title: "Lethal Company + Rybaření = Gone Fishing W/ Haiset",
    publishedAt: "2025-07-23T15:50:29Z",
    thumbnailUrl: "https://i.ytimg.com/vi/W5T_2NSfkZU/maxresdefault.jpg",
    author: FLYGUN_AUTHOR,
    featuredCreatorSlugs: ["flygun", "haiset"],
    howToFishConfirmed: false,
    summary:
      "V tomhle videu z 23. července 2025 kombinuje FlyGun horor-survival hru Lethal Company s rybářskou tematikou a hraje společně s dalším českým tvůrcem HaiseTem (potvrzeno přímo v názvu videa). Jde spíš o crossover/mix obsahu než o čistý záznam z How to Fish — přesná souvislost s hrou How to Fish samotnou není z názvu ani popisu jednoznačná. Video přesto dokládá reálnou spolupráci mezi FlyGunem a HaiseTem.",
    fishSlugs: [],
    bossSlugs: [],
    locationSlugs: [],
    itemSlugs: [],
    guideSlugs: [],
    indexable: true,
  },
  {
    slug: "to-nejlepsi-z-how-to-fish-sestrih",
    platform: "youtube",
    videoId: "2qVTwWK67e4",
    url: "https://www.youtube.com/watch?v=2qVTwWK67e4",
    title: "TO NEJLEPŠÍ Z HOW TO FISH! | Flygun + Haiset + Freeze + Herdyn",
    seoTitle: "To nejlepší z How to Fish – FlyGun, HaiseT, Freeze a Herdyn",
    publishedAt: "2026-08-24T15:43:59Z",
    thumbnailUrl: "https://i.ytimg.com/vi/2qVTwWK67e4/maxresdefault.jpg",
    author: { name: "Prezz", channelUrl: "https://www.youtube.com/@Prezzedit" },
    featuredCreatorSlugs: ["flygun", "haiset", "freeze", "herdyn"],
    howToFishConfirmed: true,
    summary:
      "Sestřih od tvůrce Prezz (kanál @Prezzedit), který v popisu videa sám upozorňuje, že jde o neoficiální fanouškovský účet — nejde tedy o video žádného ze zmíněných streamerů. Video spojuje momenty ze hry How to Fish od čtyř různých českých tvůrců: FlyGuna, HaiseTa, Freeze a Herdyna (všichni jmenovaní přímo v názvu i popisu). Přesný obsah jednotlivých klipů — konkrétní ryby, bossové nebo lokace — se z názvu ani popisu nedá ověřit, ale samotné video je jasně o How to Fish a dobře ukazuje, jak se čeští tvůrci k tématu vzájemně prolínají.",
    fishSlugs: [],
    bossSlugs: [],
    locationSlugs: [],
    itemSlugs: [],
    guideSlugs: [],
    indexable: true,
  },
  {
    slug: "how-to-fish-1-herdyn-archiv",
    platform: "youtube",
    videoId: "fsoJWHp7CuU",
    url: "https://www.youtube.com/watch?v=fsoJWHp7CuU",
    title: "UTRPENÍ S MELICHAREM 🎣🌊 | How to Fish | #01 | 23.08.2026 | @Herdyn @HaiseT @FlyGunCZ @freeze_lol",
    seoTitle: "How to Fish #1 – Herdyn, HaiseT, FlyGun a Freeze",
    publishedAt: "2026-08-24T04:00:38Z",
    thumbnailUrl: "https://i.ytimg.com/vi/fsoJWHp7CuU/maxresdefault.jpg",
    author: { name: "Herdyn Archive", channelUrl: "https://www.youtube.com/@HerdynArchiv" },
    featuredCreatorSlugs: ["herdyn", "haiset", "flygun", "freeze"],
    howToFishConfirmed: true,
    summary:
      "Video z kanálu Herdyn Archive, který podle vlastního popisu archivuje/reuploaduje Herdynovy streamové záznamy (odkazuje na jeho hlavní YouTube a sociální sítě). Jde o první díl (#01) záznamu z How to Fish, ve kterém je Herdyn v názvu videa označený společně s HaiseTem, FlyGunem a Freeze. Přesný herní obsah — konkrétní úlovky, bossové nebo lokace — se z názvu ani popisu nedá ověřit, ale video jasně patří do české How to Fish scény a dokládá spolupráci mezi čtyřmi sledovanými tvůrci.",
    fishSlugs: [],
    bossSlugs: [],
    locationSlugs: [],
    itemSlugs: [],
    guideSlugs: [],
    indexable: true,
  },
];

export function getVideoBySlug(slug: string): HowToFishVideo | undefined {
  return howToFishVideos.find((v) => v.slug === slug);
}

/** Videa, kde je daný tvůrce autorem NEBO se v nich jen objevuje. */
export function getVideosForCreator(creatorSlug: string): HowToFishVideo[] {
  return howToFishVideos.filter(
    (v) => v.author.creatorSlug === creatorSlug || v.featuredCreatorSlugs.includes(creatorSlug)
  );
}

/** Jen videa, kde je daný tvůrce skutečným autorem (vlastní kanál). */
export function getVideosAuthoredBy(creatorSlug: string): HowToFishVideo[] {
  return howToFishVideos.filter((v) => v.author.creatorSlug === creatorSlug);
}

/** Videa, kde se tvůrce objevuje, ale autorem je někdo jiný (kompilace/archiv). */
export function getVideosFeaturingButNotAuthoredBy(creatorSlug: string): HowToFishVideo[] {
  return howToFishVideos.filter(
    (v) => v.author.creatorSlug !== creatorSlug && v.featuredCreatorSlugs.includes(creatorSlug)
  );
}

export function getIndexableVideos(): HowToFishVideo[] {
  return howToFishVideos.filter((v) => v.indexable);
}
