"use server";

import { redirect } from "next/navigation";
import { trackEvent } from "../../../../lib/analytics/events";
import { getCurrentUser } from "../../../../lib/auth/current-user";
import { evaluateCorrection, GENERIC_ERROR } from "../../../../lib/community/validation";
import {
  checkItemRateLimit,
  createItemCorrection,
  createItemSuggestion,
  getItemEntries,
  getMyPendingItems,
  uploadItemImage,
} from "../../../../lib/universal-content-api/items";
import type { CorrectionFormState } from "../../../components/community/CorrectionForm";
import { evaluateItemSuggestion } from "./evaluate-item-suggestion";

export type SubmitItemState = { status: "idle" | "error"; message?: string };

// SteamID/nickname se NIKDY neberou z formData, vždy jen z ověřené
// server-side session — stejný vzor jako u fish suggestions/catches.
export async function submitItemSuggestionAction(
  _prevState: SubmitItemState,
  formData: FormData
): Promise<SubmitItemState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Pro přidání návrhu se přihlas přes Steam." };
  if (user.isBlocked) return { status: "error", message: "Tento účet momentálně nemůže navrhovat obsah." };

  let approvedTitles: string[] = [];
  let pendingTitles: string[] = [];
  try {
    const [approved, pending] = await Promise.all([getItemEntries(), getMyPendingItems(user.steamId)]);
    approvedTitles = approved.map((i) => i.title);
    pendingTitles = pending.map((i) => i.title);
  } catch (error) {
    console.error("Item suggestion: čtení existujících záznamů selhalo:", error instanceof Error ? error.message : error);
  }

  const evaluation = evaluateItemSuggestion(user, formData, pendingTitles, approvedTitles);
  if (!evaluation.ok) return { status: "error", message: evaluation.message };

  try {
    const rateLimit = await checkItemRateLimit(user.steamId);
    if (!rateLimit.allowed) return { status: "error", message: rateLimit.message };
  } catch (error) {
    console.error("Item suggestion: kontrola rate limitu selhala, pokračuji bez ní:", error instanceof Error ? error.message : error);
  }

  let recordId: number;
  try {
    const record = await createItemSuggestion(evaluation.payload);
    recordId = record.id;
  } catch (error) {
    console.error("Item suggestion: vytvoření recordu selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  try {
    await uploadItemImage(recordId, evaluation.file);
  } catch (firstError) {
    try {
      await uploadItemImage(recordId, evaluation.file);
    } catch (secondError) {
      console.error(
        `Item suggestion: media upload selhal i napodruhé pro record #${recordId} — zůstává jako "pending" bez obrázku.`,
        firstError instanceof Error ? firstError.message : firstError,
        secondError instanceof Error ? secondError.message : secondError
      );
      return { status: "error", message: GENERIC_ERROR };
    }
  }

  await trackEvent({ event: "suggestion_created", steamId: user.steamId, metadata: { type: "item" } });

  redirect("/predmety");
}

export async function submitItemCorrectionAction(
  _prevState: CorrectionFormState,
  formData: FormData
): Promise<CorrectionFormState> {
  const user = await getCurrentUser();
  const evaluation = evaluateCorrection(user, formData);
  if (!evaluation.ok) return { status: "error", message: evaluation.message };

  try {
    const rateLimit = await checkItemRateLimit(evaluation.payload.steam_id);
    if (!rateLimit.allowed) return { status: "error", message: rateLimit.message };
  } catch (error) {
    console.error("Item correction: kontrola rate limitu selhala, pokračuji bez ní:", error instanceof Error ? error.message : error);
  }

  let recordId: number;
  try {
    const record = await createItemCorrection(evaluation.payload);
    recordId = record.id;
  } catch (error) {
    console.error("Item correction: vytvoření recordu selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  if (evaluation.file) {
    try {
      await uploadItemImage(recordId, evaluation.file);
    } catch (error) {
      console.error(
        `Item correction: media upload selhal pro record #${recordId} — text opravy zůstává uložený i bez obrázku.`,
        error instanceof Error ? error.message : error
      );
    }
  }

  redirect("/predmety");
}
