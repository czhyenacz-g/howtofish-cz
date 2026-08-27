import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Server-side trackEvent() volání jsou rozeseté po několika "use server"
// akcích/route handlerech napříč projektem — zdrojová kontrola pro
// každé místo, stejný vzor jako ostatní framework-vázané testy v repu
// (viz test/ad-slot.test.ts). Samotný trackEvent()/whitelist je
// testovaný přímo v test/analytics-events.test.ts a
// test/analytics-events-shared.test.ts.
function read(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), "utf8");
}

test("steam_login: Steam callback loguje po úspěšném upsertu, steamId ze session (ne z klienta)", () => {
  const source = read("app/api/auth/steam/callback/route.ts");
  assert.match(source, /await trackEvent\(\{ event: "steam_login", steamId, path: returnTo \}\);/);
  // Musí být AŽ po úspěšném upsertSteamUser (za jeho try/catch blokem), ne před ním.
  assert.ok(source.indexOf("await upsertSteamUser(") < source.indexOf('event: "steam_login"'));
});

test("fish_upload: uploadCatchAction loguje jen fish_slug, po úspěšném uploadu obrázku", () => {
  const source = read("app/ryby/[slug]/upload-action.ts");
  assert.match(source, /event: "fish_upload"/);
  assert.match(source, /metadata: \{ fish_slug: evaluation\.payload\.fish_slug \}/);
  // Nikdy poznámka/filename/URL v metadata.
  assert.doesNotMatch(source, /metadata:.*note/i);
});

test("suggestion_created: všech 5 'new suggestion' akcí loguje svůj typ, korekce (correction) eventy negenerují", () => {
  const cases: [string, string][] = [
    ["app/ryby/navrhnout/submit-suggestion-action.ts", "fish"],
    ["app/(sections)/bossove/navrhnout/actions.ts", "boss"],
    ["app/(sections)/lokace/navrhnout/actions.ts", "location"],
    ["app/(sections)/predmety/navrhnout/actions.ts", "item"],
    ["app/(sections)/navody/navrhnout/actions.ts", "guide"],
  ];

  for (const [path, type] of cases) {
    const source = read(path);
    assert.match(
      source,
      new RegExp(`event: "suggestion_created", steamId: user\\.steamId, metadata: \\{ type: "${type}" \\}`),
      `${path}: chybí trackEvent pro type="${type}"`
    );
    // Přesně jeden výskyt — jen "new suggestion" cesta, ne i correction.
    const matches = source.match(/event: "suggestion_created"/g) ?? [];
    assert.equal(matches.length, 1, `${path}: očekáván přesně 1 výskyt suggestion_created`);
  }
});

test("game_score: save-score-action loguje AŽ po úspěšném submitGameScore (ne při validační chybě)", () => {
  const source = read("app/hra/save-score-action.ts");
  assert.match(source, /event: "game_score"/);
  assert.match(source, /metadata: \{ game: evaluation\.payload\.game, score: evaluation\.payload\.score, round: evaluation\.payload\.round \}/);
  assert.ok(
    source.indexOf("await submitGameScore(evaluation.payload)") < source.indexOf('event: "game_score"'),
    "trackEvent musí být až po úspěšném submitGameScore"
  );
});

test("multiplayer_join: setPresenceAction loguje jen když je presence NOVÁ (created:true), heartbeatAction NIKDY netrackuje", () => {
  const source = read("app/(sections)/multiplayer/actions.ts");

  const setPresenceActionBody = /export async function setPresenceAction\([\s\S]*?\n\}/.exec(source)?.[0] ?? "";
  assert.match(setPresenceActionBody, /if \(result\.status === "success" && result\.created && result\.steamId\)/);
  assert.match(setPresenceActionBody, /event: "multiplayer_join"/);

  const heartbeatActionBody = /export async function heartbeatAction\([\s\S]*?\n\}/.exec(source)?.[0] ?? "";
  assert.doesNotMatch(heartbeatActionBody, /trackEvent/);
});

test("multiplayer_leave: hidePresenceAction loguje po úspěšném hideOwnPresence", () => {
  const source = read("app/(sections)/multiplayer/actions.ts");
  const hidePresenceActionBody = /export async function hidePresenceAction\([\s\S]*?\n\}/.exec(source)?.[0] ?? "";
  assert.match(hidePresenceActionBody, /await hideOwnPresence\(evaluation\.steamId\);/);
  assert.match(hidePresenceActionBody, /event: "multiplayer_leave"/);
  assert.ok(
    hidePresenceActionBody.indexOf("await hideOwnPresence(") < hidePresenceActionBody.indexOf('event: "multiplayer_leave"')
  );
});

test("wave_sent: waveAction loguje po úspěšném createWave, BEZ recipient steam_id v metadata", () => {
  const source = read("app/(sections)/multiplayer/actions.ts");
  const waveActionBody = /export async function waveAction\([\s\S]*?\n\}/.exec(source)?.[0] ?? "";
  assert.match(waveActionBody, /await createWave\(evaluation\);/);
  const trackEventCall = /await trackEvent\(\{ event: "wave_sent"[\s\S]*?\}\);/.exec(waveActionBody)?.[0] ?? "";
  assert.match(trackEventCall, /event: "wave_sent", steamId: evaluation\.fromSteamId \}\);/);
  // toSteamId patří jen do multiplayer_waves (createWave/checkWaveAllowed výše),
  // nesmí prosáknout do samotného trackEvent volání pro analytics_events.
  assert.doesNotMatch(trackEventCall, /toSteamId/);
});

test("setOwnPresence: vrací {created:boolean}, re-aktivace po 'Skrýt mě' se počítá jako created:true", () => {
  const source = read("lib/universal-content-api/presence.ts");
  assert.match(source, /const wasHidden = existing\.data\.visible !== true;/);
  assert.match(source, /return \{ created: wasHidden \};/);
  assert.match(source, /return \{ created: true \};/);
});

test("game_started: CrabRushGame loguje na handleStart i handleRestart (klient, přes trackClientEvent)", () => {
  const source = read("app/hra/CrabRushGame.tsx");
  const matches = source.match(/trackClientEvent\("game_started", \{ metadata: \{ game: "crab-rush" \} \}\)/g) ?? [];
  assert.equal(matches.length, 2, "očekávány 2 výskyty (handleStart + handleRestart)");
});

test("feedback_click: FeedbackEmailButton loguje na klik, žádný preventDefault (mailto: musí dál fungovat normálně)", () => {
  const source = read("app/components/FeedbackEmailButton.tsx");
  assert.match(source, /onClick=\{\(\) => trackClientEvent\("feedback_click", \{ path: pathname \}\)\}/);
  assert.doesNotMatch(source, /preventDefault/);
});
