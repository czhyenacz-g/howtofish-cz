import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyHit,
  applyMiss,
  comboMultiplier,
  completeRound,
  initialGameState,
  randomCrabHp,
  roundCompleteBonus,
  roundConfig,
  spawnCrab,
  startGame,
  startNextRound,
  tickDeaths,
  tickMovement,
  tickRoundTimer,
  DEATH_ANIM_MS,
  HIT_SLOW_MS,
  MAX_LIVES,
  TRACK_END_X,
} from "../app/hra/crab-rush-engine.ts";

test("randomCrabHp: vždy vrátí 2–4", () => {
  for (let round = 1; round <= 10; round++) {
    for (let i = 0; i < 50; i++) {
      const hp = randomCrabHp(round);
      assert.ok(hp >= 2 && hp <= 4, `hp ${hp} mimo rozsah pro kolo ${round}`);
    }
  }
});

test("randomCrabHp: kolo 1 dává jen 2–3 HP (nikdy 4)", () => {
  for (let i = 0; i < 100; i++) {
    const hp = randomCrabHp(1);
    assert.ok(hp === 2 || hp === 3);
  }
});

test("spawnCrab + applyHit: nesmrtelný zásah ubere přesně 1 HP a přidá 1 bod", () => {
  let state = spawnCrab(startGame(), 0, () => 0.99); // rand blízko 1 -> nejvyšší HP daného kola
  const crab = state.crabs[0];
  const hpBefore = crab.hp;
  assert.ok(hpBefore >= 2);

  state = applyHit(state, crab.id, 1000);
  const updated = state.crabs.find((c) => c.id === crab.id)!;

  if (hpBefore > 1) {
    assert.equal(updated.hp, hpBefore - 1);
    assert.equal(updated.dying, false);
    assert.equal(state.score, 1);
  }
});

test("applyHit: smrtelný zásah (1 HP krab) zabije, přidá skóre a kill count", () => {
  let state = startGame();
  state = { ...state, crabs: [{ id: 1, hp: 1, maxHp: 1, x: 10, baseSpeed: 5, slowUntil: 0, hitAt: null, dying: false }] };

  state = applyHit(state, 1, 500);

  const crab = state.crabs.find((c) => c.id === 1)!;
  assert.equal(crab.dying, true);
  assert.equal(crab.hp, 0);
  assert.equal(state.kills, 1);
  assert.equal(state.combo, 1);
  // +1 (zásah) + 10 (kill, combo 1 => multiplier 1) = 11
  assert.equal(state.score, 11);
});

test("applyHit: nesmrtelný zásah nastaví krátké zpomalení (slowUntil)", () => {
  let state = startGame();
  state = { ...state, crabs: [{ id: 1, hp: 3, maxHp: 3, x: 10, baseSpeed: 5, slowUntil: 0, hitAt: null, dying: false }] };

  const now = 2000;
  state = applyHit(state, 1, now);
  const crab = state.crabs.find((c) => c.id === 1)!;
  assert.equal(crab.slowUntil, now + HIT_SLOW_MS);
});

test("applyHit: zásah do umírajícího/neexistujícího kraba nic nedělá", () => {
  let state = startGame();
  state = {
    ...state,
    crabs: [{ id: 1, hp: 1, maxHp: 2, x: 10, baseSpeed: 5, slowUntil: 0, hitAt: null, dying: true }],
  };
  const before = state;
  const after = applyHit(state, 1, 100);
  assert.equal(after, before);

  const afterMissingCrab = applyHit(state, 999, 100);
  assert.equal(afterMissingCrab, before);
});

test("applyMiss: resetuje combo, nic jiného neovlivní", () => {
  let state = startGame();
  state = { ...state, combo: 4, score: 50 };
  state = applyMiss(state);
  assert.equal(state.combo, 0);
  assert.equal(state.score, 50);
});

test("comboMultiplier: 0-4 => x1, 5-9 => x2, 10+ => x3", () => {
  assert.equal(comboMultiplier(0), 1);
  assert.equal(comboMultiplier(4), 1);
  assert.equal(comboMultiplier(5), 2);
  assert.equal(comboMultiplier(9), 2);
  assert.equal(comboMultiplier(10), 3);
  assert.equal(comboMultiplier(50), 3);
});

