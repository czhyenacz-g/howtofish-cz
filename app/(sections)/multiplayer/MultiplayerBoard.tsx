"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { PRESENCE_STATUSES } from "../../../lib/universal-content-api/types";
import type { PresenceEntry, PresenceStatusKey, WaveEntry } from "../../../lib/universal-content-api/types";
import { heartbeatAction, hidePresenceAction, refreshBoardAction, setPresenceAction, type PresenceActionState } from "./actions";
import PlayerCard from "./PlayerCard";

// Viz zadání: polling max ~60s, heartbeat cca každých 5 minut. Žádné
// websockety, žádný Redis — jen periodické Server Action volání.
const POLL_INTERVAL_MS = 60_000;
const HEARTBEAT_INTERVAL_MS = 5 * 60_000;

const INITIAL_STATE: PresenceActionState = { status: "idle" };

function timeAgoLabel(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "právě teď";
  if (minutes === 1) return "před minutou";
  return `před ${minutes} min`;
}

export default function MultiplayerBoard({
  currentUser,
  initialPresences,
  initialIncomingWaves,
}: {
  currentUser: { steamId: string; nickname: string; avatarUrl: string | null };
  initialPresences: PresenceEntry[];
  initialIncomingWaves: WaveEntry[];
}) {
  const [presences, setPresences] = useState(initialPresences);
  const [incomingWaves, setIncomingWaves] = useState(initialIncomingWaves);
  const [presenceState, presenceFormAction, presencePending] = useActionState(setPresenceAction, INITIAL_STATE);
  const [hideState, hideFormAction, hidePending] = useActionState(hidePresenceAction, INITIAL_STATE);

  const myPresence = presences.find((p) => p.steamId === currentUser.steamId) ?? null;

  // Heartbeat potřebuje znát AKTUÁLNÍ status i mezi re-rendery bez
  // závislosti na React state timingu — ref se nastaví synchronně při
  // každém renderu, interval ho jen čte.
  const myStatusRef = useRef<PresenceStatusKey | null>(myPresence?.status ?? null);
  myStatusRef.current = myPresence?.status ?? null;

  async function refresh() {
    const result = await refreshBoardAction();
    if (result.ok) {
      setPresences(result.presences);
      setIncomingWaves(result.incomingWaves);
    }
    // Neúspěšný poll se tiše přeskočí — poslední známá data zůstávají,
    // web/stránka kvůli dočasnému výpadku UCA nespadne (viz zadání).
  }

  useEffect(() => {
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (myStatusRef.current) {
        void heartbeatAction(myStatusRef.current);
      }
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Po vlastní úspěšné akci (opt-in / změna statusu / skrytí) rovnou
  // obnov board, ať se vidím v seznamu hned, ne až po dalším pollu.
  useEffect(() => {
    if (presenceState.status === "success" || hideState.status === "success") {
      void refresh();
    }
  }, [presenceState, hideState]);

  const others = presences.filter((p) => p.steamId !== currentUser.steamId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-white">
      <section className="rounded-lg border border-white/10 bg-[#0e3347]/60 p-5">
        {myPresence ? (
          <div>
            <p className="font-serif text-amber-300">✓ Jsem na multiplayer ostrově</p>
            <form action={presenceFormAction} className="mt-3 flex flex-wrap gap-2">
              {PRESENCE_STATUSES.map((s) => (
                <button
                  key={s.key}
                  type="submit"
                  name="status"
                  value={s.key}
                  disabled={presencePending}
                  aria-pressed={myPresence.status === s.key}
                  className={`min-h-[44px] rounded-md border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    myPresence.status === s.key
                      ? "border-amber-300 bg-amber-400/20 text-amber-200"
                      : "border-white/15 bg-white/5 text-cyan-100/80 hover:border-amber-300/50"
                  }`}
                >
                  <span aria-hidden="true">{s.emoji}</span> {s.label}
                </button>
              ))}
            </form>
            <form action={hideFormAction} className="mt-3">
              <button
                type="submit"
                disabled={hidePending}
                className="min-h-[44px] rounded-md border border-white/15 px-4 py-2 text-sm text-cyan-100/70 transition hover:border-red-300/50 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Skrýt mě
              </button>
            </form>
          </div>
        ) : (
          <form action={presenceFormAction}>
            <button
              type="submit"
              name="status"
              value="play"
              disabled={presencePending}
              className="min-h-[44px] w-full rounded-md bg-amber-400 px-6 py-3 font-serif text-base text-gray-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              🔎 Hledám spoluhráče
            </button>
          </form>
        )}

        {presenceState.status === "error" && (
          <p role="alert" className="mt-2 text-sm text-red-300">
            {presenceState.message}
          </p>
        )}
        {hideState.status === "error" && (
          <p role="alert" className="mt-2 text-sm text-red-300">
            {hideState.message}
          </p>
        )}
      </section>

      {incomingWaves.length > 0 && (
        <section className="mt-6 rounded-lg border border-amber-300/30 bg-amber-400/5 p-4">
          <h2 className="font-serif text-sm uppercase tracking-wide text-amber-300">Kdo ti zamával</h2>
          <ul className="mt-2 space-y-1 text-sm text-cyan-100/80">
            {incomingWaves.map((w, i) => (
              <li key={`${w.fromSteamId}-${w.createdAt}-${i}`}>
                👋 {w.fromNickname} ti zamával {timeAgoLabel(w.createdAt)}.
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Aktivní hráči</h2>
        {others.length === 0 && !myPresence ? (
          <p className="mt-3 text-cyan-100/60">Nikdo tu teď není — buď první, kdo se přidá!</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myPresence && <PlayerCard presence={myPresence} isOwn timeAgoLabel={timeAgoLabel(myPresence.lastSeenAt)} />}
            {others.map((p) => (
              <PlayerCard key={p.steamId} presence={p} isOwn={false} timeAgoLabel={timeAgoLabel(p.lastSeenAt)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
