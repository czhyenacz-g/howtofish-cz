import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getGameBySlug } from "../data/games.ts";
import { getCuratedNegativeTerms, getGamesWithVideoQueries } from "../lib/games/video-queries.ts";
import {
  PUBLISH_RELEVANCE_SCORE,
  REVIEW_RELEVANCE_SCORE,
  isRelevantEnough,
  isStrongCandidate,
  normalizeText,
  scoreVideoCandidate,
} from "../lib/games/video-relevance.ts";

const minecraft = getGameBySlug("minecraft")!;
const stardew = getGameBySlug("stardew-valley")!;
const seaOfThieves = getGameBySlug("sea-of-thieves")!;
const pokemon = getGameBySlug("pokemon-brilliant-diamond-shining-pearl")!;

function score(title: string, description: string, query: string, durationSeconds?: number) {
  return scoreVideoCandidate({ title, description, query, durationSeconds }, minecraft);
}

function scorePokemon(title: string, query = "Pokemon fishing") {
  return scoreVideoCandidate({ title, description: "", query }, pokemon);
}

describe("video-relevance — tvrdé vyřazení", () => {
  test("video bez zmínky o rybaření neprojde (i když je o správné hře)", () => {
    const result = score("Minecraft survival episode 5", "Building a castle in Minecraft", "Minecraft fishing");
    assert.equal(result.rejected, true);
    assert.match(result.rejectionReason ?? "", /rybaření/);
    assert.equal(result.score, 0);
  });

  test("video o jiné hře neprojde, i když jde o rybaření", () => {
    const result = score("Fortnite fishing challenge", "", "Minecraft fishing");
    assert.equal(result.rejected, true);
    assert.match(result.rejectionReason ?? "", /jiné hře/);
  });

  test("video o správné hře i rybaření projde (jiná hra v titulku + naše taky)", () => {
    const result = score("Minecraft vs Fortnite fishing battle", "", "Minecraft fishing");
    assert.equal(result.rejected, false);
  });

  test("video bez zmínky o hře neprojde", () => {
    const result = score("Jak chytit kapra", "Rybářský návod", "Minecraft fishing");
    assert.equal(result.rejected, true);
    assert.match(result.rejectionReason ?? "", /hře/);
  });
});

describe("video-relevance — IRL / merch false positives", () => {
  // Skutečné false positives z auditu (kanály o reálném rybaření s Pokémon
  // návnadami) — všechny musí spadnout pod reviewThreshold.
  const irlFalsePositives = [
    { title: "$100 POKEMON FISHING Lure CHALLENGE (TOPWATER!)", query: "Pokemon fishing challenge" },
    { title: "Is The PIKACHU LURE Worth The Money?!? (Pokemon Fishing Challenge)", query: "Pokemon fishing" },
    { title: "The Legendary Fishing Lure #pokemon #kyogre #fishing", query: "Pokemon fishing" },
    { title: "100 Baits In 100 Days - Day 31: Duo Pikachu Pokemon lure #fishing #pokemon", query: "Pokemon fishing" },
    { title: "INSANE Pokémon Fishing Lure Challenge 🎣", query: "Pokemon fishing" },
    { title: "🤯🤯 Super Rod ultra rare #cartaspokemon #pokemon #pokemontcg #shortsvideo", query: "Pokemon Super Rod" },
  ];

  for (const { title, query } of irlFalsePositives) {
    test(`IRL/merch video neprojde: "${title.slice(0, 48)}…"`, () => {
      const result = scorePokemon(title, query);
      assert.equal(result.rejected, false, "nemá se tvrdě vyřadit, jen spadnout pod prahem");
      assert.ok(result.score < REVIEW_RELEVANCE_SCORE, `skóre ${result.score} mělo být pod ${REVIEW_RELEVANCE_SCORE}`);
      assert.match(result.reasons.join(", "), /merch|kurátorovaný negativní/);
    });
  }

  test("„real life“ fishing challenge je penalizovaný", () => {
    const result = score("Minecraft fishing challenge in real life", "", "Minecraft fishing");
    assert.ok(result.score < REVIEW_RELEVANCE_SCORE);
    assert.match(result.reasons.join(", "), /IRL/);
  });

  test("Minecraft „Lure“ (validní enchant) se za merch NEPOVAŽUJE", () => {
    const result = score("Minecraft Fishing Lure Enchant - Is It Worth It?", "", "Minecraft Luck of the Sea");
    assert.equal(result.rejected, false);
    assert.doesNotMatch(result.reasons.join(", "), /merch/);
    assert.ok(result.score >= REVIEW_RELEVANCE_SCORE, `skóre ${result.score} nemělo spadnout pod prahem`);
  });

  test("unboxing + gear slovo je penalizovaný i mimo Pokémona", () => {
    const result = score("Minecraft fishing rod unboxing and review", "", "Minecraft fishing");
    assert.match(result.reasons.join(", "), /merch/);
  });
});