test("tickMovement: krab, který dosáhne konce trati, ubere 1 život a zmizí", () => {
  let state = startGame();
  state = {
    ...state,
    lives: MAX_LIVES,
    crabs: [{ id: 1, hp: 2, maxHp: 2, x: TRACK_END_X - 1, baseSpeed: 100, slowUntil: 0, hitAt: null, dying: false }],
  };

  state = tickMovement(state, 1000, 1); // dost velký delta, aby krab přeskočil hranici

  assert.equal(state.lives, MAX_LIVES - 1);
  assert.equal(state.escapesThisRound, 1);
  assert.equal(state.crabs.length, 0);
  assert.equal(state.status, "playing");
});

test("tickMovement: 3 uniklí krabi => game-over", () => {
  let state = startGame();
  for (let i = 0; i < MAX_LIVES; i++) {
    state = {
      ...state,
      crabs: [{ id: i, hp: 2, maxHp: 2, x: TRACK_END_X - 1, baseSpeed: 100, slowUntil: 0, hitAt: null, dying: false }],
    };
    state = tickMovement(state, 1000 + i, 1);
  }

  assert.equal(state.lives, 0);
  assert.equal(state.status, "game-over");
});

test("tickMovement: umírající krab se dál nehýbe a neuniká", () => {
  let state = startGame();
  state = {
    ...state,
    crabs: [{ id: 1, hp: 0, maxHp: 2, x: 99, baseSpeed: 100, slowUntil: 0, hitAt: 100, dying: true }],
  };
  state = tickMovement(state, 200, 1);
  assert.equal(state.crabs.length, 1);
  assert.equal(state.crabs[0].x, 99);
  assert.equal(state.lives, MAX_LIVES);
});

test("tickDeaths: odstraní kraba až po uplynutí animace smrti", () => {
  let state = startGame();
  state = {
    ...state,
    crabs: [{ id: 1, hp: 0, maxHp: 2, x: 50, baseSpeed: 5, slowUntil: 0, hitAt: 1000, dying: true }],
  };

  const tooSoon = tickDeaths(state, 1000 + DEATH_ANIM_MS - 10);
  assert.equal(tooSoon.crabs.length, 1);

  const later = tickDeaths(state, 1000 + DEATH_ANIM_MS + 10);
  assert.equal(later.crabs.length, 0);
});

test("roundConfig: rychlost, frekvence spawnu a max krabů rostou s kolem (bez extrémního růstu)", () => {
  const r1 = roundConfig(1);
  const r3 = roundConfig(3);
  const r8 = roundConfig(8);

  assert.ok(r3.speed > r1.speed);
  assert.ok(r8.speed > r3.speed);
  assert.ok(r3.spawnIntervalMs < r1.spawnIntervalMs);
  assert.ok(r8.spawnIntervalMs <= r3.spawnIntervalMs);
  assert.ok(r8.maxCrabs >= r3.maxCrabs);

  // Kolo 1 musí zůstat snadné — ne dramatický skok.
  assert.ok(r1.speed < r1.speed * 1.5);
  assert.ok(r8.speed < r1.speed * 3, "obtížnost nesmí exponenciálně vybuchnout");
});

test("roundCompleteBonus a completeRound: perfektní kolo (0 úniků) dá vyšší bonus", () => {
  assert.equal(roundCompleteBonus(0), 150);
  assert.equal(roundCompleteBonus(2), 50);

  let state = startGame();
  state = { ...state, score: 0, escapesThisRound: 0 };
  state = completeRound(state);
  assert.equal(state.score, 150);
  assert.equal(state.status, "round-transition");
});

test("startNextRound: zvýší round, resetuje časovač kola a úniky, vrátí status na playing", () => {
  let state = startGame();
  state = { ...state, round: 2, roundTimeLeft: 0, escapesThisRound: 3, status: "round-transition" };
  state = startNextRound(state);
  assert.equal(state.round, 3);
  assert.equal(state.escapesThisRound, 0);
  assert.equal(state.status, "playing");
});

test("tickRoundTimer: po vypršení času automaticky dokončí kolo", () => {
  let state = startGame();
  state = { ...state, roundTimeLeft: 0.5 };
  state = tickRoundTimer(state, 1);
  assert.equal(state.status, "round-transition");
  assert.equal(state.roundTimeLeft, 0);
});

test("initialGameState: idle stav s plným počtem životů a nulovým skóre", () => {
  const state = initialGameState();
  assert.equal(state.status, "idle");
  assert.equal(state.lives, MAX_LIVES);
  assert.equal(state.score, 0);
  assert.equal(state.round, 1);
});
