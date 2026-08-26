import { test } from "node:test";
import assert from "node:assert/strict";
import { CHARACTER_CALLOUT_OPEN_SELECTOR, computeCalloutOpen } from "../lib/character-callouts/callout-open-state.ts";

test("CHARACTER_CALLOUT_OPEN_SELECTOR: cílí na data-character-callout-open=\"true\"", () => {
  assert.equal(CHARACTER_CALLOUT_OPEN_SELECTOR, '[data-character-callout-open="true"]');
});

test("computeCalloutOpen: false, když se atribut nikde nenašel", () => {
  assert.equal(computeCalloutOpen(0), false);
});

test("computeCalloutOpen: true, když se atribut našel", () => {
  assert.equal(computeCalloutOpen(1), true);
});
