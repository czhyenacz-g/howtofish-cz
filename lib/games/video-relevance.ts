import { type GameEntry, gameEntries } from "../../data/games.ts";
import { getCuratedNegativeTerms } from "./video-queries.ts";

// Deterministické skórování relevance kandidátního videa (0–100) — žádná
// AI klasifikace, jen pravidla. Cílem je NEPUSTIT do katalogu videa, která
// s rybařením v dané hře nesouvisí, a odstranit IRL/merch false positives.
//
// Pozitivní body (max 95, strop 100):
//   +35  název hry / alias v titulku
//   +30  rybaření v titulku
//   +15  specifický (rybářský) termín hry v titulku — „Luck of the Sea“,
//        „Hunter's Call“, „Old Rod“, „Magikarp“
//   +10  shoda slova z použitého dotazu v titulku
//   +5   název hry jen v popisu (když v titulku není)
//   +5   rybaření jen v popisu (když v titulku není)
//
// Negativní body (kontextové, ne globální blacklist):
//   -30  IRL / „real life“ obsah
//   -30  merch: obchodní signál (unboxing, review, worth the money, $,
//        amazon…) + rybářské „gear“ slovo (lure/bait/rod/reel/tackle) —
//        s výjimkou slov, která jsou specifickým termínem dané hry
//        (typicky „Lure“ = Minecraft enchant)
//   -30  kurátorovaná negativní fráze pro danou hru (viz video-queries.ts)
//   -10  Shorts / video do 60 s
//   -10  kompilace / playlist / „1 hour“
//
// Tvrdé vyřazení (skóre 0):
//   - nikde (titulek, popis ani specifický termín hry) není zmínka o
//     rybaření,
//   - není zmíněná hra,
//   - v titulku je JINÁ hra z našeho katalogu a tahle hra v titulku není.

/** Pod tímhle skóre se kandidát vůbec neukládá (zahodí se). */
export const REVIEW_RELEVANCE_SCORE = 60;
/** Nad tímhle skóre jde o „silného kandidáta“ — NIKOLI o automatické schválení. */
export const PUBLISH_RELEVANCE_SCORE = 70;

/**
 * Silný kandidát = vysoké skóre (= dobrá shoda s hrou i rybařením).
 * Je to jen odvozený odznak pro ruční kontrolu (řazení v CLI), veřejně se
 * zobrazí stejně až po ručním schválení.
 */
export function isStrongCandidate(score: number): boolean {
  return score >= PUBLISH_RELEVANCE_SCORE;
}

/** Projde kandidát základním prahem pro uložení k ruční kontrole? */
export function isRelevantEnough(score: number): boolean {
  return score >= REVIEW_RELEVANCE_SCORE;
}

// Normalizovaně (bez diakritiky, malá písmena) — porovnává se vždy na
// normalizovaném textu, takže "Rybaření" i "rybareni" projdou.
const FISHING_TERMS = [
  "fishing",
  "fish",
  "fisher",
  "angling",
  "angler",
  "fishing rod",
  "rod",
  "bait",
  "rybar",
  "rybolov",
  "ryba",
  "prut",
  "navnad",
];

// Signály IRL obsahu (skutečné rybaření, ne hra).
const IRL_MARKERS = ["real life", "irl", "in real life", "catch and cook"];

// Rybářské „gear“ slovo + obchodní signál = reálná návnada/unboxing, ne hra.
const GEAR_WORDS = ["lure", "bait", "reel", "tackle", "gear", "rod"];
const COMMERCE_MARKERS = [
  "unboxing",
  "unboxed",
  "worth the money",
  "worth it",
  "review",
  "amazon",
  "walmart",
  "aliexpress",
  "buy",
  "price",
  "haul",
  "merch",
  "topwater",
  "$",
];

// Signály nekvalitního/nevhodného formátu — jen snižují skóre.
const COMPILATION_MARKERS = ["compilation", "playlist", "full movie", "1 hour", "all episodes", "megamix"];

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function gameTerms(game: GameEntry): string[] {
  return [game.name, ...(game.aliases ?? [])].map(normalizeText).filter((term) => term.length > 2);
}

/**
 * Specifické (rybářské) termíny hry z `searchKeywords` — vyhazujeme ty,
 * které jsou samy o sobě obecný rybářský výraz („fishing“, „AFK fishing“),
 * aby se nepočítaly dvakrát; zůstávají konkrétní herní pojmy („Luck of the
 * Sea“, „Hunter's Call“, „Old Rod“, „Magikarp“).
 */
