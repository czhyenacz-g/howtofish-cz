import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { COMMUNITY_CONTRIBUTIONS_ENABLED, MULTIPLAYER_ENABLED } from "../app/config/features.ts";

// Režim minimální údržby (říjen 2026): komunitní příspěvky a multiplayer
// jsou z veřejného UI skryté, kód zůstává. Tyhle testy hlídají, že se
// skryté funkce nevrátí do UI omylem.

const APP_DIR = fileURLToPath(new URL("../app", import.meta.url));

function read(rel: string): string {
  return readFileSync(join(APP_DIR, rel), "utf8");
}

function listTsx(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return listTsx(full);
    return full.endsWith(".tsx") ? [full] : [];
  });
}

test("komunitní příspěvky a multiplayer jsou vypnuté", () => {
  assert.equal(COMMUNITY_CONTRIBUTIONS_ENABLED, false);
  assert.equal(MULTIPLAYER_ENABLED, false);
});

test("všechny /navrhnout stránky při vypnutých příspěvcích přesměrují na sekci", () => {
  for (const [page, parent] of [
    ["ryby/navrhnout/page.tsx", "/ryby"],
    ["(sections)/predmety/navrhnout/page.tsx", "/predmety"],
    ["(sections)/bossove/navrhnout/page.tsx", "/bossove"],
    ["(sections)/lokace/navrhnout/page.tsx", "/lokace"],
    ["(sections)/navody/navrhnout/page.tsx", "/navody"],
  ] as const) {
    assert.match(read(page), new RegExp(`if \\(!COMMUNITY_CONTRIBUTIONS_ENABLED\\) redirect\\("${parent}"\\);`), page);
  }
});

test("CTA komunitních příspěvků jsou podmíněné přepínačem", () => {
  assert.match(read("components/community/AddCommunityRecordButton.tsx"), /if \(!COMMUNITY_CONTRIBUTIONS_ENABLED\) return null;/);
  assert.match(read("components/community/CommunityDataTable.tsx"), /if \(!COMMUNITY_CONTRIBUTIONS_ENABLED \|\| row\.pending\) return undefined;/);
  assert.match(read("ryby/FishBrowser.tsx"), /\{COMMUNITY_CONTRIBUTIONS_ENABLED && <AddFishSuggestionCard \/>\}/);
  assert.match(read("components/FishCard.tsx"), /: COMMUNITY_CONTRIBUTIONS_ENABLED \? \(/);
  assert.match(read("ryby/[slug]/CommunityCatchSection.tsx"), /if \(!COMMUNITY_CONTRIBUTIONS_ENABLED\) return null;/);
  assert.match(read("components/FeedbackCallout.tsx"), /if \(!user && !COMMUNITY_CONTRIBUTIONS_ENABLED\) return null;/);
});

test("žádné veřejné sliby budoucího obsahu ani rozpracovanosti v app/", () => {
  const banned = [
    /Hodnocení komunity připravujeme/,
    /doplníme je postupně/,
    /Pracovní katalog/,
    /brzy rozšíříme/,
    /přidáme brzy/,
    /budoucí affiliate banner/,
  ];
  for (const file of listTsx(APP_DIR)) {
    const source = readFileSync(file, "utf8");
    for (const phrase of banned) {
      // AdPlaceholder komponenta zůstává v repu, jen se nikde nerenderuje.
      if (file.endsWith("AdPlaceholder.tsx")) continue;
      assert.doesNotMatch(source, phrase, `${file}: ${phrase}`);
    }
  }
});

test("/multiplayer: při vypnutí jen informace o pozastavení, noindex", () => {
  const source = read("(sections)/multiplayer/page.tsx");
  assert.match(source, /if \(!MULTIPLAYER_ENABLED\) return <PausedNotice \/>;/);
  assert.match(source, /robots: \{ index: false, follow: true \}/);
});

test("právní stránky nerenderují reklamu", () => {
  for (const page of ["(sections)/pravni-informace/page.tsx", "(sections)/ochrana-soukromi/page.tsx"]) {
    const source = read(page);
    assert.doesNotMatch(source, /AdSlot|AffiliateBanner/, page);
  }
});

test("žádná stránka nemá víc než jeden reklamní slot", () => {
  for (const file of listTsx(APP_DIR)) {
    if (file.includes(`${join("components", "")}`)) continue;
    const count = (readFileSync(file, "utf8").match(/<AdSlot |<AffiliateBannerSlot/g) ?? []).length;
    // multiplayer/page.tsx má sloty ve dvou alternativních větvích (přihlášený/nepřihlášený), ne současně.
    if (file.endsWith(join("multiplayer", "page.tsx"))) continue;
    assert.ok(count <= 1, `${file}: ${count} reklamních slotů`);
  }
});

test("interní odkazy nevedou přes legacy /stream/{slug} redirect ani na pozastavený /multiplayer", () => {
  for (const file of listTsx(APP_DIR)) {
    if (file.includes(join("(sections)", "multiplayer"))) continue;
    if (file.endsWith("MultiplayerIslandTab.tsx")) continue;
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /href=\{`\/stream\/\$\{/, `${file}: odkaz na /stream/{slug}`);
    const multiplayerLinks = source.match(/href="\/multiplayer"/g) ?? [];
    if (multiplayerLinks.length > 0) {
      assert.match(source, /MULTIPLAYER_ENABLED && \(/, `${file}: odkaz na /multiplayer bez přepínače`);
    }
  }
});
