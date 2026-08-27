import { test } from "node:test";
import assert from "node:assert/strict";
import { getOrCreateAnonymousId } from "../lib/analytics/anonymous-id.ts";

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

test("getOrCreateAnonymousId: vytvoří a uloží nové ID, pokud žádné neexistuje", () => {
  withFakeLocalStorage((storage) => {
    const id = getOrCreateAnonymousId();
    assert.ok(id && id.length > 0);
    assert.equal(storage.getItem("howtofish:anonymous-id"), id);
  });
});

test("getOrCreateAnonymousId: opakované volání vrací STEJNÉ ID (stabilní per browser)", () => {
  withFakeLocalStorage(() => {
    const first = getOrCreateAnonymousId();
    const second = getOrCreateAnonymousId();
    assert.equal(first, second);
  });
});

test("getOrCreateAnonymousId: ID neobsahuje nic jiného než [a-zA-Z0-9-] (žádný fingerprint/IP odvozený tvar)", () => {
  withFakeLocalStorage(() => {
    const id = getOrCreateAnonymousId();
    assert.match(id ?? "", /^[a-zA-Z0-9-]+$/);
  });
});

test("getOrCreateAnonymousId: bez globalThis.localStorage (SSR) vrátí null, nespadne", () => {
  const original = (globalThis as { localStorage?: unknown }).localStorage;
  // @ts-expect-error simulace SSR
  delete globalThis.localStorage;
  try {
    assert.equal(getOrCreateAnonymousId(), null);
  } finally {
    // @ts-expect-error restore
    globalThis.localStorage = original;
  }
});

test("getOrCreateAnonymousId: localStorage exception (private mode) nespadne, vrátí null", () => {
  const original = (globalThis as { localStorage?: unknown }).localStorage;
  // @ts-expect-error simulace private-mode chyby
  globalThis.localStorage = {
    getItem() {
      throw new Error("blocked");
    },
  };
  try {
    assert.equal(getOrCreateAnonymousId(), null);
  } finally {
    // @ts-expect-error restore
    globalThis.localStorage = original;
  }
});
