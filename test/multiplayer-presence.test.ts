import { test, describe } from "node:test";
import assert from "node:assert/strict";

process.env.UNIVERSAL_CONTENT_API_URL = "https://content-api.example.test";
process.env.UNIVERSAL_CONTENT_API_TOKEN = "uca_test_token_not_real";

const { selectActivePresences, getActivePresences, setOwnPresence, hideOwnPresence } = await import(
  "../lib/universal-content-api/presence.ts"
);
const { evaluateSetPresence, evaluateHidePresence } = await import(
  "../app/(sections)/multiplayer/evaluate-presence.ts"
);

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

function presenceRecord({
  id,
  steamId,
  nickname,
  status = "play",
  visible = true,
  lastSeenAt,
  avatarUrl = null,
}: {
  id: number;
  steamId: string;
  nickname: string;
  status?: string;
  visible?: boolean;
  lastSeenAt: string;
  avatarUrl?: string | null;
}) {
  return {
    id,
    status: "pending",
    data: { steam_id: steamId, nickname, avatar_url: avatarUrl, status, visible, last_seen_at: lastSeenAt },
    media: [],
    created_at: lastSeenAt,
    updated_at: lastSeenAt,
  };
}

describe("selectActivePresences (pure filtering)", () => {
  test("presence 59 minut stará je stále aktivní", () => {
    const fiftyNineMinAgo = new Date(Date.now() - 59 * 60_000).toISOString();
    const records = [presenceRecord({ id: 1, steamId: "1", nickname: "A", lastSeenAt: fiftyNineMinAgo })];
    const result = selectActivePresences(records, new Set());
    assert.equal(result.length, 1);
  });

  test("presence starší než 1 hodina není zobrazena", () => {
    const overHourAgo = new Date(Date.now() - 61 * 60_000).toISOString();
    const records = [presenceRecord({ id: 1, steamId: "1", nickname: "A", lastSeenAt: overHourAgo })];
    const result = selectActivePresences(records, new Set());
    assert.equal(result.length, 0);
  });

  test("visible=false není zobrazen", () => {
    const now = new Date().toISOString();
    const records = [presenceRecord({ id: 1, steamId: "1", nickname: "A", visible: false, lastSeenAt: now })];
    const result = selectActivePresences(records, new Set());
    assert.equal(result.length, 0);
  });

  test("blokovaný uživatel není zobrazen", () => {
    const now = new Date().toISOString();
    const records = [
      presenceRecord({ id: 1, steamId: "blocked-1", nickname: "Blocked", lastSeenAt: now }),
      presenceRecord({ id: 2, steamId: "ok-1", nickname: "OK", lastSeenAt: now }),
    ];
    const result = selectActivePresences(records, new Set(["blocked-1"]));
    assert.equal(result.length, 1);
    assert.equal(result[0].steamId, "ok-1");
  });

  test("neplatný/chybějící status nebo last_seen_at se přeskočí, ne pád", () => {
    const now = new Date().toISOString();
    const records = [
      { id: 1, status: "pending", data: { steam_id: "1", nickname: "A", status: "not-a-real-status", visible: true, last_seen_at: now }, media: [], created_at: now, updated_at: now },
      { id: 2, status: "pending", data: { steam_id: "2", nickname: "B", visible: true }, media: [], created_at: now, updated_at: now },
      presenceRecord({ id: 3, steamId: "3", nickname: "Valid", lastSeenAt: now }),
    ];
    const result = selectActivePresences(records, new Set());
    assert.equal(result.length, 1);
    assert.equal(result[0].steamId, "3");
  });

  test("seřazeno nejnovější první", () => {
    const older = new Date(Date.now() - 10 * 60_000).toISOString();
    const newer = new Date().toISOString();
    const records = [
      presenceRecord({ id: 1, steamId: "old", nickname: "Old", lastSeenAt: older }),
      presenceRecord({ id: 2, steamId: "new", nickname: "New", lastSeenAt: newer }),
    ];
    const result = selectActivePresences(records, new Set());
    assert.equal(result[0].steamId, "new");
    assert.equal(result[1].steamId, "old");
  });
});

