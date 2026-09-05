import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildAllegroSearchUrl, buildDognetAffiliateUrl, normalizeTrackingSlug, DOGNET_CONFIG } from "../lib/affiliate/dognet.ts";
import { buildGearD2, getGearAffiliateLink, getGearCtaLabel, resolveGearSearchQuery } from "../lib/creators/gear-affiliate.ts";
import type { CreatorGearItem } from "../data/creator-gear.ts";

function gearItem(overrides: Partial<CreatorGearItem> = {}): CreatorGearItem {
  return {
    creatorSlug: "housebox",
    category: "microphone",
    productName: "RØDE NT-USB",
    brand: "RØDE",
    model: "NT-USB",
    sourceUrl: "https://example.com/video",
    sourceType: "other",
    verifiedAt: "2026-09-05",
    confidence: "historical",
    active: true,
    ...overrides,
  };
}

describe("buildAllegroSearchUrl", () => {
  test("Rode NT-USB -> validní Allegro search URL s '+' za mezeru", () => {
    const url = buildAllegroSearchUrl("Rode NT-USB");
    assert.equal(url, "https://allegro.cz/vyhledavani?string=Rode+NT-USB");
  });

  test("výsledné 'string' po dekódování odpovídá přesně původnímu dotazu (žádné double encoding)", () => {
    const query = "Sigma 18-35mm f/1.8 & (DC)";
    const url = new URL(buildAllegroSearchUrl(query));
    assert.equal(url.searchParams.get("string"), query);
  });
});

describe("buildDognetAffiliateUrl", () => {
  test("obsahuje chid, d1 a d2 přesně", () => {
    const destination = buildAllegroSearchUrl("Rode NT-USB");
    const url = new URL(buildDognetAffiliateUrl(destination, "gear-housebox-rode-nt-usb"));
    assert.equal(url.searchParams.get("chid"), DOGNET_CONFIG.chid);
    assert.equal(url.searchParams.get("d1"), DOGNET_CONFIG.d1);
    assert.equal(url.searchParams.get("d2"), "gear-housebox-rode-nt-usb");
  });

  test("'url' parametr po dekódování odpovídá přesně cílové URL (žádné double encoding)", () => {
    const destination = buildAllegroSearchUrl("Rode NT-USB & Rode PSA1 (set)");
    const url = new URL(buildDognetAffiliateUrl(destination, "gear-housebox-rode-nt-usb"));
    assert.equal(url.searchParams.get("url"), destination);
  });

  test("výsledná URL míří na go.dognet.com", () => {
    const url = new URL(buildDognetAffiliateUrl("https://allegro.cz/vyhledavani?string=x", "gear-x-y"));
    assert.equal(url.hostname, "go.dognet.com");
  });
});

describe("normalizeTrackingSlug", () => {
  test("RØDE se převede na 'rode' (Ø není combining diakritika, řeší se ručně)", () => {
    assert.equal(normalizeTrackingSlug("RØDE NT-USB"), "rode-nt-usb");
  });

  test("česká diakritika se odstraní (NFD + strip combining marks)", () => {
    assert.equal(normalizeTrackingSlug("Příšerně žluťoučký kůň"), "priserne-zlutoucky-kun");
  });

  test("mezery, &, /, závorky, + a tečky se převedou na jednu pomlčku", () => {
    assert.equal(normalizeTrackingSlug("Sigma 18-35mm f/1.8 (DC) & more"), "sigma-18-35mm-f-1-8-dc-more");
  });

  test("výsledek obsahuje jen [a-z0-9-], žádné vedoucí/koncové pomlčky", () => {
    const slug = normalizeTrackingSlug("--Ř@ndom!! Text--");
    assert.match(slug, /^[a-z0-9-]+$/);
    assert.ok(!slug.startsWith("-"));
    assert.ok(!slug.endsWith("-"));
  });
});

describe("resolveGearSearchQuery — priorita searchQuery > productName > brand+model", () => {
  test("explicitní searchQuery vyhraje nad productName", () => {
    const query = resolveGearSearchQuery({ searchQuery: "ASUS PG279Q", productName: "ASUS ROG Swift PG279Q", brand: "ASUS", model: "PG279Q" });
    assert.equal(query, "ASUS PG279Q");
  });

  test("bez searchQuery se použije productName", () => {
    const query = resolveGearSearchQuery({ productName: "RØDE NT-USB", brand: "RØDE", model: "NT-USB" });
    assert.equal(query, "RØDE NT-USB");
  });

  test("bez searchQuery i productName se poskládá brand + model", () => {
    const query = resolveGearSearchQuery({ productName: "", brand: "RØDE", model: "NT-USB" });
    assert.equal(query, "RØDE NT-USB");
  });
});

describe("buildGearD2 — preferovaný produktový tracking pattern", () => {
  test("gear-{creatorSlug}-{productSlug}, přesně podle příkladu ze zadání", () => {
    assert.equal(buildGearD2({ creatorSlug: "housebox", productName: "RØDE NT-USB" }), "gear-housebox-rode-nt-usb");
  });
});

describe("getGearAffiliateLink", () => {
  test("explicitní affiliateUrl má přednost před Allegro fallbackem", () => {
    const item = gearItem({ affiliateUrl: "https://go.dognet.com/?chid=rKROKhrd&d1=htf&d2=direct&url=https%3A%2F%2Fallegro.cz%2Foferta%2Fx" });
    const link = getGearAffiliateLink(item);
    assert.equal(link.type, "direct");
    assert.equal(link.href, item.affiliateUrl);
  });

  test("bez affiliateUrl vzniká automatický Allegro+Dognet fallback", () => {
    const item = gearItem({ affiliateUrl: undefined });
    const link = getGearAffiliateLink(item);
    assert.equal(link.type, "allegro-search");

    const url = new URL(link.href);
    assert.equal(url.hostname, "go.dognet.com");
    assert.equal(url.searchParams.get("chid"), "rKROKhrd");
    assert.equal(url.searchParams.get("d1"), "htf");
    assert.equal(url.searchParams.get("d2"), "gear-housebox-rode-nt-usb");

    const destination = new URL(url.searchParams.get("url")!);
    assert.equal(destination.hostname, "allegro.cz");
    assert.equal(destination.searchParams.get("string"), "RØDE NT-USB");
  });

  test("explicitní searchQuery se použije i ve fallback URL", () => {
    const item = gearItem({ affiliateUrl: undefined, productName: "ASUS ROG Swift PG279Q", searchQuery: "ASUS PG279Q" });
    const link = getGearAffiliateLink(item);
    const destination = new URL(new URL(link.href).searchParams.get("url")!);
    assert.equal(destination.searchParams.get("string"), "ASUS PG279Q");
  });
});

describe("getGearCtaLabel", () => {
  test("'direct' -> 'Zobrazit nabídku'", () => {
    assert.equal(getGearCtaLabel("direct"), "Zobrazit nabídku");
  });

  test("'allegro-search' -> 'Najít na Allegro'", () => {
    assert.equal(getGearCtaLabel("allegro-search"), "Najít na Allegro");
  });

  test("nikdy 'Koupit' (cena/skladovost se může změnit, viz zadání)", () => {
    assert.notEqual(getGearCtaLabel("direct"), "Koupit");
    assert.notEqual(getGearCtaLabel("allegro-search"), "Koupit");
  });
});
