import { test } from "node:test";
import assert from "node:assert/strict";
import { isExternalHref, matchSpecificity, pickPromotion } from "../lib/promotions/match-route.ts";

test("matchSpecificity: exact pattern matches exactly the same pathname", () => {
  assert.equal(matchSpecificity("/ryby", "/ryby"), "exact");
  assert.equal(matchSpecificity("/ryby", "/ryby/spider-crab"), null);
});

test("matchSpecificity: wildcard subtree matches the base and any nested path", () => {
  assert.equal(matchSpecificity("/ryby/*", "/ryby/spider-crab"), "wildcard");
  assert.equal(matchSpecificity("/ryby/*", "/ryby"), "wildcard");
  assert.equal(matchSpecificity("/ryby/*", "/predmety"), null);
});

test("matchSpecificity: '*' matches any pathname (global)", () => {
  assert.equal(matchSpecificity("*", "/ryby"), "global");
  assert.equal(matchSpecificity("*", "/hra"), "global");
});

test("matchSpecificity: root wildcard '/*' matches any path", () => {
  assert.equal(matchSpecificity("/*", "/ryby/spider-crab"), "wildcard");
});

test("isExternalHref: absolute http(s) is external, relative path is internal", () => {
  assert.equal(isExternalHref("https://example.com/product"), true);
  assert.equal(isExternalHref("http://example.com"), true);
  assert.equal(isExternalHref("/ryby/spider-crab"), false);
});

function candidate(pagePattern: string, weight: number, id: string, href?: string) {
  return { pagePattern, weight, id, href };
}

test("pickPromotion: no candidates match -> null", () => {
  const result = pickPromotion([candidate("/predmety", 1, "a")], "/ryby");
  assert.equal(result, null);
});

test("pickPromotion: single match is returned deterministically", () => {
  const only = candidate("/ryby", 1, "only");
  const result = pickPromotion([only, candidate("/predmety", 5, "other")], "/ryby");
  assert.equal(result?.id, "only");
});

test("pickPromotion: exact match wins over wildcard and global even if those also match", () => {
  const exact = candidate("/ryby", 1, "exact");
  const wildcard = candidate("/ryby/*", 100, "wildcard");
  const global = candidate("*", 100, "global");
  const result = pickPromotion([wildcard, global, exact], "/ryby");
  assert.equal(result?.id, "exact");
});

test("pickPromotion: wildcard wins over global when no exact match exists", () => {
  const wildcard = candidate("/ryby/*", 1, "wildcard");
  const global = candidate("*", 100, "global");
  const result = pickPromotion([global, wildcard], "/ryby/spider-crab");
  assert.equal(result?.id, "wildcard");
});

test("pickPromotion: falls back to global when nothing more specific matches", () => {
  const global = candidate("*", 1, "global");
  const unrelated = candidate("/predmety", 100, "unrelated");
  const result = pickPromotion([unrelated, global], "/ryby");
  assert.equal(result?.id, "global");
});

test("pickPromotion: never mixes candidates from different priority groups", () => {
  const exactA = candidate("/ryby", 1, "exactA");
  const exactB = candidate("/ryby", 1, "exactB");
  const global = candidate("*", 1000, "global");
  for (let i = 0; i < 20; i++) {
    const result = pickPromotion([exactA, exactB, global], "/ryby");
    assert.ok(result?.id === "exactA" || result?.id === "exactB");
  }
});

test("pickPromotion: weight 0 or negative is treated as at least 1 (never fully excluded)", () => {
  const zeroWeight = candidate("/ryby", 0, "zero");
  const result = pickPromotion([zeroWeight], "/ryby");
  assert.equal(result?.id, "zero");
});

test("pickPromotion: promotion s href === aktuální pathname se nikdy nevybere (banner na hru na samotné /hra nedává smysl)", () => {
  const selfLinking = candidate("*", 1000, "contest", "/hra");
  const other = candidate("*", 1, "affiliate", "https://example.com/product");
  for (let i = 0; i < 20; i++) {
    const result = pickPromotion([selfLinking, other], "/hra");
    assert.equal(result?.id, "affiliate");
  }
});

test("pickPromotion: href === pathname vyřadí jediného kandidáta -> null (ne pád)", () => {
  const selfLinking = candidate("/hra", 1, "contest", "/hra");
  const result = pickPromotion([selfLinking], "/hra");
  assert.equal(result, null);
});

test("pickPromotion: promotion bez href (undefined) se self-referencing filtrem nikdy nevyřadí", () => {
  const noHref = candidate("*", 1, "no-href");
  const result = pickPromotion([noHref], "/hra");
  assert.equal(result?.id, "no-href");
});

test("pickPromotion: href jinam než aktuální pathname zůstává eligible", () => {
  const contest = candidate("*", 1, "contest", "/hra");
  const result = pickPromotion([contest], "/ryby");
  assert.equal(result?.id, "contest");
});
