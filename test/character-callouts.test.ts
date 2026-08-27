import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PROFESSOR_MESSAGES, SELLER_MESSAGE } from "../lib/character-callouts/config.ts";
import {
  isCharacterCalloutRoute,
  isSellerAllowedOnRoute,
  resolveCharacterCallout,
  resolvePromotionCallout,
} from "../lib/character-callouts/resolve-callout.ts";
import { SELLER_COOLDOWN_MS, shouldShowSeller, type ShouldShowSellerInput } from "../lib/character-callouts/seller-rules.ts";
import { pickPromotion } from "../lib/promotions/match-route.ts";
import type { PromotionEntry } from "../lib/universal-content-api/types.ts";

test("resolveCharacterCallout: profesor na /ryby má správnou zprávu a ŽÁDNÉ CTA (duplicitní vůči navigaci/obsahu, viz zadání)", () => {
  const callout = resolveCharacterCallout("/ryby", "professor");
  assert.match(callout.message, /encyklopedii už máme první úlovky/);
  assert.equal(callout.href, undefined);
  assert.equal(callout.linkLabel, undefined);
  assert.equal(callout.isSponsored, false);
});

test("resolveCharacterCallout: profesor na detailu ryby (/ryby/spider-crab) dostane zprávu pro '/ryby/[slug]'", () => {
  const callout = resolveCharacterCallout("/ryby/spider-crab", "professor");
  assert.match(callout.message, /Každý úlovek má svůj příběh/);
  assert.equal(callout.href, undefined);
});

test("resolveCharacterCallout: profesor na /predmety má vlastní zprávu odlišnou od /ryby, bez CTA", () => {
  const predmety = resolveCharacterCallout("/predmety", "professor");
  const ryby = resolveCharacterCallout("/ryby", "professor");
  assert.match(predmety.message, /Výbavu ještě nemám zmapovanou/);
  assert.notEqual(predmety.message, ryby.message);
  assert.equal(predmety.href, undefined);
  assert.equal(predmety.linkLabel, undefined);
});

