// Syrové tvary odpovědí Universal Content API (server-only) — nikdy
// neprotékají do UI, mapují se na CommunityCatch v catches.ts.

export type UcaMedia = {
  id: number;
  record_id: number | null;
  public_url: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type UcaRecordStatus = "pending" | "approved" | "rejected";

export type UcaRecord = {
  id: number;
  collection?: string;
  status: UcaRecordStatus;
  data: Record<string, unknown>;
  media: UcaMedia[];
  created_at: string;
  updated_at: string;
};

export type UcaPaginatedResponse<T> = {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

// Payload uložený do records.data pro collection "catches" — viz
// docs/API.md v universal-content-api a CLAUDE.md poznámka o historickém
// smyslu ukládání steam_id/nickname/caught_at.
export type CatchRecordData = {
  fish_slug: string;
  steam_id: string;
  nickname: string;
  caught_at: string;
  note?: string;
  rights_confirmed: true;
};

// HowToFish typ pro UI — jediné místo, kudy komunitní úlovek "vteče"
// do komponent. Nikdy nepředávej UcaRecord/UcaMedia dál do UI.
export type CommunityCatch = {
  id: number;
  fishSlug: string;
  steamId: string;
  nickname: string;
  caughtAt: string;
  note?: string;
  image: {
    id: number;
    url: string;
    width?: number;
    height?: number;
  };
  createdAt: string;
};

// Payload uložený do records.data pro collection "game_scores" —
// žádné osobní údaje navíc, jen co je potřeba pro žebříček.
export type GameScoreData = {
  game: string;
  steam_id: string;
  nickname: string;
  score: number;
  round: number;
  kills: number;
  best_combo: number;
};

// HowToFish typ pro žebříček — jeden řádek na hráče (viz getLeaderboard).
export type LeaderboardEntry = {
  steamId: string;
  nickname: string;
  score: number;
  round: number;
  createdAt: string;
};

export type FishSuggestionType = "fish" | "creature" | "boss" | "other";

// Payload uložený do records.data pro collection "fish_suggestions" —
// záměrně minimální, žádné rarity/cena/lokace navíc (to řeší admin/research).
export type FishSuggestionData = {
  name: string;
  type: FishSuggestionType;
  location: string;
  steam_id: string;
  nickname: string;
  note?: string;
  rights_confirmed: true;
};

// HowToFish typ pro UI — pending návrh, který vidí jen jeho autor.
export type FishSuggestion = {
  id: number;
  name: string;
  type: FishSuggestionType;
  location: string;
  steamId: string;
  nickname: string;
  note?: string;
  // Média se nahrává jako druhý krok po vytvoření recordu — při
  // výpadku uploadu může (vzácně) zůstat bez obrázku, viz suggestions.ts.
  image: { id: number; url: string; width?: number; height?: number } | null;
  createdAt: string;
};

// ---------------------------------------------------------------------
// Jednotný komunitní content pattern pro /predmety, /bossove, /lokace,
// /navody — společná infrastruktura (viz lib/universal-content-api/
// community.ts), ale jednoduché domain-specific typy, žádný jeden obří
// generický typ pro všechno. Každá sekce skládá veřejnou tabulku ze dvou
// zdrojů: `source: "curated"` (data/*.ts, autor "HowToFish.cz") a
// `source: "community"` (UCA approved records, autor Steam nickname).
export type ContentSource = "curated" | "community";

export type CommunityContentBase = {
  id: string;
  title: string;
  imageUrl?: string;
  authorName: string;
  source: ContentSource;
  // true jen pro soukromý řádek "tvůj vlastní pending návrh" — nikdy pro
  // curated/approved. Viz getMyPendingX() v jednotlivých domain modulech.
  pending?: boolean;
};

export type ItemEntry = CommunityContentBase & {
  itemType?: string;
  obtainedAt?: string;
  use?: string;
};

export type BossEntry = CommunityContentBase & {
  location?: string;
  howToFind?: string;
  tip?: string;
  // Curated bossové mají detail na /ryby/[slug] (fish.ts) — u community
  // návrhů detail zatím neexistuje.
  detailHref?: string;
};

export type LocationEntry = CommunityContentBase & {
  island?: string;
  notableThings?: string;
  note?: string;
};

export type GuideEntry = CommunityContentBase & {
  slug: string;
  category?: string;
  summary?: string;
  content?: string;
};

// Payloady ukládané do records.data pro *_suggestions collections.
// `kind: "new"` = návrh nového záznamu, `kind: "correction"` = návrh
// opravy existujícího (curated i community) záznamu — obě varianty žijí
// ve STEJNÉ collection dané domény, admin je rozliší podle `kind` ve
// Filamentu. Correction záznamy se nikdy nemapují do veřejné/pending
// tabulky (nemají vlastní "title" ve stejném smyslu), viz komentáře u
// jednotlivých mapRecordToX funkcí.
export type CorrectionSuggestionData = {
  kind: "correction";
  target: string;
  proposed_changes: string;
  steam_id: string;
  nickname: string;
  note?: string;
  rights_confirmed: true;
};

export type ItemSuggestionData = {
  kind: "new";
  name: string;
  item_type?: string;
  obtained_at?: string;
  use?: string;
  steam_id: string;
  nickname: string;
  note?: string;
  rights_confirmed: true;
};

export type BossSuggestionData = {
  kind: "new";
  name: string;
  location?: string;
  how_to_find?: string;
  tip?: string;
  steam_id: string;
  nickname: string;
  note?: string;
  rights_confirmed: true;
};

export type LocationSuggestionData = {
  kind: "new";
  name: string;
  island?: string;
  notable_things?: string;
  note?: string;
  steam_id: string;
  nickname: string;
  rights_confirmed: true;
};

export type GuideSuggestionData = {
  kind: "new";
  title: string;
  category?: string;
  summary: string;
  content: string;
  steam_id: string;
  nickname: string;
  note?: string;
  rights_confirmed: true;
};

// ---------------------------------------------------------------------
// Promotions (banner / seller) — admin-spravovaný obsah z UCA, žádný
// pending/approve flow (admin je důvěryhodný zdroj, `active` je jejich
// vlastní on/off přepínač). Typ žije tady (ne v promotions.ts, který má
// "server-only") — CharacterCallout je "use client" a potřebuje
// PromotionEntry jako typ pro prop, viz app/components/CharacterCallout.tsx.
export type PromotionPlacement = "banner" | "seller";

export type PromotionEntry = {
  id: string;
  placement: PromotionPlacement;
  pagePattern: string;
  title: string;
  bodyHtml?: string;
  ctaLabel?: string;
  href?: string;
  imageUrl?: string;
  weight: number;
};
