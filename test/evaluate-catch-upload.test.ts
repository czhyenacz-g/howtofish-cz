import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateCatchUpload } from "../app/ryby/[slug]/evaluate-catch-upload.ts";

const OK_USER = { steamId: "76561198012345678", nickname: "Agraelus", isBlocked: false };

function validFile(overrides: Partial<{ name: string; type: string; sizeBytes: number }> = {}) {
  const size = overrides.sizeBytes ?? 1024;
  return new File([new Uint8Array(size)], overrides.name ?? "catch.jpg", {
    type: overrides.type ?? "image/jpeg",
  });
}

function validFormData(overrides: Record<string, FormDataEntryValue | null> = {}) {
  const fd = new FormData();
  fd.set("fishSlug", "pufferfish");
  fd.set("screenshot", validFile());
  fd.set("caughtDate", "2026-09-02");
  fd.set("caughtTime", "08:00");
  fd.set("utcOffset", "+02:00");
  fd.set("note", "Konečně se povedl.");
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

test("evaluateCatchUpload: nepřihlášený uživatel je odmítnut", () => {
  const result = evaluateCatchUpload(null, validFormData());
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /přihlas.*Steam/);
});

test("evaluateCatchUpload: blokovaný uživatel je odmítnut", () => {
  const result = evaluateCatchUpload({ ...OK_USER, isBlocked: true }, validFormData());
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, "Tento účet momentálně nemůže nahrávat obsah.");
});

test("evaluateCatchUpload: neplatný fish slug je odmítnut", () => {
  const result = evaluateCatchUpload(OK_USER, validFormData({ fishSlug: "neexistujici-ryba" }));
  assert.equal(result.ok, false);
});

test("evaluateCatchUpload: chybějící soubor je odmítnut", () => {
  const result = evaluateCatchUpload(OK_USER, validFormData({ screenshot: null }));
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /screenshot/i);
});

test("evaluateCatchUpload: příliš velký soubor je odmítnut", () => {
  const fd = validFormData();
  fd.set("screenshot", validFile({ sizeBytes: 9 * 1024 * 1024 }));
  const result = evaluateCatchUpload(OK_USER, fd);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /8 MB/);
});

test("evaluateCatchUpload: nepodporovaný MIME typ je odmítnut", () => {
  const fd = validFormData();
  fd.set("screenshot", validFile({ type: "image/gif", name: "catch.gif" }));
  const result = evaluateCatchUpload(OK_USER, fd);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /JPG, PNG nebo WebP/);
});

test("evaluateCatchUpload: chybějící souhlas s právy je odmítnut", () => {
  const result = evaluateCatchUpload(OK_USER, validFormData({ rightsConfirmed: null }));
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /Potvrď/);
});

test("evaluateCatchUpload: neplatné datum/čas je odmítnuto", () => {
  assert.equal(evaluateCatchUpload(OK_USER, validFormData({ caughtDate: "2. 9. 2026" })).ok, false);
  assert.equal(evaluateCatchUpload(OK_USER, validFormData({ caughtTime: "8:00" })).ok, false);
  assert.equal(evaluateCatchUpload(OK_USER, validFormData({ utcOffset: "2:00" })).ok, false);
});

test("evaluateCatchUpload: poznámka nad limit je odmítnuta", () => {
  const result = evaluateCatchUpload(OK_USER, validFormData({ note: "x".repeat(301) }));
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /300 znaků/);
});

test("evaluateCatchUpload: platný payload se správně namapuje (steam_id/nickname ze session, ne z formData)", () => {
  const fd = validFormData();
  // Pokus propašovat cizí steam_id/nickname přes formData — nesmí se použít.
  fd.set("steam_id", "11111111111111111");
  fd.set("nickname", "Podvodnik");

  const result = evaluateCatchUpload(OK_USER, fd);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.payload, {
      fish_slug: "pufferfish",
      steam_id: OK_USER.steamId,
      nickname: OK_USER.nickname,
      caught_at: "2026-09-02T08:00:00+02:00",
      note: "Konečně se povedl.",
      rights_confirmed: true,
    });
  }
});

test("evaluateCatchUpload: prázdná poznámka se do payloadu vůbec nepřidá", () => {
  const result = evaluateCatchUpload(OK_USER, validFormData({ note: "  " }));
  assert.equal(result.ok, true);
  if (result.ok) assert.equal("note" in result.payload, false);
});