test("resolveCharacterCallout: žádná profesorská zpráva (PROFESSOR_MESSAGES) nemá href/linkLabel — CTA je jen pro sellera", () => {
  for (const pathname of ["/ryby", "/predmety", "/bossove", "/lokace", "/navody", "/achievementy", "/stream", "/hra", "/o-hre"]) {
    const callout = resolveCharacterCallout(pathname, "professor");
    assert.equal(callout.href, undefined, `${pathname}: profesor by neměl mít href`);
    assert.equal(callout.linkLabel, undefined, `${pathname}: profesor by neměl mít linkLabel`);
  }
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

test("isSellerAllowedOnRoute: prodejce je vyloučený na /hra a /o-hre, jinde povolený", () => {
  assert.equal(isSellerAllowedOnRoute("/hra"), false);
  assert.equal(isSellerAllowedOnRoute("/o-hre"), false);
  assert.equal(isSellerAllowedOnRoute("/ryby"), true);
  assert.equal(isSellerAllowedOnRoute("/ryby/spider-crab"), true);
  assert.equal(isSellerAllowedOnRoute("/stream"), true);
});

test("isCharacterCalloutRoute: homepage a utility routes jsou vyloučené", () => {
  assert.equal(isCharacterCalloutRoute("/"), false);
  assert.equal(isCharacterCalloutRoute("/api/auth/steam/callback"), false);
});

test("isCharacterCalloutRoute: /o-hre je povolené (profesor jako úvodní průvodce)", () => {
  assert.equal(isCharacterCalloutRoute("/o-hre"), true);
});

test("isCharacterCalloutRoute: všech 10 povolených sekcí + detail ryby jsou povolené", () => {
  for (const path of [
    "/ryby",
    "/predmety",
    "/bossove",
    "/lokace",
    "/navody",
    "/achievementy",
    "/stream",
    "/hra",
    "/o-hre",
    "/ryby/spider-crab",
  ]) {
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
  const mountEffect = componentSource.split("if (!isCharacterCalloutRoute(pathname)) return;")[1]?.split("[mounted, pathname, gameStarted]")[0] ?? "";
  const minimizedCheckIndex = mountEffect.indexOf("isProfessorMinimizedForRoute(pathname)");
  const timerIndex = mountEffect.indexOf("window.setTimeout");
  assert.ok(minimizedCheckIndex !== -1 && timerIndex !== -1, "expected both minimized check and timer scheduling in mount effect");
  assert.ok(minimizedCheckIndex < timerIndex, "minimized check must run before the auto-show timer is scheduled");
});

// --- /hra: postava se nezobrazuje, dokud hráč hraje minihru -------------

test("CharacterCallout.tsx: importuje getGameStarted/subscribeGameStarted z game-session.ts a čte je přes useSyncExternalStore", () => {
  assert.match(componentSource, /import \{ getGameStarted, subscribeGameStarted \} from "\.\.\/\.\.\/lib\/character-callouts\/game-session"/);
  assert.match(componentSource, /useSyncExternalStore\(subscribeGameStarted, getGameStarted, \(\) => false\)/);
});

test("CharacterCallout.tsx: HRA_PATHNAME je '/hra' a mount efekt se vrátí (žádný nový timer) dokud gameStarted platí", () => {
  assert.match(componentSource, /const HRA_PATHNAME = "\/hra";/);
  const mountEffect = componentSource.split("if (!isCharacterCalloutRoute(pathname)) return;")[1]?.split("[mounted, pathname, gameStarted]")[0] ?? "";
  assert.match(mountEffect, /if \(pathname === HRA_PATHNAME && gameStarted\) return;/);
  // Gate musí být HNED po isCharacterCalloutRoute kontrole, před minimized/o-hre/seller větvemi.
  const gateIndex = mountEffect.indexOf("pathname === HRA_PATHNAME && gameStarted");
  const minimizedIndex = mountEffect.indexOf("isProfessorMinimizedForRoute(pathname)");
  assert.ok(gateIndex !== -1 && minimizedIndex !== -1 && gateIndex < minimizedIndex);
});

test("CharacterCallout.tsx: gameStarted je v deps mount efektu — flip na true okamžitě přeruší (cleanup) čekající/otevřený callout na /hra", () => {
  assert.match(componentSource, /\}, \[mounted, pathname, gameStarted\]\);/);
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
  assert.match(componentSource, /character === "seller" \? pickPromotion\(availableSellerPromotions, pathname\) : null/);
});

test("CharacterCallout.tsx: sellerPromotions se před výběrem filtrují přes excludeRecentlyClicked (7denní vyřazení prokliknutých)", () => {
  assert.match(componentSource, /import \{ excludeRecentlyClicked, markPromotionClicked \} from "\.\.\/\.\.\/lib\/promotions\/clicked-promotions"/);
  assert.match(
    componentSource,
    /const availableSellerPromotions = character === "seller" \? excludeRecentlyClicked\(sellerPromotions\) : \[\];/
  );
});

test("CharacterCallout.tsx: seller CTA (obě varianty) volají markPromotionClicked + trackClientEvent jen pro skutečnou promotion, ne pro statický fallback", () => {
  const handlerBody = /const handleSellerCtaClick = matchedPromotion\s*\?\s*\(\) => \{([\s\S]*?)\n {6}\}\s*: undefined;/.exec(
    componentSource
  )?.[1];
  assert.ok(handlerBody, "nepodařilo se najít handleSellerCtaClick");
  assert.match(handlerBody, /markPromotionClicked\(matchedPromotion\.id\)/);
  assert.match(handlerBody, /trackClientEvent\("affiliate_click", \{ metadata: \{ promotion_id: matchedPromotion\.id, placement: "seller" \} \}\)/);

  const ctaBlock = componentSource.split('{callout.isSponsored && (')[1] ?? "";
  const onClickMatches = ctaBlock.match(/onClick=\{handleSellerCtaClick\}/g) ?? [];
  assert.equal(onClickMatches.length, 2, "očekávány 2 CTA větve (sponsored <a> i interní <Link>), obě s onClick");
});

test("CharacterCallout.tsx: nikdy neimportuje universal-content-api/promotions.ts jako hodnotu (jen typ PromotionEntry) — data přijdou jako prop", () => {
  const hasUnsafeImport = componentSource
    .split("\n")
    .some((line) => /universal-content-api\/(client|catches|community|promotions)(\.ts)?["']/.test(line) && !/^\s*import\s+type\b/.test(line));
  assert.equal(hasUnsafeImport, false);
});

// --- Prodejce: frekvence/kolize s bannerem a profesorem -----------------

test("CharacterCallout.tsx: rozhodnutí seller-vs-professor jde přes shouldShowSeller (jediné místo pravidel), ne přes vlastní Math.random() coinflip", () => {
  assert.match(componentSource, /shouldShowSeller\(\{/);
  assert.doesNotMatch(componentSource, /Math\.random\(\)\s*<\s*0\.5/);
});

test("CharacterCallout.tsx: professorVisibility je vždy 'hidden' — jediný slot pro postavu dělá 'profesor open' a 'seller' současně strukturálně nemožné", () => {
  assert.match(componentSource, /professorVisibility:\s*"hidden"/);
});

test("CharacterCallout.tsx: prodejce používá SELLER_DELAY_MS, profesor (fallback větev) DELAY_MS beze změny", () => {
  assert.match(componentSource, /}, SELLER_DELAY_MS\);/);
  assert.match(componentSource, /}, DELAY_MS\);/);
});

test("CharacterCallout.tsx: prodejce se teprve po timeru ověří proti ŽIVÉ (ref) viditelnosti banneru, ne proti hodnotě z okamžiku naplánování", () => {
  const sellerTimerBody = /const sellerTimer = window\.setTimeout\(\(\) => \{([\s\S]*?)\}, SELLER_DELAY_MS\);/.exec(
    componentSource
  )?.[1];
  assert.ok(sellerTimerBody, "nepodařilo se najít tělo sellerTimer callbacku");
  assert.match(sellerTimerBody, /bannerVisibleRef\.current/);
});

test("CharacterCallout.tsx: prodejce se skutečně 'zapamatuje' (rememberSellerShown) až při reálném zobrazení, ne při pouhém naplánování", () => {
  const beforeSellerTimer = componentSource.split("const sellerTimer = window.setTimeout")[0];
  const sellerTimerBody = /const sellerTimer = window\.setTimeout\(\(\) => \{([\s\S]*?)\}, SELLER_DELAY_MS\);/.exec(
    componentSource
  )?.[1];
  assert.doesNotMatch(beforeSellerTimer.split("wantsSeller")[1] ?? "", /rememberSellerShown/);
  assert.match(sellerTimerBody ?? "", /rememberSellerShown\(pathname, Date\.now\(\)\)/);
});

test("CharacterCallout.tsx: žádný polling (setInterval) v komponentě — jen event-driven timery/observer", () => {
  assert.doesNotMatch(componentSource, /setInterval/);
});

test("CharacterCallout.tsx: importuje useBannerVisible (IntersectionObserver koordinace s bannerem), ne vlastní DOM dotazování", () => {
  assert.match(componentSource, /import \{ useBannerVisible \} from "\.\/useBannerVisible"/);
});

// --- /o-hre: profesor vždy, seller nikdy ---------------------------------

test("shouldShowSeller: false na /o-hre za všech okolností (route-check má přednost, žádný delay/chance/cooldown ho nezachrání)", () => {
  const alwaysFavorable: ShouldShowSellerInput = {
    pathname: "/o-hre",
    now: 10_000_000,
    lastShownAt: null,
    shownRoutes: [],
    bannerVisible: false,
    professorVisibility: "hidden",
    chanceRoll: 0,
  };
  assert.equal(shouldShowSeller(alwaysFavorable), false);
  // I s "vyhrálým" cooldownem (uplynulo dost dlouho) a nulovým losem.
  assert.equal(
    shouldShowSeller({ ...alwaysFavorable, lastShownAt: 10_000_000 - SELLER_COOLDOWN_MS - 1 }),
    false
  );
});

test("CharacterCallout.tsx: pro /o-hre se seller-rozhodování (shouldShowSeller) vůbec nevolá — vlastní explicitní větev před ním", () => {
  const oHreBranch = /if \(pathname === O_HRE_PATHNAME\) \{([\s\S]*?)\n {4}\}\n\n {4}\/\/ Jediný slot/.exec(
    componentSource
  )?.[1];
  assert.ok(oHreBranch, "nepodařilo se najít větev 'if (pathname === O_HRE_PATHNAME)'");
  assert.match(oHreBranch, /setCharacter\("professor"\)/);
  assert.doesNotMatch(oHreBranch, /shouldShowSeller/);
  assert.doesNotMatch(oHreBranch, /setCharacter\("seller"\)/);
});

test("CharacterCallout.tsx: /o-hre větev běží až po kontrole isProfessorMinimizedForRoute (respektuje zavření v rámci stejné návštěvy)", () => {
  const minimizedIndex = componentSource.indexOf("isProfessorMinimizedForRoute(pathname)");
  const oHreIndex = componentSource.indexOf("pathname === O_HRE_PATHNAME");
  assert.ok(minimizedIndex !== -1 && oHreIndex !== -1);
  assert.ok(minimizedIndex < oHreIndex);
});

test("CharacterCallout.tsx: O_HRE_PATHNAME je '/o-hre' a používá kratší PROFESSOR_INTRO_DELAY_MS, ne standardní DELAY_MS", () => {
  assert.match(componentSource, /const O_HRE_PATHNAME = "\/o-hre";/);
  assert.match(componentSource, /const PROFESSOR_INTRO_DELAY_MS = \d+;/);
  assert.match(componentSource, /}, PROFESSOR_INTRO_DELAY_MS\);/);
});

