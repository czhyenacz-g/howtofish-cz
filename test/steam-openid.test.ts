import { test } from "node:test";
import assert from "node:assert/strict";
import { extractSteamId64, verifySteamCallback } from "../lib/auth/steam-openid.ts";

test("extractSteamId64: platný claimed_id vrátí SteamID64", () => {
  assert.equal(
    extractSteamId64("https://steamcommunity.com/openid/id/76561198012345678"),
    "76561198012345678",
  );
});

test("extractSteamId64: neplatné tvary jsou odmítnuty", () => {
  assert.equal(extractSteamId64(null), null);
  assert.equal(extractSteamId64(""), null);
  // špatná doména (útočník podvrhuje claimed_id)
  assert.equal(extractSteamId64("https://evil.example.com/openid/id/76561198012345678"), null);
  // http místo https
  assert.equal(extractSteamId64("http://steamcommunity.com/openid/id/76561198012345678"), null);
  // ID není čistě numerické / má špatnou délku
  assert.equal(extractSteamId64("https://steamcommunity.com/openid/id/abcdefghijklmno"), null);
  assert.equal(extractSteamId64("https://steamcommunity.com/openid/id/123"), null);
  // extra path segment
  assert.equal(extractSteamId64("https://steamcommunity.com/openid/id/76561198012345678/extra"), null);
});

function baseParams(overrides: Record<string, string> = {}): URLSearchParams {
  return new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "id_res",
    "openid.claimed_id": "https://steamcommunity.com/openid/id/76561198012345678",
    "openid.identity": "https://steamcommunity.com/openid/id/76561198012345678",
    ...overrides,
  });
}

test("verifySteamCallback: špatný openid.ns je odmítnut bez volání sítě", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  // @ts-expect-error mock
  globalThis.fetch = async () => {
    called = true;
    throw new Error("fetch by nemělo být zavoláno");
  };
  try {
    const result = await verifySteamCallback(baseParams({ "openid.ns": "invalid" }));
    assert.equal(result, null);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verifySteamCallback: špatný openid.mode je odmítnut bez volání sítě", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  // @ts-expect-error mock
  globalThis.fetch = async () => {
    called = true;
    throw new Error("fetch by nemělo být zavoláno");
  };
  try {
    const result = await verifySteamCallback(baseParams({ "openid.mode": "cancel" }));
    assert.equal(result, null);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verifySteamCallback: neplatný claimed_id je odmítnut bez volání sítě", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  // @ts-expect-error mock
  globalThis.fetch = async () => {
    called = true;
    throw new Error("fetch by nemělo být zavoláno");
  };
  try {
    const result = await verifySteamCallback(
      baseParams({ "openid.claimed_id": "https://evil.example.com/openid/id/76561198012345678" }),
    );
    assert.equal(result, null);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verifySteamCallback: Steam potvrdí platnost (is_valid:true) -> vrátí SteamID", async () => {
  const originalFetch = globalThis.fetch;
  // @ts-expect-error mock
  globalThis.fetch = async () =>
    new Response("ns:http://specs.openid.net/auth/2.0\nis_valid:true\n", { status: 200 });
  try {
    const result = await verifySteamCallback(baseParams());
    assert.equal(result, "76561198012345678");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verifySteamCallback: Steam odmítne platnost (is_valid:false) -> vrátí null", async () => {
  const originalFetch = globalThis.fetch;
  // @ts-expect-error mock
  globalThis.fetch = async () =>
    new Response("ns:http://specs.openid.net/auth/2.0\nis_valid:false\n", { status: 200 });
  try {
    const result = await verifySteamCallback(baseParams());
    assert.equal(result, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verifySteamCallback: síťová chyba při ověření -> vrátí null (žádná výjimka ven)", async () => {
  const originalFetch = globalThis.fetch;
  // @ts-expect-error mock
  globalThis.fetch = async () => {
    throw new Error("network down");
  };
  try {
    const result = await verifySteamCallback(baseParams());
    assert.equal(result, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
