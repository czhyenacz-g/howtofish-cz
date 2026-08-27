import { test } from "node:test";
import assert from "node:assert/strict";
import { isEventIngestRateLimited } from "../lib/analytics/rate-limit.ts";

test("isEventIngestRateLimited: prvních 60 volání ve stejné minutě není limitováno", () => {
  const key = `test-key-${Math.random()}`;
  const now = 1_000_000;
  for (let i = 0; i < 60; i++) {
    assert.equal(isEventIngestRateLimited(key, now + i), false, `volání #${i + 1} by nemělo být limitované`);
  }
});

test("isEventIngestRateLimited: 61. volání ve stejné minutě je limitované", () => {
  const key = `test-key-${Math.random()}`;
  const now = 1_000_000;
  for (let i = 0; i < 60; i++) {
    isEventIngestRateLimited(key, now + i);
  }
  assert.equal(isEventIngestRateLimited(key, now + 60), true);
});

test("isEventIngestRateLimited: po uplynutí minuty se okno posune, limit se uvolní", () => {
  const key = `test-key-${Math.random()}`;
  const now = 1_000_000;
  for (let i = 0; i < 61; i++) {
    isEventIngestRateLimited(key, now + i);
  }
  // O minutu a kousek později je stará zátěž mimo klouzavé okno.
  assert.equal(isEventIngestRateLimited(key, now + 60_000 + 1), false);
});

test("isEventIngestRateLimited: různé klíče (anonymous_id/IP) se navzájem neovlivňují", () => {
  const keyA = `a-${Math.random()}`;
  const keyB = `b-${Math.random()}`;
  const now = 1_000_000;
  for (let i = 0; i < 61; i++) {
    isEventIngestRateLimited(keyA, now + i);
  }
  assert.equal(isEventIngestRateLimited(keyA, now + 61), true);
  assert.equal(isEventIngestRateLimited(keyB, now + 61), false);
});
