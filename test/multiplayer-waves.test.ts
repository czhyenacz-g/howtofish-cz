import { test, describe } from "node:test";
import assert from "node:assert/strict";

process.env.UNIVERSAL_CONTENT_API_URL = "https://content-api.example.test";
process.env.UNIVERSAL_CONTENT_API_TOKEN = "uca_test_token_not_real";

const { getIncomingWaves, checkWaveAllowed, createWave } = await import("../lib/universal-content-api/waves.ts");
const { evaluateWave } = await import("../app/(sections)/multiplayer/evaluate-wave.ts");

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function withMockedFetch<T>(impl: typeof fetch, run: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  // @ts-expect-error test mock
  globalThis.fetch = impl;
  return run().finally(() => {
    globalThis.fetch = original;
  });
}

function waveRecord({
  id,
  fromSteamId,
  fromNickname,
  toSteamId,
  createdAt,
}: {
  id: number;
  fromSteamId: string;
  fromNickname: string;
  toSteamId: string;
  createdAt: string;
}) {
  return {
    id,
    status: "pending",
    data: { from_steam_id: fromSteamId, from_nickname: fromNickname, to_steam_id: toSteamId },
    media: [],
    created_at: createdAt,
    updated_at: createdAt,
  };
}

describe("evaluateWave (pure)", () => {
  const active = new Set(["target-1"]);

  test("nepřihlášený nemůže mávat", () => {
    assert.equal(evaluateWave(null, "target-1", active).ok, false);
  });

  test("blokovaný uživatel nemůže mávat", () => {
    const user = { steamId: "me", nickname: "Me", isBlocked: true };
    assert.equal(evaluateWave(user, "target-1", active).ok, false);
  });

  test("uživatel nemůže mávat sám sobě", () => {
    const user = { steamId: "me", nickname: "Me", isBlocked: false };
    const result = evaluateWave(user, "me", new Set(["me"]));
    assert.equal(result.ok, false);
  });

  test("příjemce musí být v aktivní presence", () => {
    const user = { steamId: "me", nickname: "Me", isBlocked: false };
    assert.equal(evaluateWave(user, "not-active", active).ok, false);
    assert.equal(evaluateWave(user, "target-1", active).ok, true);
  });

  test("úspěch bere fromSteamId/fromNickname ze session, ne z inputu", () => {
    const user = { steamId: "session-id", nickname: "SessionNick", isBlocked: false };
    const result = evaluateWave(user, "target-1", active);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.fromSteamId, "session-id");
      assert.equal(result.fromNickname, "SessionNick");
      assert.equal(result.toSteamId, "target-1");
    }
  });
});

describe("getIncomingWaves", () => {
  test("filtruje podle to_steam_id a nejnovější první", async () => {
    const now = new Date().toISOString();
    const older = new Date(Date.now() - 5 * 60_000).toISOString();
    let seenUrl = "";
    await withMockedFetch(
      async (url) => {
        seenUrl = String(url);
        return jsonResponse(200, {
          data: [
            waveRecord({ id: 1, fromSteamId: "a", fromNickname: "A", toSteamId: "me", createdAt: older }),
            waveRecord({ id: 2, fromSteamId: "b", fromNickname: "B", toSteamId: "me", createdAt: now }),
          ],
        });
      },
      () => getIncomingWaves("me")
    );
    assert.match(seenUrl, /filter%5Bto_steam_id%5D=me|filter\[to_steam_id\]=me/);
  });

  test("wave starší než 60 minut se nezobrazí", async () => {
    const tooOld = new Date(Date.now() - 61 * 60_000).toISOString();
    const result = await withMockedFetch(
      async () =>
        jsonResponse(200, {
          data: [waveRecord({ id: 1, fromSteamId: "a", fromNickname: "A", toSteamId: "me", createdAt: tooOld })],
        }),
      () => getIncomingWaves("me")
    );
    assert.equal(result.length, 0);
  });

  test("ostatní uživatelé (jiné to_steam_id) tenhle výsledek nevidí — request je vždy scoped na volajícího", async () => {
    let seenUrl = "";
    await withMockedFetch(
      async (url) => {
        seenUrl = String(url);
        return jsonResponse(200, { data: [] });
      },
      () => getIncomingWaves("only-me")
    );
    assert.match(seenUrl, /only-me/);
  });
});

describe("checkWaveAllowed (cooldown + rate limit)", () => {
  test("cooldown: stejnému příjemci nelze zamávat dvakrát do 10 minut", async () => {
    const now = new Date().toISOString();
    const result = await withMockedFetch(
      async () =>
        jsonResponse(200, {
          data: [waveRecord({ id: 1, fromSteamId: "me", fromNickname: "Me", toSteamId: "target-1", createdAt: now })],
        }),
      () => checkWaveAllowed("me", "target-1")
    );
    assert.equal(result.allowed, false);
    if (!result.allowed) assert.equal(result.alreadyWaved, true);
  });

  test("po cooldownu (>10 min) je zamávání stejnému příjemci znovu povoleno", async () => {
    const overCooldown = new Date(Date.now() - 11 * 60_000).toISOString();
    const result = await withMockedFetch(
      async () =>
        jsonResponse(200, {
          data: [waveRecord({ id: 1, fromSteamId: "me", fromNickname: "Me", toSteamId: "target-1", createdAt: overCooldown })],
        }),
      () => checkWaveAllowed("me", "target-1")
    );
    assert.equal(result.allowed, true);
  });

  test("rate limit: 20 waves za poslední hodinu zablokuje další", async () => {
    const now = new Date().toISOString();
    const sent = Array.from({ length: 20 }, (_, i) =>
      waveRecord({ id: i, fromSteamId: "me", fromNickname: "Me", toSteamId: `target-${i}`, createdAt: now })
    );
    const result = await withMockedFetch(
      async () => jsonResponse(200, { data: sent }),
      () => checkWaveAllowed("me", "target-new")
    );
    assert.equal(result.allowed, false);
    if (!result.allowed) assert.equal(result.alreadyWaved, false);
  });

  test("request pro cooldown je scoped jen na from_steam_id volajícího", async () => {
    let seenUrl = "";
    await withMockedFetch(
      async (url) => {
        seenUrl = String(url);
        return jsonResponse(200, { data: [] });
      },
      () => checkWaveAllowed("me", "target-1")
    );
    assert.match(seenUrl, /filter%5Bfrom_steam_id%5D=me|filter\[from_steam_id\]=me/);
  });
});

describe("createWave", () => {
  test("posílá jen from_steam_id/from_nickname/to_steam_id do collection multiplayer_waves", async () => {
    let seenUrl = "";
    let seenBody: Record<string, unknown> = {};
    await withMockedFetch(
      async (url, init) => {
        seenUrl = String(url);
        seenBody = JSON.parse((init?.body as string) ?? "{}");
        return jsonResponse(201, { data: { id: 1 } });
      },
      () => createWave({ fromSteamId: "me", fromNickname: "Me", toSteamId: "target-1" })
    );
    assert.match(seenUrl, /collections\/multiplayer_waves\/records$/);
    assert.deepEqual(seenBody.data, { from_steam_id: "me", from_nickname: "Me", to_steam_id: "target-1" });
  });
});
