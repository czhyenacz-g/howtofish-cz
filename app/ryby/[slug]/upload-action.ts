"use server";

import { after } from "next/server";
import { trackEvent } from "../../../lib/analytics/events";
import { getCurrentUser } from "../../../lib/auth/current-user";
import { createCatchRecord, uploadCatchImage } from "../../../lib/universal-content-api/catches";
import type { UcaMedia } from "../../../lib/universal-content-api/types";
import { evaluateCatchUpload, GENERIC_ERROR } from "./evaluate-catch-upload";
import { runCatchModeration } from "./moderate-catch-upload";

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

  let media: UcaMedia;
  try {
    media = await uploadCatchImage(recordId, evaluation.file);
  } catch (firstError) {
    // Jeden okamžitý pokus znovu — přechodné chyby (timeout, výpadek)
    // jsou celkem časté a tohle je nejlevnější způsob, jak je přežít.
    try {
      media = await uploadCatchImage(recordId, evaluation.file);
    } catch (secondError) {
      console.error(
        `Catch upload: media upload selhal i napodruhé pro record #${recordId} — zůstává jako "pending" bez obrázku (orphan). Smaž ho ručně ve Filament adminu.`,
        firstError instanceof Error ? firstError.message : firstError,
        secondError instanceof Error ? secondError.message : secondError
      );
      return { status: "error", message: GENERIC_ERROR };
    }
  }

  // Best-effort, po úspěšném uploadu (upload je úspěšný bez ohledu na
  // tohle, viz zadání) — jen fish_slug, žádná poznámka/filename/URL.
  await trackEvent({
    event: "fish_upload",
    steamId: evaluation.payload.steam_id,
    metadata: { fish_slug: evaluation.payload.fish_slug },
  });

  // AI moderace (Content API AiGateway + Gemini) — POSTĚ po odeslání
  // odpovědi uživateli (next/server "after"), upload už uspěl bez
  // ohledu na výsledek. AiGateway jen vrátí strukturovaný výsledek,
  // rozhodnutí approve/reject/review zpracuje runCatchModeration.
  // Selhání jakéhokoli druhu (timeout, provider error, invalid
  // response) nechá record jako "pending" pro ruční kontrolu — nikdy
  // neztrácí ani nezamítá upload automaticky.
  after(() => runCatchModeration(recordId, media.id, evaluation.payload.fish_slug));

  return {
    status: "success",
    message: "Úlovek byl odeslán ke schválení. Po schválení se objeví na stránce této ryby.",
  };
}
