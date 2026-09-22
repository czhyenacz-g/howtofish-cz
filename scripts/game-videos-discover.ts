// Ruční YouTube discovery run pro pilotní hry (POC).
//
// Použití:
//   npm run game-videos:discover                    # všechny hry s dotazy, zápis do DB
//   npm run game-videos:discover -- --dry-run       # jen report, nic neukládat
//   npm run game-videos:discover -- --game=minecraft --limit=3
//
// Zapisuje VŽDY jen jako kandidáty (is_approved = false) — nic se
// nepublikuje automaticky, schválení dělá scripts/game-videos-review.ts.
//
// Discovery se nikdy nespouští při renderu stránky: search.list stojí
// 100 kvótních jednotek za volání (denní limit 10 000), takže tenhle
// skript je jediné místo, odkud YouTube voláme.

import { gameEntries } from "../data/games.ts";
import { upsertGameVideos } from "../lib/games/game-videos.ts";
import { discoverVideosForGame, estimateQuotaUnits } from "../lib/games/video-discovery.ts";
import { getVideoQueriesForGame } from "../lib/games/video-queries.ts";
import { PUBLISH_RELEVANCE_SCORE, REVIEW_RELEVANCE_SCORE, isStrongCandidate } from "../lib/games/video-relevance.ts";

function argValue(name: string): string | undefined {
  const hit = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

function formatDate(iso: string): string {
  return iso ? iso.slice(0, 10) : "?";
}

const dryRun = process.argv.includes("--dry-run");
const onlySlug = argValue("game");
const gamesArg = argValue("games");
const batchSlugs = gamesArg
  ? gamesArg
      .split(",")
      .map((slug) => slug.trim())
      .filter(Boolean)
  : undefined;
const topCount = Number(argValue("limit") ?? 5);

const targets = gameEntries.filter(
  (game) =>
    getVideoQueriesForGame(game).length > 0 &&
    (!onlySlug || game.slug === onlySlug) &&
    (!batchSlugs || batchSlugs.includes(game.slug))
);

if (targets.length === 0) {
  console.error(onlySlug ? `Hra "${onlySlug}" nemá kurátorované dotazy.` : "Žádná hra nemá kurátorované dotazy.");
  process.exit(1);
}

if (batchSlugs) {
  const found = new Set(targets.map((game) => game.slug));
  for (const slug of batchSlugs) {
    if (!found.has(slug)) console.warn(`! "${slug}" přeskočeno (neznámá hra nebo bez kurátorovaných dotazů).`);
  }
}

const plannedQueries = targets.reduce((sum, game) => sum + getVideoQueriesForGame(game).length, 0);
console.log(`\n=== YouTube discovery (${dryRun ? "DRY RUN — nic se neukládá" : "zápis kandidátů do DB"}) ===`);
console.log(`Hry (${targets.length}): ${targets.map((game) => game.slug).join(", ")}`);
console.log(`Plánovaná kvóta: ${plannedQueries} dotazů × 100 + ${targets.length}× videos.list ≈ ${estimateQuotaUnits(plannedQueries)} jednotek z 10 000/den\n`);

let totalUnits = 0;
let totalRaw = 0;
let totalDeduped = 0;
let totalCandidates = 0;
let totalStrong = 0;
let quotaBlockedGames: string[] = [];
let skippedGames: string[] = [];

for (const game of targets) {
  if (quotaBlockedGames.length > 0) {
    // Vyčerpaný denní limit search.list — další hry by jen zbytečně
    // narazily na stejnou chybu, takže run končí tady.
    skippedGames.push(game.slug);
    continue;
  }

  const result = await discoverVideosForGame(game);
  if (result.quotaExceeded) quotaBlockedGames.push(game.slug);
  totalUnits += estimateQuotaUnits(result.queries.length);
  totalRaw += result.rawCount;
  totalDeduped += result.dedupedCount;
  totalCandidates += result.candidates.length;

  const scores = result.candidates.map((candidate) => candidate.relevanceScore);
  const strong = scores.filter((score) => isStrongCandidate(score)).length;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  totalStrong += strong;

  console.log(`— ${game.name} (${game.slug})`);
  console.log(`  dotazy (${result.queries.length}): ${result.queries.join(" | ")}`);
  console.log(
    `  raw ${result.rawCount} → deduplikováno ${result.dedupedCount} → kandidátů ${result.candidates.length} (z toho strong ${strong})`
  );
  console.log(`  skóre: max ${maxScore}, průměr ${avgScore}, prahy review ${REVIEW_RELEVANCE_SCORE} / publish ${PUBLISH_RELEVANCE_SCORE}`);

  const top = result.candidates.slice(0, topCount);
  if (top.length === 0 && result.rawCount > 0) {
    console.log("  (žádný kandidát neprošel relevančním prahem)");
  }
  if (result.quotaExceeded) {
    console.log("  ! QUOTA: denní limit YouTube search vyčerpán — data téhle hry jsou NEÚPLNÁ.");
  }
  for (const candidate of top) {
    console.log(`  • [${candidate.relevanceScore}]${isStrongCandidate(candidate.relevanceScore) ? " STRONG" : ""} ${candidate.title}`);
    console.log(`    ${candidate.channelTitle} · ${formatDate(candidate.publishedAt)} · https://www.youtube.com/watch?v=${candidate.videoId}`);
    console.log(`    důvod: ${candidate.reasons.join(", ")}`);
  }

  for (const error of result.errors) console.warn(`  ! ${error}`);

  if (!dryRun && result.candidates.length > 0) {
    try {
      const { inserted, updated } = await upsertGameVideos(game.slug, result.candidates);
      console.log(`  → DB: ${inserted} nových, ${updated} aktualizovaných (is_approved = false)`);
    } catch (error) {
      console.error(`  → DB zápis selhal: ${error instanceof Error ? error.message : error}`);
      process.exitCode = 1;
    }
  }
  console.log("");
}

console.log(
  `Celkem: raw ${totalRaw}, po deduplikaci ${totalDeduped}, kandidátů ${totalCandidates} (strong ${totalStrong}), odhad kvóty ~${totalUnits} z 10 000 jednotek/den.`
);

if (quotaBlockedGames.length > 0) {
  console.error(
    `\nBLOCKER: denní limit YouTube search.list („Search Queries per day“) byl vyčerpaný u ${quotaBlockedGames.length} her: ${quotaBlockedGames.join(", ")}.` +
      (skippedGames.length > 0 ? `\nRun se zastavil — tyhle hry se vůbec nezkoušely: ${skippedGames.join(", ")}.` : "") +
      `\nJejich data jsou NEÚPLNÁ — neschvaluj je jako hotové. Zkus to znovu po resetu kvóty (půlnoc PT) nebo použij --games= pro zbývající hry.`
  );
  process.exitCode = 1;
}

console.log(
  dryRun ? "DRY RUN — uložení se přeskočilo.\n" : "Další krok: npm run game-videos:list (schválení přes game-videos:approve <id>).\n"
);
