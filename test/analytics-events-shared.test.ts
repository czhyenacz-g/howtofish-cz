import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ANALYTICS_EVENTS,
  CLIENT_TRACKABLE_EVENTS,
  isAnalyticsEvent,
  isClientTrackableEvent,
  sanitizeAnonymousId,
  sanitizeMetadata,
  sanitizePath,
} from "../lib/analytics/events-shared.ts";

test("ANALYTICS_EVENTS: obsahuje přesně požadovaných 12 eventů", () => {
  assert.deepEqual(
    [...ANALYTICS_EVENTS].sort(),
    [
      "affiliate_click",
      "feedback_click",
      "fish_upload",
      "game_score",
      "game_started",
      "gear_affiliate_click",
      "multiplayer_join",
      "multiplayer_leave",
      "page_view",
      "steam_login",
      "suggestion_created",
      "wave_sent",
    ].sort()
  );
});

test("isAnalyticsEvent: whitelist event je accepted", () => {
  assert.equal(isAnalyticsEvent("page_view"), true);
  assert.equal(isAnalyticsEvent("affiliate_click"), true);
});

test("isAnalyticsEvent: neznámý/free-text event name je rejected", () => {
  assert.equal(isAnalyticsEvent("button_click"), false);
  assert.equal(isAnalyticsEvent("PAGE_VIEW"), false);
  assert.equal(isAnalyticsEvent(""), false);
  assert.equal(isAnalyticsEvent(123), false);
  assert.equal(isAnalyticsEvent(null), false);
  assert.equal(isAnalyticsEvent(undefined), false);
});

test("isClientTrackableEvent: jen page_view/affiliate_click/feedback_click/game_started smí přes veřejný endpoint", () => {
  for (const event of CLIENT_TRACKABLE_EVENTS) {
    assert.equal(isClientTrackableEvent(event), true);
  }
  // Server-only eventy (spoofovatelné skóre apod.) NESMÍ projít jako client-trackable.
  for (const event of ["steam_login", "fish_upload", "suggestion_created", "game_score", "multiplayer_join", "multiplayer_leave", "wave_sent"]) {
    assert.equal(isClientTrackableEvent(event), false, `${event} by nemělo být client-trackable`);
  }
});

test("sanitizeMetadata: povolené klíče pro daný event projdou beze změny", () => {
  const result = sanitizeMetadata("affiliate_click", { promotion_id: "community-42", placement: "banner" });
  assert.deepEqual(result, { promotion_id: "community-42", placement: "banner" });
});

test("sanitizeMetadata: klíče mimo whitelist daného eventu se ořežou", () => {
  const result = sanitizeMetadata("page_view", { evil: "payload", note: "osobní údaj" });
  assert.deepEqual(result, {});
});

test("sanitizeMetadata: klíč povolený jen u JINÉHO eventu se u tohohle eventu ořízne", () => {
  // "score" patří jen game_score, ne affiliate_click.
  const result = sanitizeMetadata("affiliate_click", { promotion_id: "1", score: 999999 });
  assert.deepEqual(result, { promotion_id: "1" });
});

test("sanitizeMetadata: gear_affiliate_click povoluje jen bezpečné identifikátory, žádnou URL/destination", () => {
  const result = sanitizeMetadata("gear_affiliate_click", {
    creator_slug: "housebox",
    product_name: "RØDE NT-USB",
    category: "microphone",
    confidence: "historical",
    link_type: "allegro-search",
    destination: "https://go.dognet.com/?url=secret",
  });
  assert.deepEqual(result, {
    creator_slug: "housebox",
    product_name: "RØDE NT-USB",
    category: "microphone",
    confidence: "historical",
    link_type: "allegro-search",
  });
});

test("sanitizeMetadata: vnořené objekty/pole se ořežou (jen primitivní hodnoty)", () => {
  const result = sanitizeMetadata("fish_upload", { fish_slug: { nested: "object" } });
  assert.deepEqual(result, {});
});

test("sanitizeMetadata: příliš dlouhý string se zahodí", () => {
  const result = sanitizeMetadata("fish_upload", { fish_slug: "a".repeat(500) });
  assert.deepEqual(result, {});
});

test("sanitizeMetadata: ne-objekt (pole/string/číslo) vrátí prázdný objekt", () => {
  assert.deepEqual(sanitizeMetadata("page_view", ["a", "b"]), {});
  assert.deepEqual(sanitizeMetadata("page_view", "string"), {});
  assert.deepEqual(sanitizeMetadata("page_view", null), {});
});

test("sanitizePath: platná interní cesta projde", () => {
  assert.equal(sanitizePath("/ryby/spider-crab"), "/ryby/spider-crab");
});

test("sanitizePath: nepovolené tvary (bez lomítka, moc dlouhé, ne-string) se zahodí", () => {
  assert.equal(sanitizePath("ryby"), null);
  assert.equal(sanitizePath("/" + "a".repeat(400)), null);
  assert.equal(sanitizePath(123), null);
  assert.equal(sanitizePath(null), null);
});

test("sanitizeAnonymousId: platné UUID/anon- tvary projdou", () => {
  assert.equal(sanitizeAnonymousId("550e8400-e29b-41d4-a716-446655440000"), "550e8400-e29b-41d4-a716-446655440000");
  assert.equal(sanitizeAnonymousId("anon-abc123-xyz789"), "anon-abc123-xyz789");
});

test("sanitizeAnonymousId: nepovolené znaky/délka/typ se zahodí", () => {
  assert.equal(sanitizeAnonymousId("<script>alert(1)</script>"), null);
  assert.equal(sanitizeAnonymousId("a".repeat(200)), null);
  assert.equal(sanitizeAnonymousId(""), null);
  assert.equal(sanitizeAnonymousId(42), null);
  assert.equal(sanitizeAnonymousId(null), null);
});
