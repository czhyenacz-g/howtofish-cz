import { test, describe } from "node:test";
import assert from "node:assert/strict";
import robots from "../app/robots.ts";

describe("robots.txt", () => {
  const result = robots();
  const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;

  test("povoluje crawl veřejných stránek (allow: /)", () => {
    assert.equal(rules?.allow, "/");
  });

  test("nepoužívá globální Disallow: /", () => {
    const disallow = rules?.disallow;
    const disallowList = Array.isArray(disallow) ? disallow : disallow ? [disallow] : [];
    assert.ok(!disallowList.includes("/"));
  });

  test("odkazuje na sitemap", () => {
    assert.ok(typeof result.sitemap === "string" && result.sitemap.endsWith("/sitemap.xml"));
  });
});
