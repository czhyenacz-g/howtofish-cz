"use server";

import { trackEvent } from "../../../lib/analytics/events.ts";
import { getCurrentUser } from "../../../lib/auth/current-user.ts";
import { getActivePresences, hideOwnPresence, setOwnPresence } from "../../../lib/universal-content-api/presence.ts";
import { checkWaveAllowed, createWave, getIncomingWaves } from "../../../lib/universal-content-api/waves.ts";
import type { PresenceEntry, WaveEntry } from "../../../lib/universal-content-api/types.ts";
import { evaluateHidePresence, evaluateSetPresence } from "./evaluate-presence.ts";
import { evaluateWave } from "./evaluate-wave.ts";

export type PresenceActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

async function performSetPresence(statusRaw: unknown): Promise<PresenceActionState & { created?: boolean; steamId?: string }> {
  const user = await getCurrentUser();
  const evaluation = evaluateSetPresence(user, statusRaw);
  if (!evaluation.ok) {
    return { status: "error", message: evaluation.message };
  }

  try {
    const { created } = await setOwnPresence(evaluation);
    return { status: "success", created, steamId: evaluation.steamId };
  } catch (error) {
    console.error("Multiplayer presence: uložení selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: "Multiplayer ostrov je teď chvíli nedostupný. Zkus to prosím později." };
  }
}

/** Opt-in i změna statusu jsou stejná operace — viz zadání. Sdílený `<form>` (viz MultiplayerBoard.tsx). */
export async function setPresenceAction(_prevState: PresenceActionState, formData: FormData): Promise<PresenceActionState> {
  const result = await performSetPresence(formData.get("status"));

  // "join" jen při SKUTEČNÉM opt-in/re-aktivaci (created:true), nikdy
  // při pouhé změně statusu na existující viditelné presenci — a nikdy
  // z heartbeatAction níž (ten performSetPresence taky volá, ale
  // trackEvent se tam vůbec nevolá, viz zadání "heartbeat nesmí
  // vytvářet event").
  if (result.status === "success" && result.created && result.steamId) {
    await trackEvent({ event: "multiplayer_join", steamId: result.steamId });
  }

  return { status: result.status, message: result.message };
}

/** Heartbeat — automatické obnovení last_seen_at na pozadí, bez formuláře. Nikdy negeneruje analytics event. */
export async function heartbeatAction(status: string): Promise<PresenceActionState> {
  const result = await performSetPresence(status);
  return { status: result.status, message: result.message };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- useActionState vyžaduje (prevState, formData) tvar, "Skrýt mě" žádná form data nepotřebuje
export async function hidePresenceAction(_prevState: PresenceActionState, _formData: FormData): Promise<PresenceActionState> {
  const user = await getCurrentUser();
  const evaluation = evaluateHidePresence(user);
  if (!evaluation.ok) {
    return { status: "error", message: evaluation.message };
  }

  try {
    await hideOwnPresence(evaluation.steamId);
  } catch (error) {
    console.error("Multiplayer presence: skrytí selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: "Multiplayer ostrov je teď chvíli nedostupný. Zkus to prosím později." };
  }

  await trackEvent({ event: "multiplayer_leave", steamId: evaluation.steamId });

  return { status: "success" };
}

export type WaveActionState = {
  status: "idle" | "success" | "error" | "already-waved";
  message?: string;
};

export async function waveAction(_prevState: WaveActionState, formData: FormData): Promise<WaveActionState> {
  const user = await getCurrentUser();

  let activePresences: PresenceEntry[];
  try {
    activePresences = await getActivePresences();
  } catch (error) {
    console.error("Multiplayer wave: čtení aktivních hráčů selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: "Multiplayer ostrov je teď chvíli nedostupný. Zkus to prosím později." };
  }

  const activeSteamIds = new Set(activePresences.map((p) => p.steamId));
  const evaluation = evaluateWave(user, formData.get("toSteamId"), activeSteamIds);
  if (!evaluation.ok) {
    return { status: "error", message: evaluation.message };
  }

  try {
    const limit = await checkWaveAllowed(evaluation.fromSteamId, evaluation.toSteamId);
    if (!limit.allowed) {
      return { status: limit.alreadyWaved ? "already-waved" : "error", message: limit.message };
    }

    await createWave(evaluation);
  } catch (error) {
    console.error("Multiplayer wave: odeslání selhalo:", error instanceof Error ? error.message : error);
    return { status: "error", message: "Multiplayer ostrov je teď chvíli nedostupný. Zkus to prosím později." };
  }

  // Bez recipient steam_id v metadata — viz zadání (to patří jen do
  // multiplayer_waves, ne analytics_events).
  await trackEvent({ event: "wave_sent", steamId: evaluation.fromSteamId });

  return { status: "success", message: "✓ Zamáváno" };
}

export type BoardData =
  | { ok: true; presences: PresenceEntry[]; incomingWaves: WaveEntry[] }
  | { ok: false };

/** Polling (max ~60s, viz zadání) — obnoví seznam aktivních hráčů a příchozí waves. */
export async function refreshBoardAction(): Promise<BoardData> {
  const user = await getCurrentUser();

  try {
    const [presences, incomingWaves] = await Promise.all([
      getActivePresences(),
      user ? getIncomingWaves(user.steamId) : Promise.resolve([]),
    ]);
    return { ok: true, presences, incomingWaves };
  } catch (error) {
    console.error("Multiplayer board: refresh selhal:", error instanceof Error ? error.message : error);
    return { ok: false };
  }
}
