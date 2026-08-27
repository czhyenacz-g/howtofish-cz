import { test } from "node:test";
import assert from "node:assert/strict";
import { getGameStarted, markGameStarted, resetGameStarted, subscribeGameStarted } from "../lib/character-callouts/game-session.ts";

test("game-session: výchozí stav je false", async () => {
  // Modul je singleton (module-level state) — čerstvý import přes query
  // param, ať test nezávisí na pořadí spuštění ostatních testů v tomhle souboru.
  const mod = await import("../lib/character-callouts/game-session.ts?fresh1");
  assert.equal(mod.getGameStarted(), false);
});

test("markGameStarted nastaví true, resetGameStarted zpátky na false", async () => {
  const mod = await import("../lib/character-callouts/game-session.ts?fresh2");
  assert.equal(mod.getGameStarted(), false);
  mod.markGameStarted();
  assert.equal(mod.getGameStarted(), true);
  mod.resetGameStarted();
  assert.equal(mod.getGameStarted(), false);
});

test("markGameStarted je idempotentní — opakované volání nezpůsobí zbytečné notify", async () => {
  const mod = await import("../lib/character-callouts/game-session.ts?fresh3");
  let notifyCount = 0;
  mod.subscribeGameStarted(() => {
    notifyCount++;
  });
  mod.markGameStarted();
  mod.markGameStarted();
  mod.markGameStarted();
  assert.equal(notifyCount, 1, "notify se má zavolat jen při skutečné změně hodnoty");
});

test("resetGameStarted na už false stavu nevolá notify", async () => {
  const mod = await import("../lib/character-callouts/game-session.ts?fresh4");
  let notifyCount = 0;
  mod.subscribeGameStarted(() => {
    notifyCount++;
  });
  mod.resetGameStarted();
  assert.equal(notifyCount, 0);
});

test("subscribeGameStarted: listener se zavolá při každé skutečné změně, unsubscribe ho přestane volat", async () => {
  const mod = await import("../lib/character-callouts/game-session.ts?fresh5");
  const calls: boolean[] = [];
  const unsubscribe = mod.subscribeGameStarted(() => {
    calls.push(mod.getGameStarted());
  });

  mod.markGameStarted();
  assert.deepEqual(calls, [true]);

  unsubscribe();
  mod.resetGameStarted();
  assert.deepEqual(calls, [true], "po unsubscribe se listener už nemá volat");
});

test("getGameStarted/markGameStarted/resetGameStarted fungují nezávisle na typu importu (přímý i re-import)", () => {
  resetGameStarted();
  assert.equal(getGameStarted(), false);
  markGameStarted();
  assert.equal(getGameStarted(), true);
  let notified = false;
  const unsubscribe = subscribeGameStarted(() => {
    notified = true;
  });
  resetGameStarted();
  assert.equal(notified, true);
  unsubscribe();
});
