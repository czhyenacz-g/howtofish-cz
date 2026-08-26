"use client";

import { useActionState } from "react";
import { PRESENCE_STATUSES } from "../../../lib/universal-content-api/types";
import type { PresenceEntry } from "../../../lib/universal-content-api/types";
import { waveAction, type WaveActionState } from "./actions";

const STATUS_BY_KEY = Object.fromEntries(PRESENCE_STATUSES.map((s) => [s.key, s]));

// Steamovo vlastní, jednoznačné a stabilní číselné profilové URL
// (nezávislé na vanity URL) — stejný tvar jako openid.claimed_id
// v lib/auth/steam-openid.ts, tady bez /openid/ prefixu.
const STEAM_PROFILE_BASE = "https://steamcommunity.com/profiles/";

const WAVE_INITIAL_STATE: WaveActionState = { status: "idle" };

export default function PlayerCard({
  presence,
  isOwn,
  timeAgoLabel,
}: {
  presence: PresenceEntry;
  isOwn: boolean;
  timeAgoLabel: string;
}) {
  const [waveState, waveFormAction, wavePending] = useActionState(waveAction, WAVE_INITIAL_STATE);
  const status = STATUS_BY_KEY[presence.status];
  const profileUrl = `${STEAM_PROFILE_BASE}${presence.steamId}`;
  const waveLocked = waveState.status === "success" || waveState.status === "already-waved";

  return (
    <div
      className={`flex gap-3 rounded-lg border p-4 ${
        isOwn ? "border-amber-300/40 bg-amber-400/5" : "border-white/10 bg-[#0e3347]/60"
      }`}
    >
      {presence.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Steam avatar CDN není v next/image remotePatterns (viz Header.tsx SteamAuthControl)
        <img
          src={presence.avatarUrl}
          alt={`Steam avatar hráče ${presence.nickname}`}
          className="h-12 w-12 shrink-0 rounded-full border border-white/15"
        />
      ) : (
        <div className="h-12 w-12 shrink-0 rounded-full bg-white/10" aria-hidden="true" />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-white">
          {presence.nickname} {isOwn && <span className="text-xs font-sans text-amber-300">(To jsi ty)</span>}
        </p>
        <p className="text-sm text-cyan-100/70">
          <span aria-hidden="true">{status?.emoji}</span> {status?.label ?? presence.status}
        </p>
        <p className="text-xs text-cyan-100/40">{timeAgoLabel}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-md border border-white/15 px-3 py-1.5 text-xs text-cyan-100/80 transition hover:border-amber-300/50 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            Steam profil
          </a>

          {!isOwn && (
            <form action={waveFormAction}>
              <input type="hidden" name="toSteamId" value={presence.steamId} />
              <button
                type="submit"
                disabled={wavePending || waveLocked}
                aria-label={`Zamávat uživateli ${presence.nickname}`}
                className="inline-flex min-h-[44px] items-center rounded-md border border-amber-300/50 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-200 transition hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {waveState.status === "success"
                  ? "✓ Zamáváno"
                  : waveState.status === "already-waved"
                    ? "Už jsi zamával"
                    : "👋 Zamávat"}
              </button>
            </form>
          )}
        </div>

        {waveState.status === "error" && (
          <p role="alert" className="mt-1 text-xs text-red-300">
            {waveState.message}
          </p>
        )}
      </div>
    </div>
  );
}
