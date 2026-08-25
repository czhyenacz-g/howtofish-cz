import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeReturnTo } from "../lib/auth/return-to.ts";

test("returnTo: bezpečná relativní cesta se ponechá beze změny", () => {
  assert.equal(sanitizeReturnTo("/ryby/pufferfish"), "/ryby/pufferfish");
  assert.equal(sanitizeReturnTo("/"), "/");
});

test("returnTo: chybějící hodnota vede na výchozí /", () => {
  assert.equal(sanitizeReturnTo(null), "/");
  assert.equal(sanitizeReturnTo(undefined), "/");
  assert.equal(sanitizeReturnTo(""), "/");
});

test("returnTo: cizí absolutní URL je odmítnuta", () => {
  assert.equal(sanitizeReturnTo("https://evil.example.com/phishing"), "/");
  assert.equal(sanitizeReturnTo("http://evil.example.com"), "/");
});

test("returnTo: protokol-relativní URL (//) je odmítnuta", () => {
  assert.equal(sanitizeReturnTo("//evil.example.com"), "/");
});

test("returnTo: cesta bez úvodního lomítka je odmítnuta", () => {
  assert.equal(sanitizeReturnTo("evil.example.com"), "/");
  assert.equal(sanitizeReturnTo("ryby"), "/");
});

test("returnTo: cesta s obráceným lomítkem je odmítnuta", () => {
  assert.equal(sanitizeReturnTo("/\\evil.example.com"), "/");
});
