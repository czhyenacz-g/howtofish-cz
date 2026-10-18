import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { LIVE_REVALIDATE_SECONDS } from "../lib/streams/youtube.ts";

const source = readFileSync(fileURLToPath(new URL("../lib/streams/youtube.ts", import.meta.url)), "utf8");

// search.list má vlastní denní limit (~50 volání, sdílený s ruční video
// pipeline) — cache live výsledku musí být dost dlouhá, aby ho ISR stránky
// s 60s revalidací nevyčerpaly.
test("YouTube live cache je 30–60 minut (nejvýš 48 search.list volání denně)", () => {
  assert.ok(LIVE_REVALIDATE_SECONDS >= 1800 && LIVE_REVALIDATE_SECONDS <= 3600, String(LIVE_REVALIDATE_SECONDS));
  assert.ok(86400 / LIVE_REVALIDATE_SECONDS <= 48);
});

test("search i videos volání používají LIVE_REVALIDATE_SECONDS, žádná 60s cache", () => {
  assert.equal(source.match(/revalidateSeconds: LIVE_REVALIDATE_SECONDS/g)?.length, 2);
  assert.doesNotMatch(source, /revalidateSeconds: 60\b/);
});

test("výpadek YouTube API se odchytí — provider vrátí status error, ne výjimku", () => {
  assert.match(source, /catch \(error\) \{[\s\S]*?status: "error", streams: \[\]/);
});
