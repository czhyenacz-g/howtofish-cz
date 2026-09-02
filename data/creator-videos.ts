// CZ/SK tvůrci, kteří hráli How to Fish — data pro carousel na homepage
// (viz app/components/CreatorVideoCarousel.tsx). Přidání dalšího tvůrce
// = jeden další objekt sem, carousel (dots/šipky/autoplay) se přizpůsobí
// automaticky, žádný hardcoded počet slidů v UI.
//
// Jen ověřená data — žádné vymyšlené YouTube ID, Kick VOD ID, počty
// zhlédnutí ani stav LIVE (viz zadání). YouTube video ID u Agraela a
// Herdyna ověřeno přes YouTube oEmbed (HTTP 200, video existuje a je
// vložitelné) a maxresdefault thumbnail (HTTP 200) před nasazením.
// U Kick tvůrců (FlyGun/Freeze/Miken/astatoro/2sekundovymato) žádný
// iframe/scraping — jen odkaz na jejich veřejný profil/klipy a
// stylizovaný platform placeholder (žádný konkrétní VOD thumbnail,
// protože ho nejde spolehlivě získat bez scrapingu/API, viz zadání).
//
// HouseBox (2026-09-02): youtubeId ověřeno přes YouTube Data API v3
// (search.list + videos.list) — kanál "HouseBox" (channelId
// UCam7UAsJfvcs5JesL4nDl_w), popis videa přímo odkazuje na skutečnou
// Steam stránku How to Fish. maxresdefault thumbnail i oEmbed ověřeny
// HTTP 200 před nasazením. Druhé HouseBox video ("Rybářská HRA ROKU?!")
// a bonus třetí díl jsou v data/how-to-fish-videos.ts (autor housebox) —
// zdejší carousel slide ukazuje jen nejvýraznější z nich, ať carousel
// nemá dva sloty pro stejného tvůrce (viz zadání).
//
// astatoro/2sekundovymato: Kick účty ověřeny přes Kick API
// (/api/v2/channels/{slug}, HTTP 200, existující channel_id) — jde o
// obecný odkaz na jejich profil, ne o konkrétní ověřený How to Fish
// klip. Konkrétní klip, který byl dřív uveden jako důkaz pro astatoro,
// se při ověření ukázal být z jiné hry (GTA V, ne How to Fish) — proto
// tady NENÍ použitý, viz report.
export type CreatorVideoPlatform = "youtube" | "kick";

export type CreatorVideo = {
  creator: string;
  platform: CreatorVideoPlatform;
  language: "cs" | "sk";
  /** Zobrazený nadpis slidu, např. "Agraelus vyzkoušel How to Fish". */
  title: string;
  /** Název konkrétního videa/klipu, např. "Jak jsem se stal rybářem". */
  subtitle: string;
  /** Cílová URL (YouTube watch link, nebo Kick profil/klipy). */
  url: string;
  /** Jen pro platform "youtube" — zbytek (embed/thumbnail URL) se odvozuje z tohoto ID. */
  youtubeId?: string;
  /** Jen pro platform "kick" — logo nahrané ručně přes UCA admin (žádný scraping/API pro Kick VOD thumbnaily, viz výše). */
  image?: string;
  ctaLabel: string;
};

export const creatorVideos: CreatorVideo[] = [
  {
    creator: "Agraelus",
    platform: "youtube",
    language: "cs",
    youtubeId: "AXKRnUOtGHg",
    url: "https://www.youtube.com/watch?v=AXKRnUOtGHg",
    title: "Agraelus vyzkoušel How to Fish",
    subtitle: "Jak jsem se stal rybářem",
    ctaLabel: "Pustit video",
  },
  {
    creator: "HouseBox",
    platform: "youtube",
    language: "cs",
    youtubeId: "aW5dkh1j_WM",
    url: "https://www.youtube.com/watch?v=aW5dkh1j_WM",
    title: "HouseBox hraje How to Fish",
    subtitle: "Rybářská série od HouseBoxe",
    ctaLabel: "Pustit video",
  },
  {
    creator: "Herdyn",
    platform: "youtube",
    language: "cs",
    youtubeId: "r8shrFmL6QY",
    url: "https://www.youtube.com/watch?v=r8shrFmL6QY",
    title: "Herdyn hraje How to Fish",
    subtitle: "Rybářské finále",
    ctaLabel: "Pustit video",
  },
  {
    creator: "FlyGun",
    platform: "kick",
    language: "cs",
    url: "https://kick.com/flygun/videos",
    image: "https://content-api.darbujan.com/media/43",
    title: "FlyGun hraje How to Fish",
    subtitle: "How to Fish s klukama",
    ctaLabel: "Zobrazit záznamy na Kicku",
  },
  {
    creator: "Freeze",
    platform: "kick",
    language: "cs",
    url: "https://kick.com/freezecz/clips",
    image: "https://content-api.darbujan.com/media/44",
    title: "Freeze hraje How to Fish",
    subtitle: "COOP s českými streamery",
    ctaLabel: "Klipy na Kicku",
  },
  {
    creator: "Miken",
    platform: "kick",
    language: "cs",
    url: "https://kick.com/miken/clips",
    image: "https://content-api.darbujan.com/media/42",
    title: "Miken hraje How to Fish",
    subtitle: "Klipy z How to Fish",
    ctaLabel: "Klipy na Kicku",
  },
  {
    creator: "astatoro",
    platform: "kick",
    language: "sk",
    url: "https://kick.com/astatoro",
    title: "Astatoro hraje How to Fish",
    subtitle: "Slovenský streamer u How to Fish",
    ctaLabel: "Profil na Kicku",
  },
  {
    creator: "2sekundovymato",
    platform: "kick",
    language: "sk",
    url: "https://kick.com/2sekundovymato",
    title: "2sekundovymato hraje How to Fish",
    subtitle: "Slovenský streamer u How to Fish",
    ctaLabel: "Profil na Kicku",
  },
];
