import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BLOCKED_ERROR,
  NOT_LOGGED_IN_ERROR,
  RIGHTS_ERROR,
  evaluateCorrection,
  isDuplicateTitle,
  normalizeTitle,
  optionalText,
  requireText,
  validateRightsConfirmed,
  validateScreenshot,
} from "../lib/community/validation.ts";

const OK_USER = { steamId: "76561198012345678", nickname: "Agraelus", isBlocked: false };

function validFile(overrides: Partial<{ name: string; type: string; sizeBytes: number }> = {}) {
  const size = overrides.sizeBytes ?? 1024;
  return new File([new Uint8Array(size)], overrides.name ?? "shot.jpg", { type: overrides.type ?? "image/jpeg" });
}

test("normalizeTitle: lowercase/trim/whitespace normalize", () => {
  assert.equal(normalizeTitle("  Golden   Rod "), "golden rod");
});

test("isDuplicateTitle: najde shodu napříč více seznamy (case/whitespace insensitivní)", () => {
  assert.equal(isDuplicateTitle("golden rod", ["Golden Rod"], []), true);
  assert.equal(isDuplicateTitle("  GOLDEN   ROD  ", [], ["golden rod"]), true);
  assert.equal(isDuplicateTitle("Silver Rod", ["Golden Rod"], ["Bronze Rod"]), false);
});

test("requireText: prázdná hodnota je odmítnuta", () => {
  const fd = new FormData();
  fd.set("name", "  ");
  const result = requireText(fd, "name", "Název", 80);
  assert.equal(result.ok, false);
});

test("requireText: nad limit je odmítnuto", () => {
  const fd = new FormData();
  fd.set("name", "x".repeat(81));
  const result = requireText(fd, "name", "Název", 80);
  assert.equal(result.ok, false);
});

test("optionalText: chybějící pole vrátí undefined, ne chybu", () => {
  const fd = new FormData();
  const result = optionalText(fd, "note", 300);
  assert.deepEqual(result, { ok: true, value: undefined });
});

test("validateScreenshot: required=true a chybějící soubor je odmítnut", () => {
  const fd = new FormData();
  const result = validateScreenshot(fd, { required: true });
  assert.equal(result.ok, false);
});

test("validateScreenshot: required=false a chybějící soubor projde jako undefined", () => {
  const fd = new FormData();
  const result = validateScreenshot(fd, { required: false });
  assert.deepEqual(result, { ok: true, value: undefined });
});

test("validateScreenshot: příliš velký soubor je odmítnut", () => {
  const fd = new FormData();
  fd.set("screenshot", validFile({ sizeBytes: 9 * 1024 * 1024 }));
  const result = validateScreenshot(fd, { required: true });
  assert.equal(result.ok, false);
});

test("validateScreenshot: nepodporovaný MIME typ je odmítnut", () => {
  const fd = new FormData();
  fd.set("screenshot", validFile({ type: "image/gif", name: "x.gif" }));
  const result = validateScreenshot(fd, { required: true });
  assert.equal(result.ok, false);
});

test("validateRightsConfirmed: jen 'on' se počítá jako potvrzené", () => {
  const fd = new FormData();
  fd.set("rightsConfirmed", "on");
  assert.equal(validateRightsConfirmed(fd), true);
  assert.equal(validateRightsConfirmed(new FormData()), false);
});

function correctionFormData(overrides: Record<string, FormDataEntryValue | null> = {}) {
  const fd = new FormData();
  fd.set("target", "Golden Rod");
  fd.set("proposedChanges", "Lokace je špatně, správně Ostrov 2.");
  fd.set("note", "Ověřeno ve hře.");
  fd.set("rightsConfirmed", "on");
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) fd.delete(key);
    else fd.set(key, value);
  }
  return fd;
}

test("evaluateCorrection: nepřihlášený uživatel je odmítnut", () => {
  const result = evaluateCorrection(null, correctionFormData());
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, NOT_LOGGED_IN_ERROR);
});

test("evaluateCorrection: blokovaný uživatel je odmítnut", () => {
  const result = evaluateCorrection({ ...OK_USER, isBlocked: true }, correctionFormData());
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, BLOCKED_ERROR);
});

test("evaluateCorrection: chybějící souhlas s právy je odmítnut i bez screenshotu", () => {
  const result = evaluateCorrection(OK_USER, correctionFormData({ rightsConfirmed: null }));
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, RIGHTS_ERROR);
});

test("evaluateCorrection: platný vstup namapuje steam_id/nickname ze session, ne z formData", () => {
  const fd = correctionFormData();
  fd.set("steam_id", "podvod");
  fd.set("nickname", "Podvodnik");
  const result = evaluateCorrection(OK_USER, fd);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.payload.kind, "correction");
    assert.equal(result.payload.steam_id, OK_USER.steamId);
    assert.equal(result.payload.nickname, OK_USER.nickname);
    assert.equal(result.payload.target, "Golden Rod");
  }
});

test("evaluateCorrection: screenshot je nepovinný", () => {
  const result = evaluateCorrection(OK_USER, correctionFormData());
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.file, undefined);
});
