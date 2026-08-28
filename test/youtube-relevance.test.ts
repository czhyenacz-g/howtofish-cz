import { test } from "node:test";
import assert from "node:assert/strict";
import { looksRelevant } from "../lib/streams/youtube.ts";

// Regresní test — dřív byly tyhle DVĚ SKUTEČNÉ, reálně použité titulky
// (viz data/creator-videos.ts) tímhle filtrem tiše zahazovány, protože
// neobsahovaly žádné z anglických buzzwords (gameplay/steam/co-op/...),
// jen samotný název hry + český text. Ověřeno přímo na produkčním
// YouTube API klíči (search.list vrátil validní výsledky, ale
// looksRelevant() by je i tak vyřadil) před opravou.
test("looksRelevant: skutečné CZ streamer titulky (Agraelus, Herdyn) jsou relevantní", () => {
  assert.equal(looksRelevant("JAK JSEM SE STAL RYBÁŘEM | HOW TO FISH | #1 | 21.8.2026", ""), true);
  assert.equal(
    looksRelevant(
      "RYBÁŘSKÉ FINÁLE 🎣🏆 | How to Fish | #02 | 27.08.2026 | @Herdyn @FlyGunCZ @freeze_lol @HaiseT",
      ""
    ),
    true
  );
});

test("looksRelevant: generický český živý titulek bez anglických buzzwords je relevantní", () => {
  assert.equal(looksRelevant("🔴 ŽIVĚ: How to Fish s kamarády", "Hrajeme How to Fish, pojď se podívat!"), true);
});

test("looksRelevant: anglický titulek s herními buzzwords zůstává relevantní (beze změny)", () => {
  assert.equal(
    looksRelevant("How to Fish LIVE", "Live gameplay of How to Fish on Steam, co-op with friends"),
    true
  );
});

test("looksRelevant: skutečný rybářský návod (žádná zmínka o hře) zůstává nerelevantní", () => {
  assert.equal(looksRelevant("How to Fish for Bass - Beginner's Guide", "Tackle, rod and reel tips for bass fishing"), false);
  assert.equal(looksRelevant("Fly Fishing Basics", "Learn fly fishing and trout fishing techniques"), false);
});

test("looksRelevant: bez jakékoli zmínky o How to Fish nebo jiného pozitivního slova je nerelevantní", () => {
  assert.equal(looksRelevant("Random unrelated stream", "Just chatting, nothing about any game"), false);
});