test("PROFESSOR_MESSAGES['/o-hre']: obsahuje představení (jméno Profesor, není Oak, uvízl, katalogizuje, chce pomoc)", () => {
  const callout = resolveCharacterCallout("/o-hre", "professor");
  assert.match(callout.message, /Profesor/);
  assert.match(callout.message, /Oak/);
  assert.match(callout.message, /uvízl/);
  assert.match(callout.message, /ryby, předměty, bossy, lokace i návody|katalog/);
  assert.match(callout.message, /pomoc/);
  assert.equal(callout.href, undefined);
  assert.equal(callout.linkLabel, undefined);
});

test("PROFESSOR_MESSAGES['/o-hre']: rozdělené na odstavce po max 2-3 větách, každý začíná na svém místě", () => {
  const callout = resolveCharacterCallout("/o-hre", "professor");
  const paragraphs = callout.message.split("\n\n");
  assert.equal(paragraphs.length, 3, "očekávány přesně 3 odstavce");
  for (const paragraph of paragraphs) {
    const sentenceCount = (paragraph.replace(/<[^>]+>/g, "").match(/[.!?]+(?=\s|$)/g) ?? []).length;
    assert.ok(sentenceCount <= 3, `odstavec má ${sentenceCount} vět, čekáno max 3: "${paragraph}"`);
  }
  assert.match(paragraphs[0], /^Říkej mi <strong>Profesore<\/strong>\.$/);
  assert.match(paragraphs[1], /^Ne, nejsem profesor Oak/);
  assert.match(paragraphs[2], /^S tím ale potřebuju tvoji pomoc\./);
});

