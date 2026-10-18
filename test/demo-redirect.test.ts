import { test, describe } from "node:test";
import assert from "node:assert/strict";
import nextConfig from "../next.config.ts";

describe("/demo permanent redirect", () => {
  test("/demo přesměrovává trvale (308) na /ryby", async () => {
    assert.equal(typeof nextConfig.redirects, "function");
    const redirects = await nextConfig.redirects!();
    const rule = redirects.find((r) => r.source === "/demo");
    assert.ok(rule, "chybí redirect rule pro /demo");
    assert.equal(rule?.destination, "/ryby");
    assert.equal(rule?.permanent, true);
  });

  test("/demo/:path* přesměrovává trvale na /ryby", async () => {
    const redirects = await nextConfig.redirects!();
    const rule = redirects.find((r) => r.source === "/demo/:path*");
    assert.ok(rule, "chybí redirect rule pro /demo/:path*");
    assert.equal(rule?.destination, "/ryby");
    assert.equal(rule?.permanent, true);
  });
});

describe("legacy přesměrování zůstávají zachovaná", () => {
  test("/stream/:slug -> /streameri/:slug (trvale)", async () => {
    const redirects = await nextConfig.redirects!();
    const rule = redirects.find((r) => r.source === "/stream/:slug");
    assert.equal(rule?.destination, "/streameri/:slug");
    assert.equal(rule?.permanent, true);
  });

  test("odstraněný placeholder /aktualizace -> /o-hre (trvale)", async () => {
    const redirects = await nextConfig.redirects!();
    const rule = redirects.find((r) => r.source === "/aktualizace");
    assert.equal(rule?.destination, "/o-hre");
    assert.equal(rule?.permanent, true);
  });
});
