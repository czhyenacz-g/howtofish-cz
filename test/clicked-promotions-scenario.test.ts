import { test } from "node:test";
import assert from "node:assert/strict";
import { excludeRecentlyClicked, markPromotionClicked } from "../lib/promotions/clicked-promotions.ts";
import { pickPromotion } from "../lib/promotions/match-route.ts";

// Scénář ze zadání: /ryby, tři kandidáti A(101,w5) B(102,w2) C(103,w1),
// klik na 101 -> 101 vůbec není candidate, los běží jen mezi 102/103 v
// poměru 2:1; po expiraci (7 dní) se 101 vrátí a váhy jsou zase 5:2:1.
class FakeStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

function withFakeLocalStorage<T>(run: (storage: FakeStorage) => T): T {
  const storage = new FakeStorage();
  const original = (globalThis as { localStorage?: unknown }).localStorage;
  // @ts-expect-error test fake, not a real Storage instance
  globalThis.localStorage = storage;
  try {
    return run(storage);
  } finally {
    // @ts-expect-error restoring possibly-undefined original
    globalThis.localStorage = original;
  }
}

const PATHNAME = "/ryby";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function candidates() {
  return [
    { id: "101", pagePattern: PATHNAME, weight: 5 },
    { id: "102", pagePattern: PATHNAME, weight: 2 },
    { id: "103", pagePattern: PATHNAME, weight: 1 },
  ];
}

function pickMany(pool: ReturnType<typeof candidates>, n: number) {
  const counts: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    const picked = pickPromotion(pool, PATHNAME);
    if (picked) counts[picked.id] = (counts[picked.id] ?? 0) + 1;
  }
  return counts;
}

test("scénář: klik na 101 -> 101 nikdy není candidate, los běží jen mezi 102/103 v poměru cca 2:1", () => {
  withFakeLocalStorage(() => {
    const now = 1_000_000;
    markPromotionClicked("101", now);

    const available = excludeRecentlyClicked(candidates(), now);
    assert.deepEqual(
      available.map((c) => c.id),
      ["102", "103"]
    );

    const N = 4000;
    const counts = pickMany(available, N);
    assert.equal(counts["101"], undefined, "101 se nikdy nesmí vybrat");
    assert.ok(counts["102"] > 0 && counts["103"] > 0, "obě zbylé promotions musí mít šanci se objevit");

    // Poměr vah 2:1 -> 102 by měl padnout zhruba 2x častěji než 103.
    // Široká tolerance (1.5–2.6), ať test není flaky, jen ověřuje, že
    // to není 1:1 ani úplně mimo.
    const ratio = counts["102"] / counts["103"];
    assert.ok(ratio > 1.5 && ratio < 2.6, `poměr 102:103 = ${ratio}, čekáno cca 2:1`);
  });
});

test("scénář: po expiraci (7 dní) se 101 vrátí a váhy jsou zase 5:2:1", () => {
  withFakeLocalStorage(() => {
    const clickedAt = 1_000_000;
    markPromotionClicked("101", clickedAt);

    const now = clickedAt + SEVEN_DAYS_MS + 1000;
    const available = excludeRecentlyClicked(candidates(), now);
    assert.deepEqual(
      available.map((c) => c.id),
      ["101", "102", "103"]
    );

    const N = 6000;
    const counts = pickMany(available, N);
    assert.ok(counts["101"] > 0 && counts["102"] > 0 && counts["103"] > 0);

    // Poměr vah 5:2:1 vůči 103 jako základně.
    const ratio101 = counts["101"] / counts["103"];
    const ratio102 = counts["102"] / counts["103"];
    assert.ok(ratio101 > 3.5 && ratio101 < 7, `poměr 101:103 = ${ratio101}, čekáno cca 5:1`);
    assert.ok(ratio102 > 1.3 && ratio102 < 3, `poměr 102:103 = ${ratio102}, čekáno cca 2:1`);
  });
});