describe("video-relevance — skóre a prahy", () => {
  test("ideální video (hra + rybaření v titulku) projde prahem", () => {
    const result = score("Minecraft fishing guide", "", "Minecraft fishing");
    assert.equal(result.rejected, false);
    assert.equal(result.score, 75);
    assert.ok(isRelevantEnough(result.score));
    assert.match(result.reasons.join(", "), /název hry v titulku/);
    assert.match(result.reasons.join(", "), /rybaření v titulku/);
  });

  test("specifický herní termín (Luck of the Sea) přidá body a stačí i bez slova 'fishing'", () => {
    const result = score("Minecraft Luck of the Sea", "", "Minecraft Luck of the Sea");
    assert.equal(result.rejected, false);
    assert.equal(result.score, 60);
    assert.ok(isRelevantEnough(result.score));
  });

  test("rybaření jen v popisu skončí hluboko pod prahem", () => {
    const result = score("Survival episode 5", "Minecraft fishing in this episode", "Minecraft fishing");
    assert.equal(result.rejected, false);
    assert.ok(result.score < REVIEW_RELEVANCE_SCORE, `skóre ${result.score} mělo být pod prahem`);
  });

  test("dva prahy: reviewThreshold a publishThreshold", () => {
    assert.equal(REVIEW_RELEVANCE_SCORE, 60);
    assert.equal(PUBLISH_RELEVANCE_SCORE, 70);
    assert.equal(isRelevantEnough(REVIEW_RELEVANCE_SCORE - 1), false);
    assert.equal(isRelevantEnough(REVIEW_RELEVANCE_SCORE), true);
    assert.equal(isStrongCandidate(PUBLISH_RELEVANCE_SCORE - 1), false);
    assert.equal(isStrongCandidate(PUBLISH_RELEVANCE_SCORE), true);
  });

  test("silný kandidát se označí podle skóre (silné = 70+)", () => {
    assert.equal(isStrongCandidate(score("Minecraft fishing guide", "", "Minecraft fishing").score), true);
    assert.equal(
      isStrongCandidate(score("Survival episode 5", "Minecraft fishing in this episode", "Minecraft fishing").score),
      false
    );
  });

  test("Shorts / krátká videa dostanou penalizaci -10", () => {
    const normal = score("Minecraft fishing", "", "Minecraft fishing");
    const tagged = score("Minecraft fishing #shorts", "", "Minecraft fishing");
    const shortVideo = score("Minecraft fishing", "", "Minecraft fishing", 45);
    assert.equal(normal.score - tagged.score, 10);
    assert.equal(normal.score - shortVideo.score, 10);
    assert.match(tagged.reasons.join(", "), /Shorts/);
  });

  test("kompilace/playlist dostane penalizaci", () => {
    const result = score("Minecraft fishing compilation 1 hour", "", "Minecraft fishing");
    assert.ok(result.score < 75);
    assert.match(result.reasons.join(", "), /kompilace/);
  });

  test("skóre se drží v rozmezí 0–100", () => {
    const result = score("Minecraft fishing guide", "Minecraft fishing Luck of the Sea", "Minecraft fishing guide");
    assert.ok(result.score >= 0 && result.score <= 100);
  });

  test("jiná hra než Minecraft má vlastní kontext (Stardew/SOT termíny)", () => {
    const stardewResult = scoreVideoCandidate(
      { title: "Stardew Valley legendary fish", description: "", query: "Stardew legendary fish" },
      stardew
    );
    assert.equal(stardewResult.rejected, false);
    assert.ok(isRelevantEnough(stardewResult.score));

    const sotResult = scoreVideoCandidate(
      { title: "Sea of Thieves Hunter's Call fishing", description: "", query: "Sea of Thieves Hunter's Call" },
      seaOfThieves
    );
    assert.equal(sotResult.rejected, false);
    assert.ok(isRelevantEnough(sotResult.score));
  });

  test("legitimní herní video o rybářských prutech u Pokémonů penalizované není", () => {
    const result = scorePokemon("How To Get The SUPER ROD In Pokemon Fire Red & Leaf Green", "Pokemon Super Rod");
    assert.equal(result.rejected, false);
    assert.doesNotMatch(result.reasons.join(", "), /merch/);
    assert.ok(isRelevantEnough(result.score));
  });

  test("normalizeText odstraní diakritiku a sjednotí casing", () => {
    assert.equal(normalizeText("Rybaření v Minecraftu"), "rybareni v minecraftu");
  });
});

