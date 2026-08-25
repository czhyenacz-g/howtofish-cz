import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateSuggestion, DUPLICATE_ERROR } from "../app/ryby/navrhnout/evaluate-suggestion.ts";

const OK_USER = { steamId: "76561198012345678", nickname: "Agraelus", isBlocked: false };

function validFile(overrides: Partial<{ name: string; type: string; sizeBytes: number }> = {}) {
  const size = overrides.sizeBytes ?? 1024;
  return new File([new Uint8Array(size)], overrides.name ?? "screenshot.jpg", {
    type: overrides.type ?? "image/jpeg",
  });
}

function validFormData(overrides: Record<string, FormDataEntryValue | null> = {}) {
  const fd = new FormData();
  fd.set("name", "Golden Crab");
  fd.set("type", "creature");
  fd.set("location", "Ostrov 4, u majáku");
  fd.set("screenshot", validFile());
  fd.set("note", "Objevil se po poražení bosse.");
  fd.set("rightsConfirmed", "on");

  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) {
      fd.delete(key);
    } else {
      fd.set(key, value);
    }
  }
  return fd;
}

test("evaluateSuggestion: nepřihlášený uživatel je odmítnut", () => {
  const result = evaluateSuggestion(null, validFormData(), []);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /přihlas.*Steam/);
});

test("evaluateSuggestion: blokovaný uživatel je odmítnut", () => {
  const result = evaluateSuggestion({ ...OK_USER, isBlocked: true }, validFormData(), []);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, "Tento účet momentálně nemůže navrhovat obsah.");
});

test("evaluateSuggestion: chybějící souhlas s právy je odmítnut", () => {
  const result = evaluateSuggestion(OK_USER, validFormData({ rightsConfirmed: null }), []);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /Potvrď/);
});

test("evaluateSuggestion: chybějící screenshot je odmítnut", () => {
  const result = evaluateSuggestion(OK_USER, validFormData({ screenshot: null }), []);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /screenshot/i);
});

test("evaluateSuggestion: nepodporovaný typ (mimo whitelist) je odmítnut", () => {
  const result = evaluateSuggestion(OK_USER, validFormData({ type: "npc" }), []);
  assert.equal(result.ok, false);
});

test("evaluateSuggestion: chybějící název je odmítnut", () => {
  const result = evaluateSuggestion(OK_USER, validFormData({ name: "" }), []);
  assert.equal(result.ok, false);
});

test("evaluateSuggestion: chybějící lokace je odmítnuta", () => {
  const result = evaluateSuggestion(OK_USER, validFormData({ location: "" }), []);
  assert.equal(result.ok, false);
});

test("evaluateSuggestion: příliš velký soubor je odmítnut", () => {
  const fd = validFormData();
  fd.set("screenshot", validFile({ sizeBytes: 9 * 1024 * 1024 }));
  const result = evaluateSuggestion(OK_USER, fd, []);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /8 MB/);
});

test("evaluateSuggestion: nepodporovaný MIME typ souboru je odmítnut", () => {
  const fd = validFormData();
  fd.set("screenshot", validFile({ type: "image/gif", name: "shot.gif" }));
  const result = evaluateSuggestion(OK_USER, fd, []);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /JPG, PNG nebo WebP/);
});

test("evaluateSuggestion: poznámka nad limit je odmítnuta", () => {
  const result = evaluateSuggestion(OK_USER, validFormData({ note: "x".repeat(301) }), []);
  assert.equal(result.ok, false);
});

test("evaluateSuggestion: duplicita proti data/fish.ts (case/whitespace insensitivní) je odmítnuta", () => {
  const result = evaluateSuggestion(OK_USER, validFormData({ name: "  spider CRAB  " }), []);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, DUPLICATE_ERROR);
});

test("evaluateSuggestion: duplicita proti vlastním existujícím pending návrhům je odmítnuta", () => {
  const result = evaluateSuggestion(OK_USER, validFormData({ name: "Golden Crab" }), ["golden crab"]);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, DUPLICATE_ERROR);
});

test("evaluateSuggestion: platný payload se správně namapuje (steam_id/nickname ze session, ne z formData)", () => {
  const fd = validFormData();
  // Pokus propašovat cizí steam_id/nickname přes formData — nesmí se použít.
  fd.set("steam_id", "11111111111111111");
  fd.set("nickname", "Podvodnik");

  const result = evaluateSuggestion(OK_USER, fd, []);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.payload, {
      name: "Golden Crab",
      type: "creature",
      location: "Ostrov 4, u majáku",
      steam_id: OK_USER.steamId,
      nickname: OK_USER.nickname,
      note: "Objevil se po poražení bosse.",
      rights_confirmed: true,
    });
  }
});

test("evaluateSuggestion: prázdná poznámka se do payloadu vůbec nepřidá", () => {
  const result = evaluateSuggestion(OK_USER, validFormData({ note: "  " }), []);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal("note" in result.payload, false);
});
