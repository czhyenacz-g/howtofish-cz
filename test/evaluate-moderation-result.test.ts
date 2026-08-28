import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateModerationResult } from "../app/ryby/[slug]/evaluate-moderation-result.ts";

test("evaluateModerationResult: approve s vysokou confidence -> approved", () => {
  const outcome = evaluateModerationResult({ decision: "approve", confidence: 0.96, reason: "ok" });
  assert.equal(outcome, "approved");
});

test("evaluateModerationResult: approve přesně na hranici (0.9) -> approved", () => {
  const outcome = evaluateModerationResult({ decision: "approve", confidence: 0.9, reason: "ok" });
  assert.equal(outcome, "approved");
});

test("evaluateModerationResult: approve s nízkou confidence -> null (zůstává pending)", () => {
  const outcome = evaluateModerationResult({ decision: "approve", confidence: 0.5, reason: "nejistý" });
  assert.equal(outcome, null);
});

test("evaluateModerationResult: reject -> rejected bez ohledu na confidence", () => {
  const outcome = evaluateModerationResult({ decision: "reject", confidence: 0.99, reason: "nevhodné" });
  assert.equal(outcome, "rejected");
});

test("evaluateModerationResult: review -> null (zůstává pending)", () => {
  const outcome = evaluateModerationResult({ decision: "review", confidence: 0.4, reason: "nejasné" });
  assert.equal(outcome, null);
});

test("evaluateModerationResult: null výsledek -> null", () => {
  const outcome = evaluateModerationResult(null);
  assert.equal(outcome, null);
});