describe("video-relevance — druhá vlna her (specifická herní terminologie)", () => {
  const game = (slug: string) => getGameBySlug(slug)!;
  const check = (slug: string, title: string, query: string, description = "") =>
    scoreVideoCandidate({ title, description, query }, game(slug));

  test("Fishing Planet projde bez dvojitého požadavku „fishing fishing“ (název hry ho obsahuje)", () => {
    const result = check("fishing-planet", "Fishing Planet", "Fishing Planet");
    assert.equal(result.rejected, false);
    assert.ok(isRelevantEnough(result.score), `skóre ${result.score}`);
    // název hry sám nese rybářský signál, další slovo není potřeba
    assert.match(result.reasons.join(", "), /rybaření v titulku/);
  });

  test("Fishing Planet guide projde jako silný kandidát", () => {
    const result = check("fishing-planet", "Fishing Planet - Beginners Guide", "Fishing Planet guide");
    assert.equal(result.rejected, false);
    assert.ok(isStrongCandidate(result.score), `skóre ${result.score}`);
  });

  test("FFXIV Fisher job i Ocean Fishing jsou relevantní", () => {
    const fisher = check("final-fantasy-xiv", "FFXIV Fisher Job Guide - How To Level Fast", "FFXIV fisher guide");
    assert.equal(fisher.rejected, false);
    assert.ok(isRelevantEnough(fisher.score), `skóre ${fisher.score}`);

    const ocean = check("final-fantasy-xiv", "FFXIV Ocean Fishing Guide - All Rewards", "FFXIV ocean fishing");
    assert.equal(ocean.rejected, false);
    assert.ok(isStrongCandidate(ocean.score), `skóre ${ocean.score}`);
  });

  test("WoW fishing profession projde (i pod zkratkou WoW)", () => {
    const result = check("world-of-warcraft", "WoW Classic Fishing Guide 1-300", "WoW fishing");
    assert.equal(result.rejected, false);
    assert.ok(isRelevantEnough(result.score), `skóre ${result.score}`);
  });

  test("OSRS fishing skill projde (i pod zkratkou OSRS)", () => {
    const result = check("old-school-runescape", "OSRS 1-99 Fishing Guide - Fastest Methods", "OSRS fishing guide");
    assert.equal(result.rejected, false);
    assert.ok(isRelevantEnough(result.score), `skóre ${result.score}`);
  });

  test("Terraria Angler quest je relevantní", () => {
    const result = check("terraria", "Terraria Angler Quest Guide - All Rewards", "Terraria Angler quests");
    assert.equal(result.rejected, false);
    assert.ok(isRelevantEnough(result.score), `skóre ${result.score}`);
  });

  test("Fallout 76 Gone Fission fishing projde a „Gone Fission“ je uznaný termín", () => {
    const result = check("fallout-76", "Fallout 76 Gone Fission Update - Everything New", "Fallout 76 Gone Fission fishing");
    assert.equal(result.rejected, false);
    assert.match(result.reasons.join(", "), /specifický termín hry/);
    assert.ok(isRelevantEnough(result.score), `skóre ${result.score}`);
  });

  test("No Man's Sky Aquarius fishing projde a „Aquarius“ je uznaný termín", () => {
    const result = check("no-mans-sky", "No Man's Sky Aquarius Update - Everything New", "No Man's Sky Aquarius fishing");
    assert.equal(result.rejected, false);
    assert.match(result.reasons.join(", "), /specifický termín hry/);
    assert.ok(isRelevantEnough(result.score), `skóre ${result.score}`);
  });

  test("Warframe spear fishing je relevantní", () => {
    const result = check("warframe", "Warframe Spear Fishing Guide - Plains of Eidolon", "Warframe spear fishing");
    assert.equal(result.rejected, false);
    assert.ok(isStrongCandidate(result.score), `skóre ${result.score}`);
  });

  test("Warframe obecné combat video neprojde", () => {
    const result = check("warframe", "Warframe - Best Weapon Builds 2026", "Warframe fishing");
    assert.equal(result.rejected, true);
    assert.match(result.rejectionReason ?? "", /rybaření/);
  });

  test("Palia fishing guide i rare fish projdou", () => {
    for (const [title, query] of [
      ["Palia Fishing Guide For Beginners", "Palia fishing guide"],
      ["Palia - Where To Catch Every Rare Fish", "Palia rare fish"],
    ] as const) {
      const result = check("palia", title, query);
      assert.equal(result.rejected, false, title);
      assert.ok(isRelevantEnough(result.score), `${title}: ${result.score}`);
    }
  });

  test("DREDGE: fishing video projde, obecné video bez fishing signálu ne", () => {
    const fishing = check("dredge", "DREDGE Aberrations Fishing Guide", "DREDGE fishing guide");
    assert.equal(fishing.rejected, false);
    assert.ok(isRelevantEnough(fishing.score), `skóre ${fishing.score}`);

    // „Aberrations“ je u DREDGE uznaný rybářský termín (je to mutated fish).
    const aberrations = check("dredge", "DREDGE - How To Catch All Aberrations", "DREDGE rare fish");
    assert.equal(aberrations.rejected, false, "aberrations = fishing signál");

    // Ale čistě příběhové video bez jakéhokoli rybářského signálu se vyřadí.
    const story = check("dredge", "DREDGE - Story Ending Explained (No Spoilers)", "DREDGE fishing");
    assert.equal(story.rejected, true);
    assert.match(story.rejectionReason ?? "", /rybaření/);
  });

  test("nové hry nemají vlastní negativní termíny bez důkazu (žádný preventivní blacklist)", () => {
    for (const slug of getGamesWithVideoQueries()) {
      if (slug === "pokemon-brilliant-diamond-shining-pearl") continue;
      assert.deepEqual(getCuratedNegativeTerms({ slug }), [], `${slug}: nečekaný negativní termín`);
    }
  });
});
