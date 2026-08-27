import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanupExpiredPromotionClicks,
  excludeRecentlyClicked,
  getClickedPromotionIds,
  isPromotionRecentlyClicked,
  markPromotionClicked,
} from "../lib/promotions/clicked-promotions.ts";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Stejný FakeStorage vzor jako professor-state.test.ts/seller-state.test.ts
// — tady pro localStorage (ne sessionStorage), viz proč v clicked-promotions.ts.
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

test("markPromotionClicked: uloží ID s timestampem, čitelné přes getClickedPromotionIds", () => {
  withFakeLocalStorage(() => {
    markPromotionClicked("community-123", 1_000_000);
    assert.deepEqual(getClickedPromotionIds(1_000_000), { "community-123": 1_000_000 });
  });
});

test("isPromotionRecentlyClicked: promotion mladší než 7 dní je excluded (true)", () => {
  withFakeLocalStorage(() => {
    const clickedAt = 1_000_000;
    markPromotionClicked("community-1", clickedAt);
    const now = clickedAt + SEVEN_DAYS_MS - 1;
    assert.equal(isPromotionRecentlyClicked("community-1", now), true);
  });
});

test("isPromotionRecentlyClicked: promotion přesně na hraně 7 dní už NENÍ excluded (>=, ne >)", () => {
  withFakeLocalStorage(() => {
    const clickedAt = 1_000_000;
    markPromotionClicked("community-1", clickedAt);
    const now = clickedAt + SEVEN_DAYS_MS;
    assert.equal(isPromotionRecentlyClicked("community-1", now), false);
  });
});

test("isPromotionRecentlyClicked: promotion starší než 7 dní není excluded (false)", () => {
  withFakeLocalStorage(() => {
    const clickedAt = 1_000_000;
    markPromotionClicked("community-1", clickedAt);
    const now = clickedAt + SEVEN_DAYS_MS + 1000;
    assert.equal(isPromotionRecentlyClicked("community-1", now), false);
  });
});

test("isPromotionRecentlyClicked: neklikaná promotion je false", () => {
  withFakeLocalStorage(() => {
    assert.equal(isPromotionRecentlyClicked("community-999"), false);
  });
});

test("getClickedPromotionIds: expirované záznamy se při čtení ignorují (nejsou v návratové hodnotě)", () => {
  withFakeLocalStorage((storage) => {
    const now = 10_000_000;
    storage.setItem(
      "howtofish:clicked-promotions",
      JSON.stringify({ fresh: now - 1000, expired: now - SEVEN_DAYS_MS - 1000 })
    );
    const result = getClickedPromotionIds(now);
    assert.deepEqual(result, { fresh: now - 1000 });
  });
});

test("getClickedPromotionIds: poškozený JSON nespadne, vrátí prázdný objekt", () => {
  withFakeLocalStorage((storage) => {
    storage.setItem("howtofish:clicked-promotions", "{not valid json");
    assert.deepEqual(getClickedPromotionIds(), {});
  });
});

test("getClickedPromotionIds: uložené pole (ne objekt) se ignoruje, vrátí prázdný objekt", () => {
  withFakeLocalStorage((storage) => {
    storage.setItem("howtofish:clicked-promotions", JSON.stringify(["a", "b"]));
    assert.deepEqual(getClickedPromotionIds(), {});
  });
});

test("getClickedPromotionIds: hodnoty, co nejsou číslo, se ignorují (obranné parsování)", () => {
  withFakeLocalStorage((storage) => {
    storage.setItem(
      "howtofish:clicked-promotions",
      JSON.stringify({ ok: 1_000_000, bad: "not-a-number", alsoBad: null })
    );
    assert.deepEqual(getClickedPromotionIds(2_000_000), { ok: 1_000_000 });
  });
});

test("getClickedPromotionIds: nic nespadne, když localStorage.getItem hodí výjimku", () => {
  const original = (globalThis as { localStorage?: unknown }).localStorage;
  // @ts-expect-error simulace private-mode chyby
  globalThis.localStorage = {
    getItem() {
      throw new Error("blocked");
    },
  };
  try {
    assert.deepEqual(getClickedPromotionIds(), {});
  } finally {
    // @ts-expect-error restore
    globalThis.localStorage = original;
  }
});