test("PROFESSOR_MESSAGES['/o-hre']: 'Profesore' je tučně (isHtml) — jediná statická profesorská zpráva s HTML", () => {
  const callout = resolveCharacterCallout("/o-hre", "professor");
  assert.equal(callout.isHtml, true);
  assert.match(callout.message, /<strong>Profesore<\/strong>/);

  for (const pathname of ["/ryby", "/predmety", "/bossove", "/lokace", "/navody", "/achievementy", "/stream", "/hra"]) {
    const other = resolveCharacterCallout(pathname, "professor");
    assert.notEqual(other.isHtml, true, `${pathname}: neočekávané isHtml`);
  }
});

test("CharacterCallout.tsx: plain-text zprávy se renderují s whitespace-pre-line (\\n\\n v datech = odstavcová mezera)", () => {
  assert.match(componentSource, /<p className="whitespace-pre-line">\{callout\.message\}<\/p>/);
});

test("CharacterCallout.tsx: vysunutý stav (entering/open/closing) má data-character-callout-open=\"true\" — jiné fixed prvky (MultiplayerIslandTab) na něj reagují", () => {
  assert.match(componentSource, /data-character-callout-open="true"/);
});

test("PROFESSOR_MESSAGES a SELLER_MESSAGE: otázka (věta končící '?') je vždy ve vlastním odstavci, ne slepená s dalším textem", () => {
  const allMessages = [...Object.values(PROFESSOR_MESSAGES), SELLER_MESSAGE].map((m) => m.message);
  for (const message of allMessages) {
    for (const paragraph of message.split("\n\n")) {
      if (!paragraph.includes("?")) continue;
      const trimmed = paragraph.trim();
      assert.ok(trimmed.endsWith("?"), `otázka musí končit svůj odstavec: "${paragraph}"`);
      const questionMarks = (trimmed.match(/\?/g) ?? []).length;
      assert.equal(questionMarks, 1, `odstavec s otázkou má mít přesně jednu otázku: "${paragraph}"`);
    }
  }
});
