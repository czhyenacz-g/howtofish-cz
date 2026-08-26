import { test, describe } from "node:test";
import assert from "node:assert/strict";

// getUserBySteamId (lib/auth/db.ts) používá @vercel/postgres, které bez
// nastaveného POSTGRES_URL/DATABASE_URL vždy vyhodí VercelPostgresError
// (missing_connection_string) — přesně tenhle běžný testovací stav
// (žádná reálná DB) použijeme k ověření DB-exception větve v
// getUserForSession, beze změny mocku, viz db-upsert.test.ts pro stejné
// omezení ("bez skutečné DB tenhle test spouštět nejde" pro happy path).
delete process.env.POSTGRES_URL;
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL_NON_POOLING;
delete process.env.POSTGRES_PRISMA_URL;

const { getUserForSession } = await import("../lib/auth/get-user-for-session.ts");

describe("getUserForSession", () => {
  test("bez session vrátí null (DB se vůbec nevolá)", async () => {
    const result = await getUserForSession(null);
    assert.equal(result, null);
  });

  test("DB exception (Postgres nedostupný) -> null, ne pád/výjimka ven", async () => {
    // getUserBySteamId nad @vercel/postgres bez env connection stringu
    // spolehlivě vyhodí — ověřujeme, že getUserForSession tuhle výjimku
    // sama zachytí a nikdy ji nepropustí ke callerovi (await by jinak
    // tenhle test shodil rejected promisí).
    const result = await getUserForSession({ steamId: "76561198000000000" });
    assert.equal(result, null);
  });

  test("DB exception nepropadne do calleru (await se nikdy neodmítne)", async () => {
    await assert.doesNotReject(getUserForSession({ steamId: "76561198000000000" }));
  });
});

describe("stávající session validace zůstává nedotčená", () => {
  test("verifySessionCookieValue má pořád vlastní test suite (test/session.test.ts) a nemění se touhle opravou", async () => {
    const { verifySessionCookieValue } = await import("../lib/auth/session.ts");
    // Jen ověřuje, že se export beze změny pořád dá naimportovat a
    // chová se jako čistá funkce — detailní chování (tamper/expiraci)
    // pokrývá session.test.ts, tady bychom ho jen duplikovali.
    assert.equal(verifySessionCookieValue(undefined), null);
    assert.equal(verifySessionCookieValue("not-a-valid-cookie"), null);
  });
});
