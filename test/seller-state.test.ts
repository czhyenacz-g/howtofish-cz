import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getSellerLastShownAt,
  getSellerShownRoutes,
  rememberSellerShown,
} from "../lib/character-callouts/seller-state.ts";

// Stejný FakeStorage vzor jako test/professor-state.test.ts.
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

function withFakeSessionStorage<T>(run: (storage: FakeStorage) => T): T {
  const storage = new FakeStorage();
  const original = (globalThis as { sessionStorage?: unknown }).sessionStorage;
  // @ts-expect-error test fake, not a real Storage instance
  globalThis.sessionStorage = storage;
  try {
    return run(storage);
  } finally {
    // @ts-expect-error restoring possibly-undefined original
    globalThis.sessionStorage = original;
  }
}

test("getSellerLastShownAt: null, dokud nic není uložené", () => {
  withFakeSessionStorage(() => {
    assert.equal(getSellerLastShownAt(), null);
  });
});

test("getSellerShownRoutes: prázdné pole, dokud nic není uložené", () => {
  withFakeSessionStorage(() => {
    assert.deepEqual(getSellerShownRoutes(), []);
  });
});

test("rememberSellerShown: zapamatuje timestamp i route", () => {
  withFakeSessionStorage(() => {
    rememberSellerShown("/lokace", 12345);
    assert.equal(getSellerLastShownAt(), 12345);
    assert.deepEqual(getSellerShownRoutes(), ["/lokace"]);
  });
});

test("rememberSellerShown: je session-globální (na rozdíl od profesora), routy se hromadí napříč voláními", () => {
  withFakeSessionStorage(() => {
    rememberSellerShown("/lokace", 1000);
    rememberSellerShown("/ryby", 2000);
    assert.deepEqual(getSellerShownRoutes(), ["/lokace", "/ryby"]);
    // lastShownAt je poslední zápis, ne historie.
    assert.equal(getSellerLastShownAt(), 2000);
  });
});

test("rememberSellerShown: stejná route se v shownRoutes nezdvojí", () => {
  withFakeSessionStorage(() => {
    rememberSellerShown("/lokace", 1000);
    rememberSellerShown("/lokace", 5000);
    assert.deepEqual(getSellerShownRoutes(), ["/lokace"]);
    assert.equal(getSellerLastShownAt(), 5000);
  });
});

test("getSellerLastShownAt: nikdy nespadne, když sessionStorage.getItem hodí výjimku", () => {
  const original = (globalThis as { sessionStorage?: unknown }).sessionStorage;
  // @ts-expect-error simulace private-mode chyby
  globalThis.sessionStorage = {
    getItem() {
      throw new Error("blocked");
    },
  };
  try {
    assert.equal(getSellerLastShownAt(), null);
  } finally {
    // @ts-expect-error restore
    globalThis.sessionStorage = original;
  }
});

test("getSellerShownRoutes: nikdy nespadne, když je uložená hodnota poškozený JSON", () => {
  withFakeSessionStorage((storage) => {
    storage.setItem("howtofish-seller-callout:shownRoutes", "{not json");
    assert.deepEqual(getSellerShownRoutes(), []);
  });
});

test("getSellerShownRoutes: ignoruje ne-string položky v poli (obranné parsování)", () => {
  withFakeSessionStorage((storage) => {
    storage.setItem("howtofish-seller-callout:shownRoutes", JSON.stringify(["/lokace", 42, null]));
    assert.deepEqual(getSellerShownRoutes(), ["/lokace"]);
  });
});

test("rememberSellerShown: nikdy nespadne, když sessionStorage.setItem hodí výjimku", () => {
  const original = (globalThis as { sessionStorage?: unknown }).sessionStorage;
  // @ts-expect-error simulace private-mode chyby
  globalThis.sessionStorage = {
    setItem() {
      throw new Error("blocked");
    },
  };
  try {
    assert.doesNotThrow(() => rememberSellerShown("/lokace", 1000));
  } finally {
    // @ts-expect-error restore
    globalThis.sessionStorage = original;
  }
});
