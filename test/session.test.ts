import { test } from "node:test";
import assert from "node:assert/strict";

process.env.SESSION_SECRET = "test-only-secret-do-not-use-in-production";

const { createSessionCookieValue, verifySessionCookieValue } = await import("../lib/auth/session.ts");

test("session: round-trip encode/decode vrátí správné steamId", () => {
  const value = createSessionCookieValue("76561198012345678");
  const result = verifySessionCookieValue(value);
  assert.deepEqual(result, { steamId: "76561198012345678" });
});

test("session: chybějící cookie je neplatná", () => {
  assert.equal(verifySessionCookieValue(undefined), null);
  assert.equal(verifySessionCookieValue(null), null);
  assert.equal(verifySessionCookieValue(""), null);
});

test("session: poškozený/podvržený podpis je odmítnut", () => {
  const value = createSessionCookieValue("76561198012345678");
  const [data] = value.split(".");
  const tampered = `${data}.podvrzenypodpis`;
  assert.equal(verifySessionCookieValue(tampered), null);
});

test("session: pozměněný payload (jiné steamId) při zachování starého podpisu je odmítnut", () => {
  const value = createSessionCookieValue("76561198012345678");
  const [, signature] = value.split(".");
  const forgedPayload = Buffer.from(JSON.stringify({ steamId: "11111111111111111", exp: Math.floor(Date.now() / 1000) + 1000 })).toString(
    "base64url",
  );
  const forged = `${forgedPayload}.${signature}`;
  assert.equal(verifySessionCookieValue(forged), null);
});

test("session: expirovaná session je odmítnuta", async () => {
  const expiredPayload = Buffer.from(
    JSON.stringify({ steamId: "76561198012345678", exp: Math.floor(Date.now() / 1000) - 10 }),
  ).toString("base64url");
  const { createHmac } = await import("node:crypto");
  const signature = createHmac("sha256", process.env.SESSION_SECRET!).update(expiredPayload).digest("base64url");
  const value = `${expiredPayload}.${signature}`;
  assert.equal(verifySessionCookieValue(value), null);
});

test("session: bez nastaveného SESSION_SECRET je ověření vždy neplatné", () => {
  const value = createSessionCookieValue("76561198012345678");
  const original = process.env.SESSION_SECRET;
  delete process.env.SESSION_SECRET;
  try {
    assert.equal(verifySessionCookieValue(value), null);
  } finally {
    process.env.SESSION_SECRET = original;
  }
});
