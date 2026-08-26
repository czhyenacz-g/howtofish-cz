import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  isCharacterCalloutRoute,
  resolveCharacterCallout,
  resolvePromotionCallout,
} from "../lib/character-callouts/resolve-callout.ts";
import { pickPromotion } from "../lib/promotions/match-route.ts";
import type { PromotionEntry } from "../lib/universal-content-api/types.ts";

test("resolveCharacterCallout: profesor na /ryby má správnou zprávu a CTA na /ryby/navrhnout", () => {
  const callout = resolveCharacterCallout("/ryby", "professor");
  assert.match(callout.message, /encyklopedii už máme první úlovky/);
  assert.equal(callout.href, "/ryby/navrhnout");
  assert.equal(callout.linkLabel, "Přidat nový úlovek");
  assert.equal(callout.isSponsored, false);
});

test("resolveCharacterCallout: profesor na detailu ryby (/ryby/spider-crab) dostane zprávu pro '/ryby/[slug]'", () => {
  const callout = resolveCharacterCallout("/ryby/spider-crab", "professor");
  assert.match(callout.message, /Každý úlovek má svůj příběh/);
  assert.equal(callout.href, undefined);
});

test("resolveCharacterCallout: profesor na /predmety má vlastní zprávu odlišnou od /ryby", () => {
  const predmety = resolveCharacterCallout("/predmety", "professor");
  const ryby = resolveCharacterCallout("/ryby", "professor");
  assert.match(predmety.message, /Výbavu ještě nemám zmapovanou/);
  assert.notEqual(predmety.message, ryby.message);
  assert.equal(predmety.href, "/predmety/navrhnout");
});

test("resolveCharacterCallout: prodejce má vždy stejnou obecnou hlášku bez ohledu na route", () => {
  const a = resolveCharacterCallout("/ryby", "seller");
  const b = resolveCharacterCallout("/hra", "seller");
  assert.equal(a.message, b.message);
  assert.match(a.message, /Hej! Mám něco zajímavého/);
});

test("resolveCharacterCallout: prodejce bez href nemá CTA ani isSponsored", () => {
  const callout = resolveCharacterCallout("/stream", "seller");
  assert.equal(callout.href, undefined);
  assert.equal(callout.linkLabel, undefined);
  assert.equal(callout.isSponsored, false);
});

test("isCharacterCalloutRoute: formulářové /navrhnout routes jsou vyloučené", () => {
  assert.equal(isCharacterCalloutRoute("/ryby/navrhnout"), false);
  assert.equal(isCharacterCalloutRoute("/predmety/navrhnout"), false);
  assert.equal(isCharacterCalloutRoute("/bossove/navrhnout"), false);
  assert.equal(isCharacterCalloutRoute("/lokace/navrhnout"), false);
  assert.equal(isCharacterCalloutRoute("/navody/navrhnout"), false);
});

test("isCharacterCalloutRoute: /demo je vyloučené", () => {
  assert.equal(isCharacterCalloutRoute("/demo"), false);
  assert.equal(isCharacterCalloutRoute("/demo/ryby"), false);
});

test("isCharacterCalloutRoute: homepage a utility routes jsou vyloučené", () => {
  assert.equal(isCharacterCalloutRoute("/"), false);
  assert.equal(isCharacterCalloutRoute("/api/auth/steam/callback"), false);
});

test("isCharacterCalloutRoute: všech 9 povolených sekcí + detail ryby jsou povolené", () => {
  for (const path of ["/ryby", "/predmety", "/bossove", "/lokace", "/navody", "/achievementy", "/stream", "/hra", "/ryby/spider-crab"]) {
    assert.equal(isCharacterCalloutRoute(path), true, `${path} should be allowed`);
  }
});

test("resolveCharacterCallout: sponsored href (budoucí affiliate) by dostal 'Partnerský tip' přes isSponsored=true", () => {
  // Demo verze nemá žádný seller href, ale kontrolujeme kontrakt: kdyby
  // SELLER_MESSAGE.href existoval, isSponsored musí být true.
  const callout = resolveCharacterCallout("/ryby", "seller");
  assert.equal(callout.isSponsored, Boolean(callout.href));
});

test("resolveCharacterCallout: /achievementy a /stream nemají href -> komponenta nezobrazí žádné CTA", () => {
  assert.equal(resolveCharacterCallout("/achievementy", "professor").href, undefined);
  assert.equal(resolveCharacterCallout("/stream", "professor").href, undefined);
});

// Statická kontrola CharacterCallout.tsx — chování, které se hůř testuje
// přes čisté funkce (žádný DOM rendering harness v tomhle projektu, viz
// ostatní testy v repu, které z podobného důvodu dělají static scan).
const componentSource = readFileSync(
  fileURLToPath(new URL("../app/components/CharacterCallout.tsx", import.meta.url)),
  "utf8"
);

test("CharacterCallout.tsx: nesahá na sessionStorage přímo — perzistence žije jen v professor-state.ts", () => {
  assert.doesNotMatch(componentSource, /(local|session)Storage\s*\.\s*(set|get|remove)Item/);
});

test("CharacterCallout.tsx: sponsored odkaz má rel='noopener noreferrer sponsored' a target='_blank'", () => {
  assert.match(componentSource, /rel="noopener noreferrer sponsored"/);
  assert.match(componentSource, /target="_blank"/);
});

test("CharacterCallout.tsx: zavření profesora zavolá rememberProfessorMinimized a přejde do 'minimized'", () => {
  const closeHandler = /function handleClose\(\)[\s\S]*?\n  \}/.exec(componentSource)?.[0] ?? "";
  assert.match(closeHandler, /character === "professor"/);
  assert.match(closeHandler, /rememberProfessorMinimized\(pathname\)/);
  assert.match(closeHandler, /setPhase\("minimized"\)/);
});

