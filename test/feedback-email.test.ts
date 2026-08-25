import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildFeedbackEmail,
  buildFeedbackMailto,
  buildFeedbackMailtoBody,
  FEEDBACK_MAILTO_SUBJECT,
} from "../app/components/feedback-email.ts";

test("buildFeedbackEmail: sestaví info@howtofish.cz z částí", () => {
  assert.equal(buildFeedbackEmail(), "info@howtofish.cz");
});

test("buildFeedbackMailtoBody: obsahuje aktuální URL stránky a Steam nickname", () => {
  const body = buildFeedbackMailtoBody("Agraelus", "https://howtofish.cz/ryby/spider-crab");
  assert.match(body, /https:\/\/howtofish\.cz\/ryby\/spider-crab/);
  assert.match(body, /Steam nick: Agraelus/);
});

test("buildFeedbackMailtoBody: neobsahuje steam_id, email ani jiné identifikátory", () => {
  const body = buildFeedbackMailtoBody("Agraelus", "https://howtofish.cz/ryby/spider-crab");
  assert.doesNotMatch(body, /765611981|@howtofish\.cz/);
});

test("buildFeedbackMailto: sestaví mailto: odkaz na info@howtofish.cz se subjectem a body", () => {
  const mailto = buildFeedbackMailto({ nickname: "Agraelus", pageUrl: "https://howtofish.cz/ryby/spider-crab" });
  assert.match(mailto, /^mailto:info@howtofish\.cz\?/);
  assert.match(mailto, new RegExp(`subject=${encodeURIComponent(FEEDBACK_MAILTO_SUBJECT)}`));
  assert.match(decodeURIComponent(mailto), /https:\/\/howtofish\.cz\/ryby\/spider-crab/);
  assert.match(decodeURIComponent(mailto), /Steam nick: Agraelus/);
});

test("buildFeedbackMailto: aktuální stránka se vezme z předané URL, ne natvrdo", () => {
  const mailtoA = buildFeedbackMailto({ nickname: "X", pageUrl: "https://howtofish.cz/hra" });
  const mailtoB = buildFeedbackMailto({ nickname: "X", pageUrl: "https://howtofish.cz/stream" });
  assert.notEqual(mailtoA, mailtoB);
  assert.match(decodeURIComponent(mailtoA), /\/hra/);
  assert.match(decodeURIComponent(mailtoB), /\/stream/);
});

// Statická pojistka: literál "info@howtofish.cz" (celý string pohromadě)
// nesmí být nikde jinde v app/ ani v lib/ — jediné místo, kde se email
// smí objevit jako čitelný string, je feedback-email.ts (sestavený
// z částí uvnitř funkce). Chrání proti tomu, aby ho někdo v budoucnu
// omylem napsal natvrdo do JSX, který by mohl renderovat i anonymní SSR.
test("literál 'info@howtofish.cz' se nikde jinde v app/lib nepoužívá natvrdo", () => {
  const appDir = fileURLToPath(new URL("../app", import.meta.url));
  const libDir = fileURLToPath(new URL("../lib", import.meta.url));
  const allowedFile = fileURLToPath(new URL("../app/components/feedback-email.ts", import.meta.url));

  function walk(dir: string): string[] {
    let files: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) files = files.concat(walk(full));
      else if (/\.(ts|tsx)$/.test(entry)) files.push(full);
    }
    return files;
  }

  const offenders: string[] = [];
  for (const file of [...walk(appDir), ...walk(libDir)]) {
    if (file === allowedFile) continue;
    const content = readFileSync(file, "utf8");
    if (content.includes("info@howtofish.cz")) offenders.push(file);
  }
  assert.deepEqual(offenders, []);
});