function specialTerms(game: GameEntry): string[] {
  return (game.searchKeywords ?? [])
    .map(normalizeText)
    .filter((keyword) => keyword.length > 3 && !FISHING_TERMS.some((fishing) => keyword.includes(fishing)));
}

export type VideoScoringInput = {
  title: string;
  description: string;
  query: string;
  durationSeconds?: number;
};

export type VideoScore = {
  score: number;
  reasons: string[];
  rejected: boolean;
  rejectionReason?: string;
};

export function scoreVideoCandidate(input: VideoScoringInput, game: GameEntry): VideoScore {
  const title = normalizeText(input.title);
  const description = normalizeText(input.description);
  const query = normalizeText(input.query);

  const ownTerms = gameTerms(game);
  const ownSpecialTerms = specialTerms(game);
  // Jiné hry z katalogu — jen dost dlouhé názvy, ať krátké a obecné
  // slovo (např. "Rust") nevyřazuje nesouvisející videa omylem.
  const otherTerms = gameEntries
    .filter((entry) => entry.slug !== game.slug)
    .flatMap(gameTerms)
    .filter((term) => term.length >= 5);

  const gameInTitle = ownTerms.some((term) => title.includes(term));
  const gameInDescription = ownTerms.some((term) => description.includes(term));
  const fishingInTitle = FISHING_TERMS.some((term) => title.includes(term));
  const fishingInDescription = FISHING_TERMS.some((term) => description.includes(term));
  const specialInTitle = ownSpecialTerms.some((term) => title.includes(term));

  if (!fishingInTitle && !fishingInDescription && !specialInTitle) {
    return { score: 0, reasons: [], rejected: true, rejectionReason: "nikde není zmínka o rybaření" };
  }
  if (!gameInTitle && otherTerms.some((term) => title.includes(term))) {
    return { score: 0, reasons: [], rejected: true, rejectionReason: "titulek patří jiné hře z katalogu" };
  }
  if (!gameInTitle && !gameInDescription) {
    return { score: 0, reasons: [], rejected: true, rejectionReason: "nikde není zmínka o hře" };
  }

  const reasons: string[] = [];
  let score = 0;

  if (gameInTitle) {
    score += 35;
    reasons.push("název hry v titulku (+35)");
  } else {
    score += 5;
    reasons.push("název hry jen v popisu (+5)");
  }

  if (fishingInTitle) {
    score += 30;
    reasons.push("rybaření v titulku (+30)");
  } else if (fishingInDescription) {
    score += 5;
    reasons.push("rybaření jen v popisu (+5)");
  }

  if (specialInTitle) {
    score += 15;
    reasons.push("specifický termín hry v titulku (+15)");
  }

  const queryTokens = query
    .split(/\s+/)
    .filter((token) => token.length > 3 && !ownTerms.some((term) => term.includes(token)));
  if (queryTokens.some((token) => title.includes(token))) {
    score += 10;
    reasons.push("shoda s dotazem v titulku (+10)");
  }

  // --- Negativní signály (kontextové) ---
  if (IRL_MARKERS.some((marker) => title.includes(marker))) {
    score -= 30;
    reasons.push("IRL / „real life“ obsah (-30)");
  }

  const gearWord = GEAR_WORDS.find((word) => title.includes(word));
  // Slovo, které je zároveň specifickým termínem hry (Minecraftí „Lure“),
  // se za merch nepovažuje — jinak by filtr zahazoval platná herní videa.
  const gearIsGameTerm = Boolean(gearWord && ownSpecialTerms.some((term) => term.split(/\s+/).includes(gearWord)));
  if (gearWord && !gearIsGameTerm && COMMERCE_MARKERS.some((marker) => title.includes(marker))) {
    score -= 30;
    reasons.push("merch / reálná návnada (-30)");
  }

  const curatedNegative = getCuratedNegativeTerms(game).filter((term) => title.includes(normalizeText(term)));
  if (curatedNegative.length > 0) {
    score -= 30;
    reasons.push(`kurátorovaný negativní termín (${curatedNegative.join(", ")}) (-30)`);
  }

  if (
    /#shorts/.test(title) ||
    (input.durationSeconds !== undefined && input.durationSeconds > 0 && input.durationSeconds <= 60)
  ) {
    score -= 10;
    reasons.push("Shorts / krátké video (-10)");
  }
  if (COMPILATION_MARKERS.some((marker) => title.includes(marker))) {
    score -= 10;
    reasons.push("kompilace/playlist (-10)");
  }

  score = Math.max(0, Math.min(100, score));

  return { score, reasons, rejected: false };
}
