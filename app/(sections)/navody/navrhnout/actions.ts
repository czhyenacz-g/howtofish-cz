"use server";

import { redirect } from "next/navigation";
import { trackEvent } from "../../../../lib/analytics/events";
import { getCurrentUser } from "../../../../lib/auth/current-user";
import { evaluateCorrection, GENERIC_ERROR } from "../../../../lib/community/validation";
import {
  checkGuideRateLimit,
  createGuideCorrection,
  createGuideSuggestion,
  getGuideEntries,
  getMyPendingGuides,
  uploadGuideImage,
} from "../../../../lib/universal-content-api/guides";
import type { CorrectionFormState } from "../../../components/community/CorrectionForm";
import { evaluateGuideSuggestion } from "./evaluate-guide-suggestion";

export type SubmitGuideState = { status: "idle" | "error"; message?: string };

export async function submitGuideSuggestionAction(
  _prevState: SubmitGuideState,
  formData: FormData
): Promise<SubmitGuideState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Pro přidání návrhu se přihlas přes Steam." };
  if (user.isBlocked) return { status: "error", message: "Tento účet momentálně nemůže navrhovat obsah." };

  let approvedTitles: string[] = [];
  let pendingTitles: string[] = [];
  try {
    const [approved, pending] = await Promise.all([getGuideEntries(), getMyPendingGuides(user.steamId)]);
    approvedTitles = approved.map((g) => g.title);
    pendingTitles = pending.map((g) => g.title);
  } catch (error) {
    console.error("Guide suggestion: čtení existujících záznamů selhalo:", error instanceof Error ? error.message : error);
  }

  const evaluation = evaluateGuideSuggestion(user, formData, pendingTitles, approvedTitles);
  if (!evaluation.ok) return { status: "error", message: evaluation.message };

  try {
    const rateLimit = await checkGuideRateLimit(user.steamId);
    if (!rateLimit.allowed) return { status: "error", message: rateLimit.message };
  } catch (error) {
    console.error("Guide suggestion: kontrola rate limitu selhala, pokračuji bez ní:", error instanceof Error ? error.message : error);
  }

  let recordId: number;
  try {
    const record = await createGuideSuggestion(evaluation.payload);
    recordId = record.id;
  } catch (error) {
    console.error("Guide suggestion: vytvoření recordu selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  if (evaluation.file) {
    try {
      await uploadGuideImage(recordId, evaluation.file);
    } catch (firstError) {
      try {
        await uploadGuideImage(recordId, evaluation.file);
      } catch (secondError) {
        console.error(
          `Guide suggestion: media upload selhal i napodruhé pro record #${recordId} — text zůstává uložený i bez obrázku.`,
          firstError instanceof Error ? firstError.message : firstError,
          secondError instanceof Error ? secondError.message : secondError
        );
      }
    }
  }

  await trackEvent({ event: "suggestion_created", steamId: user.steamId, metadata: { type: "guide" } });

  redirect("/navody");
}

export async function submitGuideCorrectionAction(
  _prevState: CorrectionFormState,
  formData: FormData
): Promise<CorrectionFormState> {
  const user = await getCurrentUser();
  const evaluation = evaluateCorrection(user, formData);
  if (!evaluation.ok) return { status: "error", message: evaluation.message };

  try {
    const rateLimit = await checkGuideRateLimit(evaluation.payload.steam_id);
    if (!rateLimit.allowed) return { status: "error", message: rateLimit.message };
  } catch (error) {
    console.error("Guide correction: kontrola rate limitu selhala, pokračuji bez ní:", error instanceof Error ? error.message : error);
  }

  let recordId: number;
  try {
    const record = await createGuideCorrection(evaluation.payload);
    recordId = record.id;
  } catch (error) {
    console.error("Guide correction: vytvoření recordu selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  if (evaluation.file) {
    try {
      await uploadGuideImage(recordId, evaluation.file);
    } catch (error) {
      console.error(
        `Guide correction: media upload selhal pro record #${recordId} — text opravy zůstává uložený i bez obrázku.`,
        error instanceof Error ? error.message : error
      );
    }
  }

  redirect("/navody");
}
