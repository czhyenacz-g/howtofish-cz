import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateItemSuggestion } from "../app/(sections)/predmety/navrhnout/evaluate-item-suggestion.ts";
import { DUPLICATE_ERROR } from "../lib/community/validation.ts";

const OK_USER = { steamId: "76561198012345678", nickname: "Agraelus", isBlocked: false };

function validFile(overrides: Partial<{ name: string; type: string; sizeBytes: number }> = {}) {
  const size = overrides.sizeBytes ?? 1024;
  return new File([new Uint8Array(size)], overrides.name ?? "shot.jpg", { type: overrides.type ?? "image/jpeg" });
}

function validFormData(overrides: Record<string, FormDataEntryValue | null> = {}) {
  const fd = new FormData();
  fd.set("name", "Golden Rod");
  fd.set("itemType", "Prut");
  fd.set("obtainedAt", "Ostrov 3, obchod");
  fd.set("use", "Lepší rybaření");
  fd.set("screenshot", validFile());
  fd.set("note", "Koupil jsem to za 500.");
  fd.set("rightsConfirmed", "on");
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) fd.delete(key);
    else fd.set(key, value);
  }
  return fd;
}

test("evaluateItemSuggestion: nepřihlášený uživatel je odmítnut", () => {
  const result = evaluateItemSuggestion(null, validFormData(), [], []);
  assert.equal(result.ok, false);
});

test("evaluateItemSuggestion: blokovaný uživatel je odmítnut", () => {
  const result = evaluateItemSuggestion({ ...OK_USER, isBlocked: true }, validFormData(), [], []);
  assert.equal(result.ok, false);
});

test("evaluateItemSuggestion: chybějící název je odmítnut", () => {
  const result = evaluateItemSuggestion(OK_USER, validFormData({ name: "" }), [], []);
  assert.equal(result.ok, false);
});

test("evaluateItemSuggestion: chybějící screenshot je odmítnut (u předmětu je povinný)", () => {
  const result = evaluateItemSuggestion(OK_USER, validFormData({ screenshot: null }), [], []);
  assert.equal(result.ok, false);
});

test("evaluateItemSuggestion: chybějící souhlas s právy je odmítnut", () => {
  const result = evaluateItemSuggestion(OK_USER, validFormData({ rightsConfirmed: null }), [], []);
  assert.equal(result.ok, false);
});

test("evaluateItemSuggestion: duplicita proti kurátorovaným datům (data/items.ts) je odmítnuta", () => {
  // "Hot Dog" je reálný kurátorovaný záznam v data/items.ts.
  const result = evaluateItemSuggestion(OK_USER, validFormData({ name: "  hot   dog  " }), [], []);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, DUPLICATE_ERROR);
});

test("evaluateItemSuggestion: duplicita proti schváleným komunitním záznamům je odmítnuta", () => {
  const result = evaluateItemSuggestion(OK_USER, validFormData({ name: "Silver Rod" }), [], ["Silver Rod"]);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, DUPLICATE_ERROR);
});

test("evaluateItemSuggestion: duplicita proti vlastním pending návrhům je odmítnuta", () => {
  const result = evaluateItemSuggestion(OK_USER, validFormData({ name: "Bronze Rod" }), ["Bronze Rod"], []);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, DUPLICATE_ERROR);
});

test("evaluateItemSuggestion: platný payload namapuje steam_id/nickname ze session, kind=new", () => {
  const fd = validFormData();
  fd.set("steam_id", "podvod");
  const result = evaluateItemSuggestion(OK_USER, fd, [], []);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.payload, {
      kind: "new",
      name: "Golden Rod",
      item_type: "Prut",
      obtained_at: "Ostrov 3, obchod",
      use: "Lepší rybaření",
      steam_id: OK_USER.steamId,
      nickname: OK_USER.nickname,
      note: "Koupil jsem to za 500.",
      rights_confirmed: true,
    });
  }
});
