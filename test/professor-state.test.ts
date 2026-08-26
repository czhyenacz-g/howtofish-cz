import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isProfessorMinimizedForRoute,
  professorStorageKey,
  rememberProfessorMinimized,
} from "../lib/character-callouts/professor-state.ts";

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

test("professorStorageKey: obsahuje pathname, aby byl klíč per route", () => {
  assert.equal(professorStorageKey("/bossove"), "howtofish-professor-callout:/bossove");
  assert.notEqual(professorStorageKey("/bossove"), professorStorageKey("/lokace"));
});

test("isProfessorMinimizedForRoute: false, dokud nic není uložené", () => {
  withFakeSessionStorage(() => {
    assert.equal(isProfessorMinimizedForRoute("/bossove"), false);
  });
});

test("rememberProfessorMinimized + isProfessorMinimizedForRoute: zapamatuje minimalizaci jen pro danou route", () => {
  withFakeSessionStorage(() => {
    rememberProfessorMinimized("/bossove");
    assert.equal(isProfessorMinimizedForRoute("/bossove"), true);
    // Jiná route není ovlivněná (item 6 v zadání).
    assert.equal(isProfessorMinimizedForRoute("/lokace"), false);
  });
});

test("isProfessorMinimizedForRoute: nikdy nespadne, když sessionStorage.getItem hodí výjimku", () => {
  const original = (globalThis as { sessionStorage?: unknown }).sessionStorage;
  // @ts-expect-error simulace private-mode chyby
  globalThis.sessionStorage = {
    getItem() {
      throw new Error("blocked");
    },
  };
  try {
    assert.equal(isProfessorMinimizedForRoute("/bossove"), false);
  } finally {
    // @ts-expect-error restore
    globalThis.sessionStorage = original;
  }
});

test("rememberProfessorMinimized: nikdy nespadne, když sessionStorage.setItem hodí výjimku", () => {
  const original = (globalThis as { sessionStorage?: unknown }).sessionStorage;
  // @ts-expect-error simulace private-mode chyby
  globalThis.sessionStorage = {
    setItem() {
      throw new Error("blocked");
    },
  };
  try {
    assert.doesNotThrow(() => rememberProfessorMinimized("/bossove"));
  } finally {
    // @ts-expect-error restore
    globalThis.sessionStorage = original;
  }
});
