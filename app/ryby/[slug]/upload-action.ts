"use server";

import { getCurrentUser } from "../../../lib/auth/current-user";
import { createCatchRecord, uploadCatchImage } from "../../../lib/universal-content-api/catches";
import { evaluateCatchUpload, GENERIC_ERROR } from "./evaluate-catch-upload";

export type UploadCatchState = {
  status: "idle" | "success" | "error";
  message?: string;
};

// Server Action volaná přímo z <form action={...}> (useActionState) —
// browser nikdy nevidí UNIVERSAL_CONTENT_API_TOKEN, ten čte jen
// lib/universal-content-api/client.ts na serveru. SteamID/nickname se
// NIKDY neberou z formData, vždy jen z ověřené server-side session
// (viz getCurrentUser). Validace samotná je v evaluate-catch-upload.ts
// (čistá funkce, testovaná bez next/headers).
export async function uploadCatchAction(
  _prevState: UploadCatchState,
  formData: FormData
): Promise<UploadCatchState> {
  const user = await getCurrentUser();
  const evaluation = evaluateCatchUpload(user, formData);

  if (!evaluation.ok) {
    return { status: "error", message: evaluation.message };
  }

  let recordId: number;
  try {
    const record = await createCatchRecord(evaluation.payload);
    recordId = record.id;
  } catch (error) {
    console.error("Catch upload: vytvoření recordu selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  try {
    await uploadCatchImage(recordId, evaluation.file);
  } catch (firstError) {
    // Jeden okamžitý pokus znovu — přechodné chyby (timeout, výpadek)
    // jsou celkem časté a tohle je nejlevnější způsob, jak je přežít.
    try {
      await uploadCatchImage(recordId, evaluation.file);
    } catch (secondError) {
      console.error(
        `Catch upload: media upload selhal i napodruhé pro record #${recordId} — zůstává jako "pending" bez obrázku (orphan). Smaž ho ručně ve Filament adminu.`,
        firstError instanceof Error ? firstError.message : firstError,
        secondError instanceof Error ? secondError.message : secondError
      );
      return { status: "error", message: GENERIC_ERROR };
    }
  }

  return {
    status: "success",
    message: "Úlovek byl odeslán ke schválení. Po schválení se objeví na stránce této ryby.",
  };
}
