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
  /** Volitelný přepis H1 na detailu (výchozí je jen jméno tvůrce) — pro konkrétnější SEO H1 typu "Trychta a How to Fish". */
  heading?: string;
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
  /**
   * Slug odpovídajícího profilu na StreamerSetup.cz (`/streameri/{slug}`
   * tam), POUZE pokud tam profil má smysluplný obsah (viz zadání "detail
   * → detail propojení, jen pokud má StreamerSetup profil smysluplný
   * obsah") — typicky ověřenou techniku. Nevyplňovat jen proto, že
   * profil na StreamerSetup.cz existuje.
   */
  streamerSetupSlug?: string;
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

// Slug odpovídajícího profilu na StreamerSetup.cz — jen tam, kde má ten
// profil smysluplný obsah (viz CreatorProfile.streamerSetupSlug výš).
// dzeryyy21 tam má kompletní ověřený PC setup, proto jediný z nové vlny.
const verifiedStreamerSetupSlugOverrides: Record<string, string> = {
  dzeryyy21: "dzeryyy21",
};

const verifiedProfiles: CreatorProfile[] = creatorNames.map((name) => ({
  slug: name.toLowerCase(),
  name,
  country: creatorVideos.find((v) => v.creator === name)?.language === "sk" ? "SK" : "CZ",
  bio: verifiedBioOverrides[name],
  streamerSetupSlug: verifiedStreamerSetupSlugOverrides[name],
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
  // Třetí vlna nových CZ tvůrců (2026-09-13): katulinkaaa/Nedric_/
  // luckycharlie23 mají doložený vlastní How to Fish stream (viz research),
  // ale žádný z nich žádný ověřený YouTube ID ani konkrétní zveřejněný Kick
  // klip s nahraným thumbnailem, takže žádný z nich nejde do
  // creatorVideos.ts/carouselu (zadání "žádné vymyšlené VOD ID") — stejný
  // vzorec jako Malej_Erik/POtkanzoR/Goldyjede výš. Žádný z nich nemá
  // ověřený gear na StreamerSetup.cz, proto bez streamerSetupSlug (na
  // rozdíl od dzeryyy21).
  {
    slug: "katulinkaaa",
    name: "katulinkaaa",
    country: "CZ",
    videos: [],
    bio: "katulinkaaa je česká Twitch tvůrkyně, která věnovala několikahodinový stream přímo hře How to Fish.",
    seoTitle: "katulinkaaa hraje How to Fish",
    seoDescription: "Česká Twitch tvůrkyně katulinkaaa streamovala How to Fish. Podívej se na její profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Twitch profil", href: "https://www.twitch.tv/katulinkaaa" },
  },
  // oskartommy: Kick Partner, doložený How to Fish stream (22. 8. 2026),
  // ale bez spolehlivě potvrzeného původního titulku VOD — proto stejná
  // opatrná formulace a stejná "Profil na Kicku" konvence jako u
  // anymall/boshoo/kingosfn/xdamkiraly/dajinka výš (žádný vymyšlený titulek).
  {
    slug: "oskartommy",
    name: "oskartommy",
    country: "CZ",
    videos: [],
    bio: "oskartommy patří mezi české Kick tvůrce, kteří streamovali How to Fish.",
    seoTitle: "oskartommy hraje How to Fish",
    seoDescription: "Český Kick streamer oskartommy streamoval How to Fish. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Profil na Kicku", href: "https://kick.com/oskartommy" },
  },
  // Nedric_: Twitch Partner, doložený ~4h How to Fish stream (24. 8. 2026),
  // ale bez spolehlivě potvrzeného původního titulku VOD. Slug zachovává
  // koncové podtržítko skutečného Twitch handlu (stejný vzorec jako
  // malej_erik výš), ne kebab-case.
  {
    slug: "nedric_",
    name: "Nedric_",
    country: "CZ",
    videos: [],
    bio: "Nedric_ patří mezi české Twitch tvůrce, kteří věnovali How to Fish několikahodinové vysílání.",
    seoTitle: "Nedric_ hraje How to Fish",
    seoDescription: "Český Twitch streamer Nedric_ streamoval How to Fish. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Twitch profil", href: "https://www.twitch.tv/nedric_" },
  },
  // luckycharlie23: samostatný CZ/SK How to Fish stream (22. 8. 2026) se
  // stream titulek pro VideoObject/embed nepoužíváme (žádné potvrzené
  // VOD URL/YouTube ID) — jen bio, stejný vzorec jako ostatní Twitch
  // profily bez videa výš.
  {
    slug: "luckycharlie23",
    name: "luckycharlie23",
    country: "CZ",
    videos: [],
    bio: "luckycharlie23 měl samostatný CZ/SK stream věnovaný How to Fish.",
    seoTitle: "luckycharlie23 hraje How to Fish",
    seoDescription: "Český Twitch streamer luckycharlie23 vysílal How to Fish pro CZ/SK publikum. Podívej se na jeho profil a další tvůrce hry.",
    externalLink: { label: "Otevřít Twitch profil", href: "https://www.twitch.tv/luckycharlie23" },
  },
  // Čtvrtá vlna (2026-09-16) — tři nově potvrzení CZ tvůrci s doloženou
  // vazbou na How to Fish, ale bez konkrétního ověřeného VOD/klipu, proto
  // zůstávají "cautious" (videos: [], žádný vymyšlený embed/VideoObject).
  // Všichni tři mají i profil na StreamerSetup.cz → streamerSetupSlug
  // (tam zatím bez ověřené techniky, proto se label crosslinku na
  // StreamerSetup.cz vykresluje neutrálně, viz app/streameri/[slug]/page.tsx).
  //
  // Trychta — opakované How to Fish streamy 8., 11., 12. a 13. 9. 2026
  // (poslední „How to Fish s Trychtou“, ~3 h 26 min). Žádné follower/
  // viewer statistiky (zadání bod 23).
  {
    slug: "trychta",
    name: "Trychta",
    heading: "Trychta a How to Fish",
    country: "CZ",
    videos: [],
    bio: "Trychta patří mezi české Twitch streamery, kteří se k How to Fish během září 2026 vraceli opakovaně. Hře věnoval několik samostatných vysílání, včetně streamu nazvaného „How to Fish s Trychtou“.",
    seoTitle: "Trychta hraje How to Fish",
    seoDescription: "Český Twitch streamer Trychta se k How to Fish opakovaně vracel. Podívej se na jeho Twitch profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Twitch profil", href: "https://www.twitch.tv/trychta" },
    streamerSetupSlug: "trychta",
  },
  // Cre_ator — Kick handle zachovává podtržítko (stejná konvence jako
  // malej_erik/nedric_ výš), slug proto "cre_ator", ne "cre-ator".
  // Potvrzené streamy 1., 3. a 12. 9. 2026 (poslední ~2 h). Z jednoho
  // názvu víme jen o zmínce speedrunu (45.57.749) — NEinterpretujeme ho
  // jako rekord/personal best, viz zadání.
  {
    slug: "cre_ator",
    name: "Cre_ator",
    heading: "Cre_ator a How to Fish",
    country: "CZ",
    videos: [],
    bio: "Cre_ator je český Kick streamer, který během září 2026 vysílal How to Fish opakovaně. Hru kombinoval s pohodovějšími streamy a v jednom z vysílání zmiňoval také How to Fish speedrun.",
    seoTitle: "Cre_ator hraje How to Fish",
    seoDescription: "Český Kick streamer Cre_ator se k How to Fish opakovaně vracel a zkoušel také speedrun. Objev jeho profil a další CZ/SK tvůrce hry.",
    // Reálný Kick handle má pomlčku (Kick normalizuje podtržítko): kick.com/cre-ator.
    // Náš interní slug zůstává "cre_ator" (= name.toLowerCase()).
    externalLink: { label: "Otevřít Kick profil", href: "https://kick.com/cre-ator" },
    streamerSetupSlug: "cre_ator",
  },
  // Strelec07 — How to Fish zařadil do vysílání 10.–11. a 13. 9. 2026
  // (13. 9. „Konečně nová webka! Dáme how to fish pak golf a reakce“).
  // Zmínku o nové webkameře evidujeme jen jako bezpečné konstatování
  // v intro textu, NIKOLIV jako konkrétní produkt (model neznáme).
  {
    slug: "strelec07",
    name: "Strelec07",
    heading: "Strelec07 a How to Fish",
    country: "CZ",
    videos: [],
    bio: "Strelec07 patří mezi menší české Kick tvůrce, kteří během září 2026 několikrát zařadili How to Fish do svého vysílání.",
    seoTitle: "Strelec07 hraje How to Fish",
    seoDescription: "Český Kick streamer Strelec07 streamoval How to Fish během několika zářijových vysílání. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Kick profil", href: "https://kick.com/strelec07" },
    streamerSetupSlug: "strelec07",
  },
  // Pátá vlna (2026-09-19) — šest ověřených CZ/SK tvůrců (4 hlavní + 2
  // mikrokanály). U všech je vazba na How to Fish doložená veřejně
  // (Kick „recent_categories“ obsahuje How to Fish u brejla/tada2015aa/
  // krteuk/skiller-cz22/bobarix, resp. ověřený Twitch profil + stream
  // titulky u pivko6654). Bez konkrétního ověřeného VOD/klipu → videos:
  // [], žádný vymyšlený embed/VideoObject. Všichni mají profil i na
  // StreamerSetup.cz → streamerSetupSlug (tam bez ověřené techniky, proto
  // neutrální label crosslinku). Žádné follower/viewer statistiky.
  // CANONICAL KE STREAMERSETUP: kick.com/skiller-cz22 (reálný handle má
  // pomlčku), slug našeho webu je ale skiller_cz22 = name.toLowerCase().
  {
    slug: "brejla",
    name: "Brejla",
    heading: "Brejla a How to Fish",
    country: "CZ",
    videos: [],
    bio: "Brejla streamoval How to Fish opakovaně a v jednom z vysílání se pokoušel hru dokončit do jedné hodiny.",
    seoTitle: "Brejla hraje How to Fish",
    seoDescription: "Český Kick streamer Brejla streamoval How to Fish opakovaně a pokoušel se hru dokončit do jedné hodiny. Podívej se na jeho profil a další CZ/SK tvůrce.",
    externalLink: { label: "Otevřít Kick profil", href: "https://kick.com/brejla" },
    streamerSetupSlug: "brejla",
  },
  {
    slug: "tada2015aa",
    name: "tada2015AA",
    heading: "tada2015AA a How to Fish",
    country: "CZ",
    videos: [],
    bio: "tada2015AA vysílal How to Fish dva dny po sobě v sérii nazvané „rybareni“.",
    seoTitle: "tada2015AA hraje How to Fish",
    seoDescription: "Český Kick tvůrce tada2015AA vysílal How to Fish ve dvou navazujících streamech. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Kick profil", href: "https://kick.com/tada2015aa" },
    streamerSetupSlug: "tada2015aa",
  },
  {
    slug: "krteuk",
    name: "Krteuk",
    heading: "Krteuk a How to Fish",
    country: "CZ",
    videos: [],
    bio: "Krteuk během září 2026 věnoval How to Fish několik vysílání, včetně společného hraní s Jirkou.",
    seoTitle: "Krteuk hraje How to Fish",
    seoDescription: "Český Kick streamer Krteuk věnoval How to Fish několik zářijových vysílání. Podívej se na jeho profil a další české a slovenské tvůrce.",
    externalLink: { label: "Otevřít Kick profil", href: "https://kick.com/krteuk" },
    streamerSetupSlug: "krteuk",
  },
  {
    slug: "pivko6654",
    name: "Pivko6654",
    heading: "Pivko6654 a How to Fish",
    country: "SK",
    videos: [],
    bio: "Pivko6654 je slovenský Twitch tvůrce, který se k How to Fish vrátil v několika vysíláních.",
    seoTitle: "Pivko6654 hraje How to Fish",
    seoDescription: "Slovenský Twitch tvůrce Pivko6654 streamoval How to Fish opakovaně. Podívej se na jeho Twitch profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Twitch profil", href: "https://www.twitch.tv/pivko6654" },
    streamerSetupSlug: "pivko6654",
  },
  // Mikrokanály — malé publikum není důvod k odmítnutí, vazba na How to
  // Fish je doložená veřejně (Kick recent_categories). Slug skiller_cz22
  // = name.toLowerCase(), profilová URL má reálný handle s pomlčkou.
  {
    slug: "skiller_cz22",
    name: "Skiller_cz22",
    heading: "Skiller_cz22 a How to Fish",
    country: "CZ",
    videos: [],
    bio: "Skiller_cz22 je český Kick tvůrce, v jehož streamované historii se objevuje také How to Fish.",
    seoTitle: "Skiller_cz22 hraje How to Fish",
    seoDescription: "Český Kick tvůrce Skiller_cz22 streamoval How to Fish. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Kick profil", href: "https://kick.com/skiller-cz22" },
    streamerSetupSlug: "skiller_cz22",
  },
  {
    slug: "bobarix",
    name: "Bobarix",
    heading: "Bobarix a How to Fish",
    country: "CZ",
    videos: [],
    bio: "Bobarix je český Kick tvůrce, který zařadil How to Fish mezi hry na svém streamu.",
    seoTitle: "Bobarix hraje How to Fish",
    seoDescription: "Český Kick tvůrce Bobarix streamoval How to Fish. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Kick profil", href: "https://kick.com/bobarix" },
    streamerSetupSlug: "bobarix",
  },
  // Šestá vlna (2026-09-21) — šest ověřených CZ tvůrců (4 Kick + 2 Twitch).
  // Vazba na How to Fish doložená veřejně (Kick „recent_categories“ obsahuje
  // How to Fish u klukbezkacek/tomasekqw/miwaldo/thatvace; u Kubex_27 a
  // Mlynek1 vlastní streamy s How to Fish v titulku). Bez konkrétního
  // ověřeného VOD → videos: [], žádný vymyšlený embed/VideoObject. Všichni
  // mají profil i na StreamerSetup.cz → streamerSetupSlug. Žádné follower
  // statistiky. Featured/carousel = false (nejsou v creator-videos.ts).
  {
    slug: "klukbezkacek",
    name: "Klukbezkacek",
    heading: "Klukbezkacek a How to Fish",
    country: "CZ",
    videos: [],
    bio: "Klukbezkacek zařadil How to Fish do svého zářijového Kick vysílání.",
    seoTitle: "Klukbezkacek hraje How to Fish",
    seoDescription: "Český Kick tvůrce Klukbezkacek zařadil How to Fish do svého zářijového vysílání. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Kick profil", href: "https://kick.com/klukbezkacek" },
    streamerSetupSlug: "klukbezkacek",
  },
  {
    slug: "tomasekqw",
    name: "Tomasekqw",
    heading: "Tomasekqw a How to Fish",
    country: "CZ",
    videos: [],
    bio: "Tomasekqw streamoval How to Fish v rámci CZ/SK vysílání zaměřeného na rybaření.",
    seoTitle: "Tomasekqw hraje How to Fish",
    seoDescription: "Český Kick streamer Tomasekqw streamoval How to Fish v rámci CZ/SK vysílání zaměřeného na rybaření. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Kick profil", href: "https://kick.com/tomasekqw" },
    streamerSetupSlug: "tomasekqw",
  },
  {
    slug: "miwaldo",
    name: "Miwaldo",
    heading: "Miwaldo a How to Fish",
    country: "CZ",
    videos: [],
    bio: "Miwaldo je český Kick streamer zaměřený hlavně na CS2, který zařadil How to Fish do svého zářijového vysílání.",
    seoTitle: "Miwaldo hraje How to Fish",
    seoDescription: "Český Kick streamer Miwaldo zařadil How to Fish do svého zářijového vysílání. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Kick profil", href: "https://kick.com/miwaldo" },
    streamerSetupSlug: "miwaldo",
  },
  {
    slug: "thatvace",
    name: "ThatVace",
    heading: "ThatVace a How to Fish",
    country: "CZ",
    videos: [],
    bio: "ThatVace se k How to Fish během několika zářijových streamů opakovaně vracel a věnoval hře výraznou část vysílání.",
    seoTitle: "ThatVace hraje How to Fish",
    seoDescription: "Český Kick streamer ThatVace se k How to Fish opakovaně vracel během několika zářijových streamů. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Kick profil", href: "https://kick.com/thatvace" },
    streamerSetupSlug: "thatvace",
  },
  // Kubex_27 — dva explicitní How to Fish streamy (1. a 3. 9. 2026),
  // druhý jako speedrun proti Kraltoustu. NEtvrdíme výsledek/rekord.
  {
    slug: "kubex_27",
    name: "Kubex_27",
    heading: "Kubex_27 a How to Fish",
    country: "CZ",
    videos: [],
    bio: "Kubex_27 streamoval How to Fish opakovaně a v jednom z vysílání zkoušel speedrun proti Kraltoustu.",
    seoTitle: "Kubex_27 hraje How to Fish",
    seoDescription: "Český Twitch streamer Kubex_27 streamoval How to Fish opakovaně a zkoušel také speedrun. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Twitch profil", href: "https://www.twitch.tv/kubex_27" },
    streamerSetupSlug: "kubex_27",
  },
  // Mlynek1 — velmi malý/nový kanál, první potvrzený HTF stream 19. 9. 2026.
  // Malé publikum není důvod k odmítnutí (vhodné pro budoucí outreach pilot).
  {
    slug: "mlynek1",
    name: "Mlynek1",
    heading: "Mlynek1 a How to Fish",
    country: "CZ",
    videos: [],
    bio: "Mlynek1 patří mezi novější české Twitch tvůrce, kteří v září 2026 streamovali How to Fish.",
    seoTitle: "Mlynek1 hraje How to Fish",
    seoDescription: "Český Twitch tvůrce Mlynek1 streamoval How to Fish v září 2026. Podívej se na jeho profil a další CZ/SK tvůrce hry.",
    externalLink: { label: "Otevřít Twitch profil", href: "https://www.twitch.tv/mlynek1" },
    streamerSetupSlug: "mlynek1",
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
