"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth/current-user";
import {
  checkSuggestionRateLimit,
  createSuggestionRecord,
  getMyPendingSuggestions,
  uploadSuggestionImage,
} from "../../../lib/universal-content-api/suggestions";
import { evaluateSuggestion, GENERIC_ERROR } from "./evaluate-suggestion";

export type SubmitSuggestionState = {
  status: "idle" | "error";
  message?: string;
};

// Server Action volaná přímo z <form action={...}> (useActionState) —
// browser nikdy nevidí UNIVERSAL_CONTENT_API_TOKEN. SteamID/nickname se
// NIKDY neberou z formData, vždy jen z ověřené server-side session
// (stejný vzor jako upload-action.ts u úlovků).
export async function submitSuggestionAction(
  _prevState: SubmitSuggestionState,
  formData: FormData
): Promise<SubmitSuggestionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { status: "error", message: "Pro návrh nové ryby se přihlas přes Steam." };
  }
  if (user.isBlocked) {
    return { status: "error", message: "Tento účet momentálně nemůže navrhovat obsah." };
  }

  // Kontrola duplicit potřebuje vlastní pending návrhy — pokud čtení
  // selže, radši pokračovat bez téhle kontroly než tvrdě shodit celý submit.
  let existingPendingNames: string[] = [];
  try {
    const pending = await getMyPendingSuggestions(user.steamId);
    existingPendingNames = pending.map((s) => s.name);
  } catch (error) {
    console.error(
      "Fish suggestion: čtení vlastních pending návrhů selhalo:",
      error instanceof Error ? error.message : error
    );
  }

  const evaluation = evaluateSuggestion(user, formData, existingPendingNames);
  if (!evaluation.ok) {
    return { status: "error", message: evaluation.message };
  }

  try {
    const rateLimit = await checkSuggestionRateLimit(user.steamId);
    if (!rateLimit.allowed) {
      return { status: "error", message: rateLimit.message };
    }
  } catch (error) {
    console.error(
      "Fish suggestion: kontrola rate limitu selhala, pokračuji bez ní:",
      error instanceof Error ? error.message : error
    );
  }

  let recordId: number;
  try {
    const record = await createSuggestionRecord(evaluation.payload);
    recordId = record.id;
  } catch (error) {
    console.error("Fish suggestion: vytvoření recordu selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  try {
    await uploadSuggestionImage(recordId, evaluation.file);
  } catch (firstError) {
    // Jeden okamžitý pokus znovu — stejný vzor jako u catches.
    try {
      await uploadSuggestionImage(recordId, evaluation.file);
    } catch (secondError) {
      console.error(
        `Fish suggestion: media upload selhal i napodruhé pro record #${recordId} — zůstává jako "pending" bez obrázku (orphan). Smaž ho ručně ve Filament adminu.`,
        firstError instanceof Error ? firstError.message : firstError,
        secondError instanceof Error ? secondError.message : secondError
      );
      return { status: "error", message: GENERIC_ERROR };
    }
  }

  redirect("/ryby");
}
