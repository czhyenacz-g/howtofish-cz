import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../app/components/PageViewTracker.tsx", import.meta.url)), "utf8");

test("PageViewTracker.tsx: je 'use client' a nevykresluje nic (return null)", () => {
  const firstLine = source.trimStart().split("\n")[0];
  assert.match(firstLine, /^["']use client["']/);
  assert.match(source, /return null;/);
});

test("PageViewTracker.tsx: přeskočí route mimo whitelist (isPageViewRoute)", () => {
  assert.match(source, /if \(!isPageViewRoute\(pathname\)\) return;/);
});

test("PageViewTracker.tsx: loguje jen jednou na skutečnou navigaci — ref porovnání zabrání duplicitě i při StrictMode dvojitém efektu", () => {
  const effectBody = /useEffect\(\(\) => \{([\s\S]*?)\n {2}\}, \[pathname\]\);/.exec(source)?.[1];
  assert.ok(effectBody, "nepodařilo se najít mount efekt");
  assert.match(effectBody, /if \(lastTrackedPathRef\.current === pathname\) return;/);
  assert.match(effectBody, /lastTrackedPathRef\.current = pathname;/);
  assert.doesNotMatch(source, /setInterval/);
});
