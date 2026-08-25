import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateLocationSuggestion } from "../app/(sections)/lokace/navrhnout/evaluate-location-suggestion.ts";
import { DUPLICATE_ERROR } from "../lib/community/validation.ts";

const OK_USER = { steamId: "76561198012345678", nickname: "Agraelus", isBlocked: false };

function validFile() {
  return new File([new Uint8Array(1024)], "shot.jpg", { type: "image/jpeg" });
}

function validFormData(overrides: Record<string, FormDataEntryValue | null> = {}) {
  const fd = new FormData();
  fd.set("name", "Skrytá zátoka");
  fd.set("island", "Ostrov 2");
  fd.set("notableThings", "Vzácná ryba a truhla s předměty.");
  fd.set("screenshot", validFile());
  fd.set("rightsConfirmed", "on");
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) fd.delete(key);
    else fd.set(key, value);
  }
  return fd;
}

test("evaluateLocationSuggestion: chybějící screenshot je odmítnut (u lokace je povinný)", () => {
  const result = evaluateLocationSuggestion(OK_USER, validFormData({ screenshot: null }), [], []);
  assert.equal(result.ok, false);
});

test("evaluateLocationSuggestion: duplicita proti kurátorovaným lokacím (data/locations.ts) je odmítnuta", () => {
  // "Ostrov 1 (Maják)" je reálný kurátorovaný záznam v data/locations.ts.
  const result = evaluateLocationSuggestion(OK_USER, validFormData({ name: "ostrov 1 (maják)" }), [], []);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, DUPLICATE_ERROR);
});

test("evaluateLocationSuggestion: platný payload namapuje island/notable_things", () => {
  const result = evaluateLocationSuggestion(OK_USER, validFormData(), [], []);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.payload.kind, "new");
    assert.equal(result.payload.island, "Ostrov 2");
    assert.equal(result.payload.notable_things, "Vzácná ryba a truhla s předměty.");
  }
});
