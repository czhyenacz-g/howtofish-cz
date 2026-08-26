// Čistá herní logika Krabí invaze — žádné React/DOM/timery, jen state
// -> state transformace. Komponenta (CrabRushGame.tsx) tohle volá z
// requestAnimationFrame smyčky a z click handlerů. Testováno bez DOM.

export type CrabState = {
  id: number;
  hp: number;
  maxHp: number;
  x: number; // 0–100, % šířky trati
  y: number; // 0–100, % výšky trati (vertikální "dráha")
  yTarget: number; // kam se y plynule blíží (viz tickMovement), ne teleport
  verticalShiftsUsed: number; // kolik z MAX_VERTICAL_SHIFTS už krab využil
  baseSpeed: number; // % trati za sekundu při normální rychlosti
  slowUntil: number; // timestamp (ms), do kdy je krab zpomalený
  hitAt: number | null; // timestamp posledního zásahu (pro hit/die animaci)
  dying: boolean;
  escaping: boolean; // krab dosáhl moře — mizí (potápí se), ne okamžitě
  escapedAt: number | null; // timestamp, kdy začalo potápění (pro submerge animaci)
};

export type GameStatus = "idle" | "playing" | "round-transition" | "game-over";

export type GameState = {
  status: GameStatus;
  round: number;
  roundTimeLeft: number; // sekundy
  lives: number;
  score: number;
  combo: number;
  bestCombo: number;
  kills: number;
  escapesThisRound: number;
  crabs: CrabState[];
  nextCrabId: number;
};

export const MAX_LIVES = 3;
export const ROUND_SECONDS = 30;
export const TRACK_END_X = 100;
export const HIT_SLOW_MS = 400;
export const HIT_SLOW_FACTOR = 0.5;
export const DEATH_ANIM_MS = 450;
export const SUBMERGE_ANIM_MS = 750;
// Krab se "potápí" o kousek před koncem trati, ať zůstane viditelný,
// dokud nezmizí (na TRACK_END_X by byl hned za okrajem ořezané plochy).
const SUBMERGE_X = TRACK_END_X - 6;
export const ROUND_TRANSITION_MS = 1800;

const BASE_SPEED = 9; // % trati za sekundu v kole 1
const BASE_SPAWN_INTERVAL_MS = 1400;

// Vertikální "bloudění" po cestě — krab už nejde jen rovně, ale max
// MAX_VERTICAL_SHIFTS-krát během cesty plynule (ne teleportem) změní
// dráhu nahoru/dolů. VERTICAL_SHIFT_CHECKPOINTS jsou hranice ušlé
// vzdálenosti (x), na kterých se vylosuje nový cíl; jeho počet =
// MAX_VERTICAL_SHIFTS. Výchylka od aktuální dráhy je omezená
// (VERTICAL_SHIFT_MAX_DELTA), ať krab nikdy neskočí přes celou šířku
// trati najednou — jen "kousek nahoru nebo dolů".
export const CRAB_Y_MIN = 10;
export const CRAB_Y_MAX = 85;
export const VERTICAL_SHIFT_CHECKPOINTS = [33, 66];
export const MAX_VERTICAL_SHIFTS = VERTICAL_SHIFT_CHECKPOINTS.length;
export const VERTICAL_SHIFT_MAX_DELTA = 15;
export const VERTICAL_LERP_SPEED = 40; // % výšky trati za sekundu, jak rychle se y blíží k yTarget

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Přiblíží `current` k `target` maximálně o `maxDelta`, nikdy nepřestřelí.
function moveToward(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(target, current + maxDelta);
  if (current > target) return Math.max(target, current - maxDelta);
  return current;
}

// Výchozí vertikální dráha při spawnu — stejné rozmístění do 5 "pruhů"
// jako dřív (bývalé laneY v CrabRushGame.tsx), teď jen jako VÝCHOZÍ bod
// cesty, ne fixní dráha navždy.
function initialCrabY(id: number): number {
  return 12 + ((id * 37) % 5) * 17;
}

