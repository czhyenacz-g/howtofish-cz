import { createCatchModerationRequest, getAiRequest, type AiRequest } from "../../../lib/universal-content-api/ai-gateway.ts";
import { setCatchModerationStatus } from "../../../lib/universal-content-api/catches.ts";
import { evaluateModerationResult } from "./evaluate-moderation-result.ts";

// Bounded polling s backoffem (ne busy-loop) — reálně naměřená latence
// sync Gemini volání je ~5-7s (viz docs/AI_GATEWAY.md v
// universal-content-api), tenhle rozvrh (~9s celkem) pokryje typický
// případ. Volitelný `sleepFn` jde v testech nahradit no-opem.
const POLL_DELAYS_MS = [2000, 3000, 4000];

type SleepFn = (ms: number) => Promise<void>;

const defaultSleep: SleepFn = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Vytvoří AiGateway request pro nahraný úlovek, bounded-poluje na
 * výsledek a podle něj (viz evaluate-moderation-result.ts) VOLITELNĚ
 * schválí/zamítne record. Volá se z upload-action.ts přes next/server
 * `after()` — PO odeslání odpovědi uživateli, upload samotný už uspěl
 * bez ohledu na výsledek moderace.
 *
 * AI failure/timeout/nevalidní odpověď NIKDY nezpůsobí ztrátu uploadu
 * ani chybu uživateli — jen se zaloguje a record zůstane "pending" pro
 * ruční kontrolu ve Filament adminu (stejné chování jako dnes, dokud
 * tahle integrace nepřibyla).
 */
export async function runCatchModeration(
  recordId: number,
  mediaId: number,
  fishSlug: string,
  sleep: SleepFn = defaultSleep
): Promise<void> {
  let request: AiRequest;
  try {
    request = await createCatchModerationRequest(mediaId, fishSlug);
  } catch (error) {
    console.error(
      `Catch moderation: vytvoření AI requestu selhalo pro record #${recordId} — zůstává pending.`,
      error instanceof Error ? error.message : error
    );
    return;
  }

  for (const delay of POLL_DELAYS_MS) {
    if (request.status === "completed" || request.status === "failed") break;

    await sleep(delay);

    try {
      request = await getAiRequest(request.id);
    } catch (error) {
      console.error(
        `Catch moderation: polling AI requestu #${request.id} selhal pro record #${recordId} — zůstává pending.`,
        error instanceof Error ? error.message : error
      );
      return;
    }
  }

  if (request.status === "failed") {
    console.error(
      `Catch moderation: AI request #${request.id} selhal pro record #${recordId} (${fishSlug}) — zůstává pending pro ruční kontrolu.`
    );
    return;
  }

  if (request.status !== "completed") {
    console.warn(
      `Catch moderation: AI request #${request.id} nedoběhl v očekávaném čase pro record #${recordId} — zůstává pending pro ruční kontrolu.`
    );
    return;
  }

  const outcome = evaluateModerationResult(request.result);
  if (outcome === null) return;

  try {
    await setCatchModerationStatus(recordId, outcome);
  } catch (error) {
    console.error(
      `Catch moderation: nepodařilo se nastavit status "${outcome}" pro record #${recordId} — zůstává pending.`,
      error instanceof Error ? error.message : error
    );
  }
}
