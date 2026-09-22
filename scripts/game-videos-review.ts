// Ruční schvalování / odmítání kandidátních videí (POC).
//
// Použití:
//   npm run game-videos:list                       # všichni kandidáti
//   npm run game-videos:list -- --strong-only      # jen silní kandidáti (skóre >= publishThreshold)
//   npm run game-videos:list -- --game=minecraft
//   npm run game-videos:approve -- 12              # zobrazit na /games/<slug>
//   npm run game-videos:reject -- 13               # skrýt (zůstává v DB)
//
// Po approve/reject se zkusí on-demand revalidace detailu hry přes interní
// endpoint /api/game-videos/revalidate (vyžaduje GAME_REVALIDATE_SECRET;
// URL lze přebít přes GAME_REVALIDATE_URL, jinak se použije SITE_URL).
// Když secret není nastavený, jen se vypíše poznámka — nic se neděje,
// ISR se obnoví do 10 minut.
//
// Nic se nepublikuje automaticky — do veřejné sekce na detailu hry se
// dostanou jen videa s is_approved = true AND is_active = true.

import { SITE_URL } from "../app/config/site.ts";
import { approveGameVideo, listGameVideoCandidates, rejectGameVideo } from "../lib/games/game-videos.ts";
import { PUBLISH_RELEVANCE_SCORE, isStrongCandidate } from "../lib/games/video-relevance.ts";

function argValue(name: string): string | undefined {
  const hit = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

const [, , command, ...rest] = process.argv;
const idArg = rest.find((arg) => /^\d+$/.test(arg));
const gameSlug = argValue("game");
const limit = Number(argValue("limit") ?? 50);
const strongOnly = process.argv.includes("--strong-only");

function printUsage(): void {
  console.log(`Použití:
  npm run game-videos:list [-- --game=<slug>] [-- --limit=<n>] [-- --strong-only]
  npm run game-videos:approve -- <id>
  npm run game-videos:reject -- <id>`);
}

/** On-demand revalidace detailu hry (best-effort). */
async function revalidateGameDetail(slug: string): Promise<string> {
  const secret = process.env.GAME_REVALIDATE_SECRET;
  if (!secret) {
    return "revalidace přeskočena (GAME_REVALIDATE_SECRET není nastavený) — ISR se obnoví do 10 min";
  }
  const baseUrl = (process.env.GAME_REVALIDATE_URL ?? SITE_URL).replace(/\/$/, "");
  try {
    const response = await fetch(`${baseUrl}/api/game-videos/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ slug }),
    });
    if (!response.ok) return `revalidace selhala (HTTP ${response.status})`;
    return `revalidace odeslána na ${baseUrl}/games/${slug}`;
  } catch (error) {
    return `revalidace selhala: ${error instanceof Error ? error.message : String(error)}`;
  }
}

async function run(): Promise<void> {
  if (command === "list") {
    const all = await listGameVideoCandidates({ gameSlug, limit });
    const candidates = strongOnly ? all.filter((video) => isStrongCandidate(video.relevanceScore)) : all;

    if (candidates.length === 0) {
      console.log(
        strongOnly
          ? `Žádný silný kandidát (skóre >= ${PUBLISH_RELEVANCE_SCORE}). Zkus bez --strong-only.`
          : "Žádní kandidáti. Spusť nejdřív: npm run game-videos:discover"
      );
      return;
    }

    const strong = all.filter((video) => isStrongCandidate(video.relevanceScore)).length;
    console.log(`\nKandidáti (${candidates.length}${strongOnly ? " silných" : `, z toho ${strong} silných (skóre >= ${PUBLISH_RELEVANCE_SCORE})`}):\n`);

    for (const video of candidates) {
      const tier = isStrongCandidate(video.relevanceScore) ? "STRONG" : "normal";
      console.log(`#${video.id} [${video.relevanceScore}] ${tier}${video.isApproved ? " · SCHVÁLENO" : ""} · ${video.gameSlug}`);
      console.log(`   ${video.title}`);
      console.log(`   ${video.channelTitle} · ${video.publishedAt?.slice(0, 10) ?? "?"} · ${video.viewCount ?? "?"} zhlédnutí`);
      console.log(`   dotaz: ${video.searchQuery ?? "?"} · https://www.youtube.com/watch?v=${video.externalId}\n`);
    }
    console.log("Schválení: npm run game-videos:approve -- <id>   Odmítnutí: npm run game-videos:reject -- <id>\n");
    return;
  }

  if (command === "approve" || command === "reject") {
    if (!idArg) {
      printUsage();
      process.exit(1);
    }
    const id = Number(idArg);
    const video = command === "approve" ? await approveGameVideo(id) : await rejectGameVideo(id);
    if (!video) {
      console.error(`Video #${id} nenalezeno.`);
      process.exit(1);
    }

    const revalidation = await revalidateGameDetail(video.gameSlug);
    console.log(
      command === "approve"
        ? `Schváleno: #${video.id} [${video.relevanceScore}] "${video.title}" → /games/${video.gameSlug} (${revalidation}).`
        : `Odmítnuto: #${video.id} "${video.title}" → skryto, ale zůstává v DB kvůli deduplikaci (${revalidation}).`
    );
    return;
  }

  printUsage();
  process.exit(1);
}

run().catch((error) => {
  console.error("Chyba:", error instanceof Error ? error.message : error);
  process.exit(1);
});