export function initialGameState(): GameState {
  return {
    status: "idle",
    round: 1,
    roundTimeLeft: ROUND_SECONDS,
    lives: MAX_LIVES,
    score: 0,
    combo: 0,
    bestCombo: 0,
    kills: 0,
    escapesThisRound: 0,
    crabs: [],
    nextCrabId: 1,
  };
}

export function startGame(): GameState {
  return { ...initialGameState(), status: "playing" };
}

// Kombo násobič — 5 zabití bez missclicku -> x2, 10 -> x3.
export function comboMultiplier(combo: number): number {
  if (combo >= 10) return 3;
  if (combo >= 5) return 2;
  return 1;
}

// Kolo 1: 2–3 HP (snazší start). Kolo 2+: 2–4 HP.
export function randomCrabHp(round: number, rand: () => number = Math.random): number {
  const max = round <= 1 ? 3 : 4;
  return 2 + Math.floor(rand() * (max - 2 + 1));
}

export type RoundConfig = { speed: number; spawnIntervalMs: number; maxCrabs: number };

// Deterministické, pozvolné škálování podle čísla kola — kolo 1–2
// snadné, 3–5 napínavé, další těžší. Žádný exponenciální růst.
export function roundConfig(round: number): RoundConfig {
  const speed = BASE_SPEED * (1 + (round - 1) * 0.12);
  const spawnIntervalMs = Math.max(450, BASE_SPAWN_INTERVAL_MS - (round - 1) * 120);
  const maxCrabs = Math.min(3 + Math.floor(round / 2), 8);
  return { speed, spawnIntervalMs, maxCrabs };
}

export function spawnCrab(state: GameState, now: number, rand: () => number = Math.random): GameState {
  if (state.status !== "playing") return state;
  const config = roundConfig(state.round);
  if (state.crabs.length >= config.maxCrabs) return state;

  const hp = randomCrabHp(state.round, rand);
  const y = initialCrabY(state.nextCrabId);
  const crab: CrabState = {
    id: state.nextCrabId,
    hp,
    maxHp: hp,
    x: 0,
    y,
    yTarget: y,
    verticalShiftsUsed: 0,
    baseSpeed: config.speed,
    slowUntil: 0,
    hitAt: null,
    dying: false,
    escaping: false,
    escapedAt: null,
  };
  return { ...state, crabs: [...state.crabs, crab], nextCrabId: state.nextCrabId + 1 };
}

/**
 * Posune kraby, detekuje úniky do moře (x >= TRACK_END_X) -> odebere
 * život hned (herní důsledek), ale krab sám nezmizí okamžitě — přejde
 * do "escaping" a doběhne (tickDeaths) až po SUBMERGE_ANIM_MS, ať je
 * vidět, jak se potápí, ne že zmizí ze scény ze zlomku vteřiny na nulu.
 */
