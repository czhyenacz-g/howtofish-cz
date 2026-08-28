// CZ/SK tvůrci, kteří hráli How to Fish — data pro carousel na homepage
// (viz app/components/CreatorVideoCarousel.tsx). Přidání dalšího tvůrce
// = jeden další objekt sem, carousel (dots/šipky/autoplay) se přizpůsobí
// automaticky, žádný hardcoded počet slidů v UI.
//
// Jen ověřená data — žádné vymyšlené YouTube ID, Kick VOD ID, počty
// zhlédnutí ani stav LIVE (viz zadání). YouTube video ID u Agraela a
// Herdyna ověřeno přes YouTube oEmbed (HTTP 200, video existuje a je
// vložitelné) a maxresdefault thumbnail (HTTP 200) před nasazením.
// U Kick tvůrců (FlyGun/Freeze/Miken) žádný iframe/scraping — jen odkaz
// na jejich veřejný profil/klipy a stylizovaný platform placeholder
// (žádný konkrétní VOD thumbnail, protože ho nejde spolehlivě získat
// bez scrapingu/API, viz zadání).
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
    title: "FlyGun hraje How to Fish",
    subtitle: "How to Fish s klukama",
    ctaLabel: "Zobrazit záznamy na Kicku",
  },
  {
    creator: "Freeze",
    platform: "kick",
    language: "cs",
    url: "https://kick.com/freezecz/clips",
    title: "Freeze hraje How to Fish",
    subtitle: "COOP s českými streamery",
    ctaLabel: "Klipy na Kicku",
  },
  {
    creator: "Miken",
    platform: "kick",
    language: "cs",
    url: "https://kick.com/miken/clips",
    title: "Miken hraje How to Fish",
    subtitle: "Klipy z How to Fish",
    ctaLabel: "Klipy na Kicku",
  },
];