describe("evaluateSetPresence (opt-in / heartbeat / status change)", () => {
  test("nepřihlášený nemůže aktivovat presence", () => {
    const result = evaluateSetPresence(null, "play");
    assert.equal(result.ok, false);
  });

  test("blokovaný uživatel nemůže aktivovat presence", () => {
    const result = evaluateSetPresence({ steamId: "1", nickname: "A", avatarUrl: null, isBlocked: true }, "play");
    assert.equal(result.ok, false);
  });

  test("status musí být z whitelistu", () => {
    const user = { steamId: "1", nickname: "A", avatarUrl: null, isBlocked: false };
    assert.equal(evaluateSetPresence(user, "not-a-real-status").ok, false);
    assert.equal(evaluateSetPresence(user, "bosses").ok, true);
  });

  test("úspěch bere steamId/nickname/avatarUrl ze session (user), nikdy z inputu", () => {
    const user = { steamId: "session-steam-id", nickname: "SessionNick", avatarUrl: "https://example.test/a.jpg", isBlocked: false };
    const result = evaluateSetPresence(user, "bosses");
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.steamId, "session-steam-id");
      assert.equal(result.nickname, "SessionNick");
      assert.equal(result.status, "bosses");
    }
  });
});

describe("evaluateHidePresence", () => {
  test("nepřihlášený nemůže skrýt presence", () => {
    assert.equal(evaluateHidePresence(null).ok, false);
  });

  test("přihlášený dostane své steamId ze session", () => {
    const result = evaluateHidePresence({ steamId: "42", nickname: "A", avatarUrl: null, isBlocked: false });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.steamId, "42");
  });
});

describe("getActivePresences (UCA integrace)", () => {
  test("čte bez status filtru (presence není moderovaný obsah)", async () => {
    let seenUrl = "";
    await withMockedFetch(
      async (url) => {
        seenUrl = String(url);
        return jsonResponse(200, { data: [] });
      },
      () => getActivePresences()
    );
    assert.match(seenUrl, /collections\/multiplayer_presence\/records/);
    assert.doesNotMatch(seenUrl, /[?&]status=/);
  });
});

describe("setOwnPresence (upsert)", () => {
  test("bez existujícího recordu vytvoří nový (POST)", async () => {
    const calls: { method: string; url: string }[] = [];
    await withMockedFetch(
      async (url, init) => {
        calls.push({ method: init?.method ?? "GET", url: String(url) });
        if (calls.length === 1) return jsonResponse(200, { data: [] }); // find own -> none
        return jsonResponse(201, { data: { id: 1 } });
      },
      () => setOwnPresence({ steamId: "1", nickname: "A", avatarUrl: null, status: "play" })
    );
    assert.equal(calls.length, 2);
    assert.equal(calls[0].method, "GET");
    assert.equal(calls[1].method, "POST");
  });

  test("s existujícím recordem ho aktualizuje (PATCH), nevytvoří novou řádku", async () => {
    const calls: { method: string; url: string }[] = [];
    await withMockedFetch(
      async (url, init) => {
        calls.push({ method: init?.method ?? "GET", url: String(url) });
        if (calls.length === 1) {
          return jsonResponse(200, {
            data: [presenceRecord({ id: 77, steamId: "1", nickname: "A", lastSeenAt: new Date().toISOString() })],
          });
        }
        return jsonResponse(200, { data: { id: 77 } });
      },
      () => setOwnPresence({ steamId: "1", nickname: "A", avatarUrl: null, status: "bosses" })
    );
    assert.equal(calls.length, 2);
    assert.equal(calls[1].method, "PATCH");
    assert.match(calls[1].url, /records\/77$/);
  });
});

describe("hideOwnPresence", () => {
  test("existující record dostane visible=false", async () => {
    const calls: { method: string; body?: string }[] = [];
    await withMockedFetch(
      async (url, init) => {
        calls.push({ method: init?.method ?? "GET", body: init?.body as string | undefined });
        if (calls.length === 1) {
          return jsonResponse(200, {
            data: [presenceRecord({ id: 5, steamId: "1", nickname: "A", lastSeenAt: new Date().toISOString() })],
          });
        }
        return jsonResponse(200, { data: { id: 5 } });
      },
      () => hideOwnPresence("1")
    );
    assert.equal(calls[1].method, "PATCH");
    const sentBody = JSON.parse(calls[1].body ?? "{}");
    assert.equal(sentBody.data.visible, false);
  });

  test("bez existujícího recordu je no-op (žádný PATCH request)", async () => {
    const calls: string[] = [];
    await withMockedFetch(
      async (url, init) => {
        calls.push(init?.method ?? "GET");
        return jsonResponse(200, { data: [] });
      },
      () => hideOwnPresence("1")
    );
    assert.deepEqual(calls, ["GET"]);
  });
});
