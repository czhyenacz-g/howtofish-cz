"use server";

import { getCurrentUser } from "../../lib/auth/current-user";
import { submitGameScore } from "../../lib/universal-content-api/scores";
import { evaluateScoreSubmission } from "./evaluate-score-submission";

export type SaveScoreState = {
  status: "idle" | "success" | "error";
  message?: string;
};

// Server Action — SteamID/nickname jdou vždy jen z ověřené session,
// nikdy z formData (stejný vzor jako upload-action.ts u úlovků).
export async function saveScoreAction(
  _prevState: SaveScoreState,
  formData: FormData
): Promise<SaveScoreState> {
  const user = await getCurrentUser();

  const evaluation = evaluateScoreSubmission(user, {
    score: Number(formData.get("score")),
    round: Number(formData.get("round")),
    kills: Number(formData.get("kills")),
    bestCombo: Number(formData.get("bestCombo")),
  });

  if (!evaluation.ok) {
    return { status: "error", message: evaluation.message };
  }

  try {
    await submitGameScore(evaluation.payload);
  } catch (error) {
    console.error("Crab Rush: uložení skóre selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: "Skóre se momentálně nepodařilo uložit. Zkus to prosím znovu." };
  }

  return { status: "success", message: "Skóre uloženo do žebříčku!" };
}
