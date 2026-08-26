import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SELLER_CHANCE,
  SELLER_COOLDOWN_MS,
  SELLER_DELAY_MS,
  shouldShowSeller,
  type ShouldShowSellerInput,
} from "../lib/character-callouts/seller-rules.ts";

function baseInput(overrides: Partial<ShouldShowSellerInput> = {}): ShouldShowSellerInput {
  return {
    pathname: "/lokace",
    now: 1_000_000,
    lastShownAt: null,
    shownRoutes: [],
    bannerVisible: false,
    professorVisibility: "hidden",
    chanceRoll: 0, // < SELLER_CHANCE (0.3) => "vyhrál" los, pokud projde přes to všechny ostatní podmínky
    ...overrides,
  };
}

test("konstanty odpovídají zadání (25s delay, 30% šance, 10min cooldown)", () => {
  assert.equal(SELLER_DELAY_MS, 25_000);
  assert.equal(SELLER_CHANCE, 0.3);
  assert.equal(SELLER_COOLDOWN_MS, 10 * 60_000);
});

test("shouldShowSeller: true, když jsou splněné všechny podmínky a los vyjde", () => {
  assert.equal(shouldShowSeller(baseInput()), true);
});

test("shouldShowSeller: false na /hra (seller tam není nikdy povolený)", () => {
  assert.equal(shouldShowSeller(baseInput({ pathname: "/hra" })), false);
});

test("shouldShowSeller: false, když je profesor otevřený (professorVisibility === 'open')", () => {
  assert.equal(shouldShowSeller(baseInput({ professorVisibility: "open" })), false);
});

test("shouldShowSeller: true, když je profesor jen minimalizovaný nebo skrytý (neblokuje)", () => {
  assert.equal(shouldShowSeller(baseInput({ professorVisibility: "minimized" })), true);
  assert.equal(shouldShowSeller(baseInput({ professorVisibility: "hidden" })), true);
});

test("shouldShowSeller: false, když už byl na téhle route v týhle session zobrazený (once per route)", () => {
  assert.equal(shouldShowSeller(baseInput({ shownRoutes: ["/lokace"] })), false);
});

test("shouldShowSeller: jiná route v shownRoutes prodejce neblokuje", () => {
  assert.equal(shouldShowSeller(baseInput({ shownRoutes: ["/ryby"] })), true);
});

test("shouldShowSeller: false, když je poslední zobrazení míň než 10 minut zpátky (cooldown)", () => {
  const lastShownAt = 1_000_000 - (SELLER_COOLDOWN_MS - 1);
  assert.equal(shouldShowSeller(baseInput({ lastShownAt, now: 1_000_000 })), false);
});

test("shouldShowSeller: true, když cooldown právě uplynul (přesná hranice)", () => {
  const now = 1_000_000;
  const lastShownAt = now - SELLER_COOLDOWN_MS;
  assert.equal(shouldShowSeller(baseInput({ lastShownAt, now })), true);
});

test("shouldShowSeller: false, když je viditelný banner", () => {
  assert.equal(shouldShowSeller(baseInput({ bannerVisible: true })), false);
});

test("shouldShowSeller: false, když los nevyjde (chanceRoll >= SELLER_CHANCE)", () => {
  assert.equal(shouldShowSeller(baseInput({ chanceRoll: SELLER_CHANCE })), false);
  assert.equal(shouldShowSeller(baseInput({ chanceRoll: 0.9 })), false);
});

test("shouldShowSeller: true těsně pod hranicí šance", () => {
  assert.equal(shouldShowSeller(baseInput({ chanceRoll: SELLER_CHANCE - 0.0001 })), true);
});

test("shouldShowSeller: route-check má přednost před ostatními podmínkami (short-circuit)", () => {
  // I kdyby všechno ostatní vycházelo příznivě, /hra pořád vyhraje.
  assert.equal(
    shouldShowSeller(
      baseInput({
        pathname: "/hra",
        lastShownAt: null,
        shownRoutes: [],
        bannerVisible: false,
        chanceRoll: 0,
      })
    ),
    false
  );
});
