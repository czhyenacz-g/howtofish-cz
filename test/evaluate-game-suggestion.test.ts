import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  DUPLICATE_ERROR,
  GAME_NAME_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  SPAM_ERROR,
  evaluateGameSuggestion,
  normalizeGameName,
} from "../app/(sections)/hry-s-rybarenim/evaluate-game-suggestion.ts";

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

describe("evaluateGameSuggestion — validace návrhu hry", () => {
  test("platný návrh projde a vrátí oříznutý název", () => {
    const result = evaluateGameSuggestion(formData({ gameName: "  Moonglow Bay  " }));
    assert.equal(result.ok, true);
    assert.deepEqual(result.ok && result.payload, { gameName: "Moonglow Bay" });
  });

  test("poznámka je nepovinná — prázdná se do payloadu vůbec nedostane", () => {
    const result = evaluateGameSuggestion(formData({ gameName: "Moonglow Bay", note: "   " }));
    assert.equal(result.ok, true);
    assert.equal(result.ok && "note" in result.payload, false);
  });

  test("vyplněná poznámka se uloží oříznutá", () => {
    const result = evaluateGameSuggestion(formData({ gameName: "Moonglow Bay", note: "  Rybaří se tam z lodi.  " }));
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.payload.note, "Rybaří se tam z lodi.");
  });

  test("prázdný název je chyba", () => {
    const result = evaluateGameSuggestion(formData({ gameName: "   " }));
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.message, "Napiš prosím název hry.");
  });

  test("moc dlouhý název je chyba", () => {
    const result = evaluateGameSuggestion(formData({ gameName: "a".repeat(GAME_NAME_MAX_LENGTH + 1) }));
    assert.equal(result.ok, false);
  });

  test("název na horní hranici limitu ještě projde", () => {
    const result = evaluateGameSuggestion(formData({ gameName: "a".repeat(GAME_NAME_MAX_LENGTH) }));
    assert.equal(result.ok, true);
  });

  test("moc dlouhá poznámka je chyba", () => {
    const result = evaluateGameSuggestion(
      formData({ gameName: "Moonglow Bay", note: "a".repeat(NOTE_MAX_LENGTH + 1) })
    );
    assert.equal(result.ok, false);
  });

  test("vyplněný honeypot (skryté pole 'website') je odmítnutý jako spam", () => {
    const result = evaluateGameSuggestion(formData({ gameName: "Moonglow Bay", website: "https://spam.example" }));
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.message, SPAM_ERROR);
  });

  test("hra, kterou už v katalogu máme, se odmítne (i v jiném casingu/mezerách)", () => {
    for (const name of ["Minecraft", "  minecraft ", "STARDEW  VALLEY", "sea of thieves"]) {
      const result = evaluateGameSuggestion(formData({ gameName: name }));
      assert.equal(result.ok, false, `"${name}" mělo být odmítnuto`);
      assert.equal(result.ok === false && result.message, DUPLICATE_ERROR);
    }
  });

  test("normalizeGameName sjednotí casing i vnitřní mezery", () => {
    assert.equal(normalizeGameName("  StarDew   Valley "), "stardew valley");
  });
});
