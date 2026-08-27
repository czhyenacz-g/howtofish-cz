"use server";

import { redirect } from "next/navigation";
import { trackEvent } from "../../../../lib/analytics/events";
import { getCurrentUser } from "../../../../lib/auth/current-user";
import { evaluateCorrection, GENERIC_ERROR } from "../../../../lib/community/validation";
import {
  checkBossRateLimit,
  createBossCorrection,
  createBossSuggestion,
  getBossEntries,
  getMyPendingBosses,
  uploadBossImage,
} from "../../../../lib/universal-content-api/bosses";
import type { CorrectionFormState } from "../../../components/community/CorrectionForm";
import { evaluateBossSuggestion } from "./evaluate-boss-suggestion";

export type SubmitBossState = { status: "idle" | "error"; message?: string };

export async function submitBossSuggestionAction(
  _prevState: SubmitBossState,
  formData: FormData
): Promise<SubmitBossState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Pro přidání návrhu se přihlas přes Steam." };
  if (user.isBlocked) return { status: "error", message: "Tento účet momentálně nemůže navrhovat obsah." };

  let approvedTitles: string[] = [];
  let pendingTitles: string[] = [];
  try {
    const [approved, pending] = await Promise.all([getBossEntries(), getMyPendingBosses(user.steamId)]);
    approvedTitles = approved.map((b) => b.title);
    pendingTitles = pending.map((b) => b.title);
  } catch (error) {
    console.error("Boss suggestion: čtení existujících záznamů selhalo:", error instanceof Error ? error.message : error);
  }

  const evaluation = evaluateBossSuggestion(user, formData, pendingTitles, approvedTitles);
  if (!evaluation.ok) return { status: "error", message: evaluation.message };

  try {
    const rateLimit = await checkBossRateLimit(user.steamId);
    if (!rateLimit.allowed) return { status: "error", message: rateLimit.message };
  } catch (error) {
    console.error("Boss suggestion: kontrola rate limitu selhala, pokračuji bez ní:", error instanceof Error ? error.message : error);
  }

  let recordId: number;
  try {
    const record = await createBossSuggestion(evaluation.payload);
    recordId = record.id;
  } catch (error) {
    console.error("Boss suggestion: vytvoření recordu selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  try {
    await uploadBossImage(recordId, evaluation.file);
  } catch (firstError) {
    try {
      await uploadBossImage(recordId, evaluation.file);
    } catch (secondError) {
      console.error(
        `Boss suggestion: media upload selhal i napodruhé pro record #${recordId} — zůstává jako "pending" bez obrázku.`,
        firstError instanceof Error ? firstError.message : firstError,
        secondError instanceof Error ? secondError.message : secondError
      );
      return { status: "error", message: GENERIC_ERROR };
    }
  }

  await trackEvent({ event: "suggestion_created", steamId: user.steamId, metadata: { type: "boss" } });

  redirect("/bossove");
}

export async function submitBossCorrectionAction(
  _prevState: CorrectionFormState,
  formData: FormData
): Promise<CorrectionFormState> {
  const user = await getCurrentUser();
  const evaluation = evaluateCorrection(user, formData);
  if (!evaluation.ok) return { status: "error", message: evaluation.message };

  try {
    const rateLimit = await checkBossRateLimit(evaluation.payload.steam_id);
    if (!rateLimit.allowed) return { status: "error", message: rateLimit.message };
  } catch (error) {
    console.error("Boss correction: kontrola rate limitu selhala, pokračuji bez ní:", error instanceof Error ? error.message : error);
  }

  let recordId: number;
  try {
    const record = await createBossCorrection(evaluation.payload);
    recordId = record.id;
  } catch (error) {
    console.error("Boss correction: vytvoření recordu selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  if (evaluation.file) {
    try {
      await uploadBossImage(recordId, evaluation.file);
    } catch (error) {
      console.error(
        `Boss correction: media upload selhal pro record #${recordId} — text opravy zůstává uložený i bez obrázku.`,
        error instanceof Error ? error.message : error
      );
    }
  }

  redirect("/bossove");
}
