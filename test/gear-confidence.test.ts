import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getGearConfidenceLabel, getGearConfidenceTooltip } from "../lib/creators/gear-confidence.ts";

describe("getGearConfidenceLabel — malé badge texty (zadání bod 4)", () => {
  test("verified -> Ověřeno", () => {
    assert.equal(getGearConfidenceLabel("verified"), "Ověřeno");
  });

  test("historical -> Historické", () => {
    assert.equal(getGearConfidenceLabel("historical"), "Historické");
  });

  test("estimated -> Odhad", () => {
    assert.equal(getGearConfidenceLabel("estimated"), "Odhad");
  });
});

describe("getGearConfidenceTooltip — transparentní vysvětlení (zadání bod 2)", () => {
  test("verified odkazuje na veřejný zdroj", () => {
    assert.match(getGearConfidenceTooltip("verified"), /veřejně dostupným zdrojem/);
  });

  test("historical vysvětluje, že dnes může být jinak", () => {
    assert.match(getGearConfidenceTooltip("historical"), /dřívějším setupu/);
    assert.match(getGearConfidenceTooltip("historical"), /jinou techniku/);
  });

  test("estimated jasně říká, že nejde o potvrzenou součást setupu (hard rule)", () => {
    const tooltip = getGearConfidenceTooltip("estimated");
    assert.match(tooltip, /nepodařilo veřejně ověřit/);
    assert.match(tooltip, /nikoli potvrzenou součást setupu/);
  });
});
