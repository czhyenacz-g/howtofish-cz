"use server";

import { trackEvent } from "../../../lib/analytics/events";
import { checkGameSuggestionRateLimit, createGameSuggestion } from "../../../lib/community/game-suggestions";
import { GENERIC_ERROR, evaluateGameSuggestion } from "./evaluate-game-suggestion";

export type SubmitGameSuggestionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

/**
 * Server Action formuláře "Chybí tu tvoje hra?" — volaná přímo z
 * <form action={...}> (useActionState), takže se do browseru nikdy
 * nedostane žádné přihlašovací tajemství ani DB connection string.
 *
 * Formulář je záměrně bez Steam přihlášení (veřejné "napiš nám tip" CTA),
 * proto je validace v evaluate-game-suggestion.ts (čistá funkce) a rate
 * limit v lib/community/game-suggestions.ts (počítá se z uložených řádků).
 */
export async function submitGameSuggestionAction(
  _prevState: SubmitGameSuggestionState,
  formData: FormData
): Promise<SubmitGameSuggestionState> {
  const evaluation = evaluateGameSuggestion(formData);
  if (!evaluation.ok) {
    return { status: "error", message: evaluation.message };
  }

  // Kontrola rate limitu je best-effort — když se nepovede (např. DB
  // výpadek), radši návrh uložit než ho zahodit kvůli kontrole navíc.
  try {
    const rateLimit = await checkGameSuggestionRateLimit();
    if (!rateLimit.allowed) {
      return { status: "error", message: rateLimit.message };
    }
  } catch (error) {
    console.error(
      "Game suggestion: kontrola rate limitu selhala, pokračuji bez ní:",
      error instanceof Error ? error.message : error
    );
  }

  try {
    await createGameSuggestion(evaluation.payload);
  } catch (error) {
    console.error("Game suggestion: uložení návrhu selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  await trackEvent({ event: "suggestion_created", metadata: { type: "game" } });

  return {
    status: "success",
    message: "Díky! Návrh jsme dostali a podíváme se na něj.",
  };
}
