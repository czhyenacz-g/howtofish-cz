"use client";

import { useActionState } from "react";
import { GAME_NAME_MAX_LENGTH, NOTE_MAX_LENGTH } from "./evaluate-game-suggestion";
import { submitGameSuggestionAction, type SubmitGameSuggestionState } from "./submit-game-suggestion-action";

const initialState: SubmitGameSuggestionState = { status: "idle" };

export default function GameSuggestForm() {
  const [state, formAction, isPending] = useActionState(submitGameSuggestionAction, initialState);

  if (state.status === "success") {
    return (
      <p role="status" className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Honeypot — skryté pole, které člověk nikdy nevyplní (viz
          evaluate-game-suggestion.ts). Bez vizuální stopy i pro
          odečítače obrazovky. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="gameName" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          Název hry
        </label>
        <input
          id="gameName"
          name="gameName"
          type="text"
          required
          maxLength={GAME_NAME_MAX_LENGTH}
          placeholder="Např. Moonglow Bay"
          className="block w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-cyan-100/30 focus:border-amber-300 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="note" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          Poznámka (nepovinné)
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={NOTE_MAX_LENGTH}
          placeholder="Kde se v ní rybaří? Čím je zajímavá?"
          className="block w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-cyan-100/30 focus:border-amber-300 focus:outline-none"
        />
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-300">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="min-h-[44px] w-full rounded-md bg-amber-400 px-4 py-2 font-serif text-sm text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {isPending ? "Odesílám…" : "Odeslat"}
      </button>
    </form>
  );
}
