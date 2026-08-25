import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateScoreSubmission, GAME_SLUG } from "../app/hra/evaluate-score-submission.ts";

const OK_USER = { steamId: "76561198012345678", nickname: "Agraelus", isBlocked: false };
const VALID_INPUT = { score: 1240, round: 4, kills: 37, bestCombo: 8 };

test("evaluateScoreSubmission: nepřihlášený uživatel nemůže uložit skóre", () => {
  const result = evaluateScoreSubmission(null, VALID_INPUT);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /přihlas.*Steam/i);
});

test("evaluateScoreSubmission: blokovaný uživatel nemůže uložit skóre", () => {
  const result = evaluateScoreSubmission({ ...OK_USER, isBlocked: true }, VALID_INPUT);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /nemůže ukládat skóre/);
});

test("evaluateScoreSubmission: platný vstup od přihlášeného uživatele projde a namapuje se na payload", () => {
  const result = evaluateScoreSubmission(OK_USER, VALID_INPUT);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.payload, {
      game: GAME_SLUG,
      steam_id: OK_USER.steamId,
      nickname: OK_USER.nickname,
      score: 1240,
      round: 4,
      kills: 37,
      best_combo: 8,
    });
  }
});

test("evaluateScoreSubmission: záporné nebo neceločíselné hodnoty jsou odmítnuty", () => {
  assert.equal(evaluateScoreSubmission(OK_USER, { ...VALID_INPUT, score: -1 }).ok, false);
  assert.equal(evaluateScoreSubmission(OK_USER, { ...VALID_INPUT, score: 12.5 }).ok, false);
  assert.equal(evaluateScoreSubmission(OK_USER, { ...VALID_INPUT, kills: -5 }).ok, false);
  assert.equal(evaluateScoreSubmission(OK_USER, { ...VALID_INPUT, bestCombo: -1 }).ok, false);
  assert.equal(evaluateScoreSubmission(OK_USER, { ...VALID_INPUT, round: 0 }).ok, false);
  assert.equal(evaluateScoreSubmission(OK_USER, { ...VALID_INPUT, round: 1.2 }).ok, false);
});

test("evaluateScoreSubmission: absurdně vysoké hodnoty jsou odmítnuty (sanity limit)", () => {
  assert.equal(evaluateScoreSubmission(OK_USER, { ...VALID_INPUT, score: 10_000_000 }).ok, false);
  assert.equal(evaluateScoreSubmission(OK_USER, { ...VALID_INPUT, round: 100_000 }).ok, false);
  assert.equal(evaluateScoreSubmission(OK_USER, { ...VALID_INPUT, kills: 1_000_000 }).ok, false);
  assert.equal(evaluateScoreSubmission(OK_USER, { ...VALID_INPUT, bestCombo: 1_000_000 }).ok, false);
});

test("evaluateScoreSubmission: NaN vstupy (např. z chybějícího form pole) jsou odmítnuty", () => {
  const result = evaluateScoreSubmission(OK_USER, { ...VALID_INPUT, score: Number("nechybí ale spatny") });
  assert.equal(result.ok, false);
});