export function tickMovement(
  state: GameState,
  now: number,
  deltaSeconds: number,
  rand: () => number = Math.random
): GameState {
  if (state.status !== "playing") return state;

  let lives = state.lives;
  let escapesThisRound = state.escapesThisRound;
  const survivors: CrabState[] = [];

  for (const crab of state.crabs) {
    if (crab.dying || crab.escaping) {
      survivors.push(crab);
      continue;
    }
    const slowed = now < crab.slowUntil;
    const speed = slowed ? crab.baseSpeed * HIT_SLOW_FACTOR : crab.baseSpeed;
    const nextX = crab.x + speed * deltaSeconds;
    if (nextX >= TRACK_END_X) {
      lives -= 1;
      escapesThisRound += 1;
      survivors.push({ ...crab, x: SUBMERGE_X, escaping: true, escapedAt: now });
      continue;
    }

    // Na nepoužitém checkpointu se vylosuje nový vertikální cíl v
    // omezené výchylce od AKTUÁLNÍ dráhy (ne od yTarget) — pak se k
    // němu y každý tick plynule přiblíží (moveToward), nikdy teleport.
    let verticalShiftsUsed = crab.verticalShiftsUsed;
    let yTarget = crab.yTarget;
    if (
      verticalShiftsUsed < VERTICAL_SHIFT_CHECKPOINTS.length &&
      nextX >= VERTICAL_SHIFT_CHECKPOINTS[verticalShiftsUsed]
    ) {
      const delta = (rand() * 2 - 1) * VERTICAL_SHIFT_MAX_DELTA;
      yTarget = clamp(crab.y + delta, CRAB_Y_MIN, CRAB_Y_MAX);
      verticalShiftsUsed += 1;
    }
    const y = moveToward(crab.y, yTarget, VERTICAL_LERP_SPEED * deltaSeconds);

    survivors.push({ ...crab, x: nextX, y, yTarget, verticalShiftsUsed });
  }

  const gameOver = lives <= 0;
  return {
    ...state,
    crabs: survivors,
    lives: Math.max(0, lives),
    escapesThisRound,
    status: gameOver ? "game-over" : state.status,
  };
}

/** Odstraní kraby, jejichž "die" nebo "escaping" (potápění) animace už doběhla. */
export function tickDeaths(state: GameState, now: number): GameState {
  const remaining = state.crabs.filter((c) => {
    if (c.dying && c.hitAt !== null && now - c.hitAt > DEATH_ANIM_MS) return false;
    if (c.escaping && c.escapedAt !== null && now - c.escapedAt > SUBMERGE_ANIM_MS) return false;
    return true;
  });
  if (remaining.length === state.crabs.length) return state;
  return { ...state, crabs: remaining };
}

export function tickRoundTimer(state: GameState, deltaSeconds: number): GameState {
  if (state.status !== "playing") return state;
  const roundTimeLeft = state.roundTimeLeft - deltaSeconds;
  if (roundTimeLeft <= 0) {
    return completeRound({ ...state, roundTimeLeft: 0 });
  }
  return { ...state, roundTimeLeft };
}

/** Zásah kraba — vždy +1 bod. Pokud tím umírá, navíc +10×combo multiplier a start "die" animace. */
export function applyHit(state: GameState, crabId: number, now: number): GameState {
  if (state.status !== "playing") return state;
  const crab = state.crabs.find((c) => c.id === crabId);
  if (!crab || crab.dying || crab.escaping) return state;

  const hp = crab.hp - 1;

  if (hp <= 0) {
    const combo = state.combo + 1;
    const multiplier = comboMultiplier(combo);
    const killBonus = 10 * multiplier;
    return {
      ...state,
      crabs: state.crabs.map((c) => (c.id === crabId ? { ...c, hp: 0, dying: true, hitAt: now } : c)),
      score: state.score + 1 + killBonus,
      kills: state.kills + 1,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
    };
  }

  return {
    ...state,
    crabs: state.crabs.map((c) =>
      c.id === crabId ? { ...c, hp, hitAt: now, slowUntil: now + HIT_SLOW_MS } : c
    ),
    score: state.score + 1,
  };
}

/** Klik mimo kraba — nic nezraní, jen resetuje combo. */
export function applyMiss(state: GameState): GameState {
  if (state.status !== "playing") return state;
  if (state.combo === 0) return state;
  return { ...state, combo: 0 };
}

export function roundCompleteBonus(escapesThisRound: number): number {
  return escapesThisRound === 0 ? 150 : 50;
}

export function completeRound(state: GameState): GameState {
  return {
    ...state,
    score: state.score + roundCompleteBonus(state.escapesThisRound),
    status: "round-transition",
  };
}

export function startNextRound(state: GameState): GameState {
  return {
    ...state,
    round: state.round + 1,
    roundTimeLeft: ROUND_SECONDS,
    escapesThisRound: 0,
    crabs: [],
    status: "playing",
  };
}
