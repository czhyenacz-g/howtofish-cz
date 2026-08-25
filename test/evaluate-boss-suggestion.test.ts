import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateBossSuggestion } from "../app/(sections)/bossove/navrhnout/evaluate-boss-suggestion.ts";
import { DUPLICATE_ERROR } from "../lib/community/validation.ts";

const OK_USER = { steamId: "76561198012345678", nickname: "Agraelus", isBlocked: false };

function validFile() {
  return new File([new Uint8Array(1024)], "shot.jpg", { type: "image/jpeg" });
}

function validFormData(overrides: Record<string, FormDataEntryValue | null> = {}) {
  const fd = new FormData();
  fd.set("name", "King Crab");
  fd.set("location", "Ostrov 4");
  fd.set("howToFind", "Přines mu 5 ryb.");
  fd.set("tip", "Střílej ho zezadu.");
  fd.set("screenshot", validFile());
  fd.set("rightsConfirmed", "on");
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) fd.delete(key);
    else fd.set(key, value);
  }
  return fd;
}

test("evaluateBossSuggestion: chybějící screenshot je odmítnut (u bosse je povinný)", () => {
  const result = evaluateBossSuggestion(OK_USER, validFormData({ screenshot: null }), [], []);
  assert.equal(result.ok, false);
});

test("evaluateBossSuggestion: duplicita proti kurátorovaným bossům (data/bosses.ts) je odmítnuta", () => {
  // "Spider Crab" je reálný kurátorovaný boss v data/bosses.ts.
  const result = evaluateBossSuggestion(OK_USER, validFormData({ name: " spider crab " }), [], []);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, DUPLICATE_ERROR);
});

test("evaluateBossSuggestion: platný payload namapuje boss-specifická pole (location/how_to_find/tip)", () => {
  const result = evaluateBossSuggestion(OK_USER, validFormData(), [], []);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.payload.kind, "new");
    assert.equal(result.payload.location, "Ostrov 4");
    assert.equal(result.payload.how_to_find, "Přines mu 5 ryb.");
    assert.equal(result.payload.tip, "Střílej ho zezadu.");
    assert.equal(result.payload.steam_id, OK_USER.steamId);
  }
});
