import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateGuideSuggestion } from "../app/(sections)/navody/navrhnout/evaluate-guide-suggestion.ts";
import { DUPLICATE_ERROR } from "../lib/community/validation.ts";

const OK_USER = { steamId: "76561198012345678", nickname: "Agraelus", isBlocked: false };

function validFile() {
  return new File([new Uint8Array(1024)], "shot.jpg", { type: "image/jpeg" });
}

function validFormData(overrides: Record<string, FormDataEntryValue | null> = {}) {
  const fd = new FormData();
  fd.set("title", "Jak rychle vydělat peníze");
  fd.set("category", "Začátečníci");
  fd.set("summary", "Nejrychlejší způsoby výdělku v úvodu hry.");
  fd.set("content", "1. Prodávej ryby.\n2. Uprav vybavení.");
  fd.set("rightsConfirmed", "on");
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) fd.delete(key);
    else fd.set(key, value);
  }
  return fd;
}

test("evaluateGuideSuggestion: screenshot NENÍ povinný", () => {
  const fd = validFormData({ rightsConfirmed: null });
  fd.delete("screenshot");
  const result = evaluateGuideSuggestion(OK_USER, fd, [], []);
  assert.equal(result.ok, true);
});

test("evaluateGuideSuggestion: rights checkbox je povinný JEN pokud je přiložený screenshot", () => {
  const fd = validFormData({ rightsConfirmed: null });
  fd.set("screenshot", validFile());
  const result = evaluateGuideSuggestion(OK_USER, fd, [], []);
  assert.equal(result.ok, false);
});

test("evaluateGuideSuggestion: chybějící postup (content) je odmítnut", () => {
  const result = evaluateGuideSuggestion(OK_USER, validFormData({ content: "" }), [], []);
  assert.equal(result.ok, false);
});

test("evaluateGuideSuggestion: duplicita proti kurátorovaným návodům (data/guides.ts) je odmítnuta", () => {
  // "Jak porazit Spider Crab" je reálný kurátorovaný návod v data/guides.ts.
  const result = evaluateGuideSuggestion(OK_USER, validFormData({ title: "jak porazit spider crab" }), [], []);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, DUPLICATE_ERROR);
});

test("evaluateGuideSuggestion: platný payload namapuje title/category/summary/content", () => {
  const result = evaluateGuideSuggestion(OK_USER, validFormData(), [], []);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.payload.kind, "new");
    assert.equal(result.payload.title, "Jak rychle vydělat peníze");
    assert.equal(result.payload.category, "Začátečníci");
    assert.equal(result.payload.content, "1. Prodávej ryby.\n2. Uprav vybavení.");
  }
});
