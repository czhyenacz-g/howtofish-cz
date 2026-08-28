import type { ModerationResult } from "../../../lib/universal-content-api/ai-gateway.ts";

// Čistá, snadno testovatelná rozhodovací logika — AiGateway sama NIC
// nerozhoduje (vrací jen decision/confidence/...), business logika je
// vždy tady, v HowToFish (viz zadání). Nízká confidence u "approve"
// nebo "review" úmyslně necháváme jako pending (null) pro ruční
// kontrolu ve Filament adminu — stejné chování jako dnešní výchozí stav.
export const APPROVE_CONFIDENCE_THRESHOLD = 0.9;

export type ModerationOutcome = "approved" | "rejected" | null;

export function evaluateModerationResult(result: ModerationResult | null): ModerationOutcome {
  if (!result) return null;

  if (result.decision === "reject") return "rejected";

  if (result.decision === "approve" && result.confidence >= APPROVE_CONFIDENCE_THRESHOLD) {
    return "approved";
  }

  // "approve" s nízkou confidence, "review", nebo neznámá hodnota ->
  // necháváme record beze změny (pending, ruční kontrola).
  return null;
}