test("markPromotionClicked: nic nespadne, když localStorage.setItem hodí výjimku (navigace na reklamu nesmí být ovlivněná)", () => {
  const original = (globalThis as { localStorage?: unknown }).localStorage;
  // @ts-expect-error simulace private-mode/quota chyby
  globalThis.localStorage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error("quota exceeded");
    },
  };
  try {
    assert.doesNotThrow(() => markPromotionClicked("community-1"));
  } finally {
    // @ts-expect-error restore
    globalThis.localStorage = original;
  }
});

test("žádný SSR access — bez globalThis.localStorage (Node prostředí) se nic nerozbije", () => {
  const original = (globalThis as { localStorage?: unknown }).localStorage;
  // @ts-expect-error simulace SSR (žádný localStorage global vůbec)
  delete globalThis.localStorage;
  try {
    assert.deepEqual(getClickedPromotionIds(), {});
    assert.equal(isPromotionRecentlyClicked("community-1"), false);
    assert.doesNotThrow(() => markPromotionClicked("community-1"));
    assert.doesNotThrow(() => cleanupExpiredPromotionClicks());
  } finally {
    // @ts-expect-error restore
    globalThis.localStorage = original;
  }
});

test("markPromotionClicked: nový klik na stejné ID přepíše timestamp (7denní okno se počítá znovu)", () => {
  withFakeLocalStorage(() => {
    markPromotionClicked("community-1", 1_000_000);
    markPromotionClicked("community-1", 5_000_000);
    assert.deepEqual(getClickedPromotionIds(5_000_000), { "community-1": 5_000_000 });
  });
});

test("markPromotionClicked: víc promotions se ukládá nezávisle vedle sebe", () => {
  withFakeLocalStorage(() => {
    markPromotionClicked("community-101", 1000);
    markPromotionClicked("community-102", 2000);
    assert.deepEqual(getClickedPromotionIds(2000), { "community-101": 1000, "community-102": 2000 });
  });
});

test("cleanupExpiredPromotionClicks: fyzicky odstraní expirované záznamy ze storage", () => {
  withFakeLocalStorage((storage) => {
    const now = 10_000_000;
    storage.setItem(
      "howtofish:clicked-promotions",
      JSON.stringify({ fresh: now - 1000, expired: now - SEVEN_DAYS_MS - 1000 })
    );
    cleanupExpiredPromotionClicks(now);
    const raw = JSON.parse(storage.getItem("howtofish:clicked-promotions") ?? "{}");
    assert.deepEqual(raw, { fresh: now - 1000 });
  });
});

test("cleanupExpiredPromotionClicks: prázdný výsledek po úklidu odstraní celý klíč ze storage", () => {
  withFakeLocalStorage((storage) => {
    const now = 10_000_000;
    storage.setItem("howtofish:clicked-promotions", JSON.stringify({ expired: now - SEVEN_DAYS_MS - 1000 }));
    cleanupExpiredPromotionClicks(now);
    assert.equal(storage.getItem("howtofish:clicked-promotions"), null);
  });
});

test("excludeRecentlyClicked: odfiltruje jen prokliknuté kandidáty, ostatní zůstanou v původním pořadí", () => {
  withFakeLocalStorage(() => {
    markPromotionClicked("community-101", 1000);
    const candidates = [
      { id: "community-101", weight: 5 },
      { id: "community-102", weight: 2 },
      { id: "community-103", weight: 1 },
    ];
    const result = excludeRecentlyClicked(candidates, 1000);
    assert.deepEqual(
      result.map((c) => c.id),
      ["community-102", "community-103"]
    );
  });
});

test("excludeRecentlyClicked: nic neklikané -> vrátí kandidáty beze změny", () => {
  withFakeLocalStorage(() => {
    const candidates = [{ id: "community-1", weight: 1 }];
    assert.deepEqual(excludeRecentlyClicked(candidates), candidates);
  });
});

test("excludeRecentlyClicked: expirovaný klik kandidáta neodfiltruje (vrátí se zpátky do rotace)", () => {
  withFakeLocalStorage(() => {
    const clickedAt = 1_000_000;
    markPromotionClicked("community-101", clickedAt);
    const candidates = [{ id: "community-101", weight: 5 }];
    const now = clickedAt + SEVEN_DAYS_MS + 1;
    assert.deepEqual(excludeRecentlyClicked(candidates, now), candidates);
  });
});
