import { test } from "node:test";
import assert from "node:assert/strict";
import { excludeRecentlyClicked, getClickedPromotionIds, markPromotionClicked } from "../lib/promotions/clicked-promotions.ts";
import { isExternalHref, pickPromotion } from "../lib/promotions/match-route.ts";

// Scénář ze zadání (sekce 15): interní soutěž (D, href "/hra", weight 6)
// rotuje spolu se třemi affiliate bannery (A/B/C, weight 2 každý) na "*"
// (stejná specificity tier jako všechny současné produkční banner
// promotions, viz report). D má být eligible ~50 % a NIKDY se nevyřadí
// kliknutím — na rozdíl od A/B/C.
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

function withFakeLocalStorage<T>(run: () => T): T {
  const storage = new FakeStorage();
  const original = (globalThis as { localStorage?: unknown }).localStorage;
  // @ts-expect-error test fake, not a real Storage instance
  globalThis.localStorage = storage;
  try {
    return run();
  } finally {
    // @ts-expect-error restoring possibly-undefined original
    globalThis.localStorage = original;
  }
}

const PATHNAME = "/ryby";

function candidate(id: string, href: string, weight: number) {
  return { id, pagePattern: "*", weight, href };
}

function contestAndAffiliates() {
  return [
    candidate("A", "https://example.com/monitor", 2),
    candidate("B", "https://example.com/mys", 2),
    candidate("C", "https://example.com/klavesnice", 2),
    candidate("D", "/hra", 6),
  ];
}

// Simuluje přesně to, co AffiliateBannerSlot.handleClick dělá — mark se
// zapíše JEN pro externí (affiliate) href, nikdy pro interní.
function simulateClick(id: string, href: string, now: number) {
  if (!isExternalHref(href)) return;
  markPromotionClicked(id, now);
}

function pickMany(pool: ReturnType<typeof contestAndAffiliates>, n: number) {
  const counts: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    const picked = pickPromotion(pool, PATHNAME);
    if (picked) counts[picked.id] = (counts[picked.id] ?? 0) + 1;
  }
  return counts;
}

test("weighted rotace: D (weight 6) vychází ~50 % proti A+B+C (weight 2 každý, dohromady 6)", () => {
  const N = 8000;
  const counts = pickMany(contestAndAffiliates(), N);
  const contestShare = counts["D"] / N;
  assert.ok(contestShare > 0.4 && contestShare < 0.6, `podíl D = ${contestShare}, čekáno cca 0.5`);
});

test("klik na všechny tři affiliate promotions (A, B, C) je vyřadí na 7 dní, D zůstává eligible", () => {
  withFakeLocalStorage(() => {
    const now = 2_000_000;
    for (const c of contestAndAffiliates()) {
      if (c.id === "D") continue;
      simulateClick(c.id, c.href, now);
    }

    const clicked = getClickedPromotionIds(now);
    assert.deepEqual(Object.keys(clicked).sort(), ["A", "B", "C"]);

    const available = excludeRecentlyClicked(contestAndAffiliates(), now);
    assert.deepEqual(
      available.map((c) => c.id),
      ["D"]
    );
  });
});

test("klik na D (interní soutěž) se nezapíše do 7denního vyřazení — D zůstává eligible i po vlastním kliknutí", () => {
  withFakeLocalStorage(() => {
    const now = 3_000_000;
    simulateClick("D", "/hra", now);

    const clicked = getClickedPromotionIds(now);
    assert.deepEqual(clicked, {});

    const available = excludeRecentlyClicked(contestAndAffiliates(), now);
    assert.ok(available.some((c) => c.id === "D"));
  });
});

test("D je interní (isExternalHref === false), A/B/C jsou externí affiliate", () => {
  assert.equal(isExternalHref("/hra"), false);
  for (const c of contestAndAffiliates()) {
    if (c.id === "D") continue;
    assert.equal(isExternalHref(c.href), true);
  }
});
