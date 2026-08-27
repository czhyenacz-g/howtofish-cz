"use server";

import { redirect } from "next/navigation";
import { trackEvent } from "../../../../lib/analytics/events";
import { getCurrentUser } from "../../../../lib/auth/current-user";
import { evaluateCorrection, GENERIC_ERROR } from "../../../../lib/community/validation";
import {
  checkLocationRateLimit,
  createLocationCorrection,
  createLocationSuggestion,
  getLocationEntries,
  getMyPendingLocations,
  uploadLocationImage,
} from "../../../../lib/universal-content-api/locations";
import type { CorrectionFormState } from "../../../components/community/CorrectionForm";
import { evaluateLocationSuggestion } from "./evaluate-location-suggestion";

export type SubmitLocationState = { status: "idle" | "error"; message?: string };

export async function submitLocationSuggestionAction(
  _prevState: SubmitLocationState,
  formData: FormData
): Promise<SubmitLocationState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Pro přidání návrhu se přihlas přes Steam." };
  if (user.isBlocked) return { status: "error", message: "Tento účet momentálně nemůže navrhovat obsah." };

  let approvedTitles: string[] = [];
  let pendingTitles: string[] = [];
  try {
    const [approved, pending] = await Promise.all([getLocationEntries(), getMyPendingLocations(user.steamId)]);
    approvedTitles = approved.map((l) => l.title);
    pendingTitles = pending.map((l) => l.title);
  } catch (error) {
    console.error("Location suggestion: čtení existujících záznamů selhalo:", error instanceof Error ? error.message : error);
  }

  const evaluation = evaluateLocationSuggestion(user, formData, pendingTitles, approvedTitles);
  if (!evaluation.ok) return { status: "error", message: evaluation.message };

  try {
    const rateLimit = await checkLocationRateLimit(user.steamId);
    if (!rateLimit.allowed) return { status: "error", message: rateLimit.message };
  } catch (error) {
    console.error("Location suggestion: kontrola rate limitu selhala, pokračuji bez ní:", error instanceof Error ? error.message : error);
  }

  let recordId: number;
  try {
    const record = await createLocationSuggestion(evaluation.payload);
    recordId = record.id;
  } catch (error) {
    console.error("Location suggestion: vytvoření recordu selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  try {
    await uploadLocationImage(recordId, evaluation.file);
  } catch (firstError) {
    try {
      await uploadLocationImage(recordId, evaluation.file);
    } catch (secondError) {
      console.error(
        `Location suggestion: media upload selhal i napodruhé pro record #${recordId} — zůstává jako "pending" bez obrázku.`,
        firstError instanceof Error ? firstError.message : firstError,
        secondError instanceof Error ? secondError.message : secondError
      );
      return { status: "error", message: GENERIC_ERROR };
    }
  }

  await trackEvent({ event: "suggestion_created", steamId: user.steamId, metadata: { type: "location" } });

  redirect("/lokace");
}

export async function submitLocationCorrectionAction(
  _prevState: CorrectionFormState,
  formData: FormData
): Promise<CorrectionFormState> {
  const user = await getCurrentUser();
  const evaluation = evaluateCorrection(user, formData);
  if (!evaluation.ok) return { status: "error", message: evaluation.message };

  try {
    const rateLimit = await checkLocationRateLimit(evaluation.payload.steam_id);
    if (!rateLimit.allowed) return { status: "error", message: rateLimit.message };
  } catch (error) {
    console.error("Location correction: kontrola rate limitu selhala, pokračuji bez ní:", error instanceof Error ? error.message : error);
  }

  let recordId: number;
  try {
    const record = await createLocationCorrection(evaluation.payload);
    recordId = record.id;
  } catch (error) {
    console.error("Location correction: vytvoření recordu selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  if (evaluation.file) {
    try {
      await uploadLocationImage(recordId, evaluation.file);
    } catch (error) {
      console.error(
        `Location correction: media upload selhal pro record #${recordId} — text opravy zůstává uložený i bez obrázku.`,
        error instanceof Error ? error.message : error
      );
    }
  }

  redirect("/lokace");
}
