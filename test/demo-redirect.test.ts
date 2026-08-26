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