test("CharacterCallout.tsx: zavření prodejce NEvolá rememberProfessorMinimized (žádné '?' u prodejce)", () => {
  const closeHandler = /function handleClose\(\)[\s\S]*?\n  \}/.exec(componentSource)?.[0] ?? "";
  // Větev pro "else" (prodejce) končí `setPhase("idle")`, ne "minimized".
  const sellerBranch = closeHandler.split("return;")[1] ?? "";
  assert.doesNotMatch(sellerBranch, /rememberProfessorMinimized/);
  assert.match(sellerBranch, /setPhase\("idle"\)/);
});

test("CharacterCallout.tsx: minimalizovaný stav vykreslí tlačítko '?' s accessibility labelem", () => {
  const minimizedBranch = /if \(phase === "minimized"\)[\s\S]*?\n  \}/.exec(componentSource)?.[0] ?? "";
  assert.match(minimizedBranch, /aria-label="Otevřít profesora"/);
  assert.match(minimizedBranch, />\s*\?\s*</);
});

test("CharacterCallout.tsx: klik na '?' (handleReopen) rovnou nastaví 'entering'/'open', bez čekání na DELAY_MS", () => {
  const reopenHandler = /function handleReopen\(\)[\s\S]*?\n  \}/.exec(componentSource)?.[0] ?? "";
  assert.match(reopenHandler, /setPhase\("entering"\)/);
  assert.doesNotMatch(reopenHandler, /setTimeout/);
});

test("CharacterCallout.tsx: mount efekt kontroluje isProfessorMinimizedForRoute PŘED naplánováním auto-show timeru (refresh respektuje minimized)", () => {
  const mountEffect = componentSource.split("if (!isCharacterCalloutRoute(pathname)) return;")[1]?.split("[mounted, pathname]")[0] ?? "";
  const minimizedCheckIndex = mountEffect.indexOf("isProfessorMinimizedForRoute(pathname)");
  const timerIndex = mountEffect.indexOf("window.setTimeout");
  assert.ok(minimizedCheckIndex !== -1 && timerIndex !== -1, "expected both minimized check and timer scheduling in mount effect");
  assert.ok(minimizedCheckIndex < timerIndex, "minimized check must run before the auto-show timer is scheduled");
});

// --- Promotions integrace (seller placement) ---------------------------

function promo(overrides: Partial<PromotionEntry> = {}): PromotionEntry {
  return {
    id: "community-1",
    placement: "seller",
    pagePattern: "*",
    title: "Fallback title",
    weight: 1,
    ...overrides,
  };
}

test("resolvePromotionCallout: bez body_html použije title jako plain-text zprávu", () => {
  const callout = resolvePromotionCallout(promo({ title: "Mám něco pro tebe" }));
  assert.equal(callout.message, "Mám něco pro tebe");
  assert.equal(callout.isHtml, false);
});

test("resolvePromotionCallout: s body_html ho použije jako zprávu a označí isHtml", () => {
  const callout = resolvePromotionCallout(promo({ bodyHtml: "<p>Sleva <strong>20 %</strong></p>" }));
  assert.equal(callout.message, "<p>Sleva <strong>20 %</strong></p>");
  assert.equal(callout.isHtml, true);
});

test("resolvePromotionCallout: CTA label a href se přenesou beze změny", () => {
  const callout = resolvePromotionCallout(promo({ href: "/hra", ctaLabel: "Zahrát si" }));
  assert.equal(callout.href, "/hra");
  assert.equal(callout.linkLabel, "Zahrát si");
});

test("resolvePromotionCallout: externí href (http/https) je isSponsored, interní ('/...') není", () => {
  const external = resolvePromotionCallout(promo({ href: "https://example.com/product" }));
  const internal = resolvePromotionCallout(promo({ href: "/ryby" }));
  assert.equal(external.isSponsored, true);
  assert.equal(internal.isSponsored, false);
});

test("resolvePromotionCallout: bez href je vždy isSponsored=false", () => {
  const callout = resolvePromotionCallout(promo({ href: undefined }));
  assert.equal(callout.isSponsored, false);
});

test("seller bez aktivní promotion pro danou route padá zpět na statickou SELLER_MESSAGE (pickPromotion vrátí null)", () => {
  const promotions: PromotionEntry[] = [promo({ pagePattern: "/predmety" })];
  const matched = pickPromotion(promotions, "/hra");
  assert.equal(matched, null);
  // Komponenta v tomhle případě volá resolveCharacterCallout(pathname, "seller") — ověřeno níž na zdrojovém kódu.
  const fallback = resolveCharacterCallout("/hra", "seller");
  assert.match(fallback.message, /Hej! Mám něco zajímavého/);
});

test("CharacterCallout.tsx: promotion match má přednost, ale jen pro prodejce — profesor sellerPromotions vůbec nepoužívá", () => {
  assert.match(componentSource, /character === "seller" \? pickPromotion\(sellerPromotions, pathname\) : null/);
});

test("CharacterCallout.tsx: nikdy neimportuje universal-content-api/promotions.ts jako hodnotu (jen typ PromotionEntry) — data přijdou jako prop", () => {
  const hasUnsafeImport = componentSource
    .split("\n")
    .some((line) => /universal-content-api\/(client|catches|community|promotions)(\.ts)?["']/.test(line) && !/^\s*import\s+type\b/.test(line));
  assert.equal(hasUnsafeImport, false);
});
