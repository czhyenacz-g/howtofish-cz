"use client";

import { useActionState } from "react";
import { submitLocationSuggestionAction, type SubmitLocationState } from "./actions";

const initialState: SubmitLocationState = { status: "idle" };

export default function LocationSuggestionForm() {
  const [state, formAction, isPending] = useActionState(submitLocationSuggestionAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          Název
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={80}
          placeholder="Skrytá zátoka"
          className="block w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-cyan-100/30 focus:border-amber-300 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="island" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          Ostrov
        </label>
        <input
          id="island"
          name="island"
          type="text"
          maxLength={80}
          placeholder="Ostrov 2"
          className="block w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-cyan-100/30 focus:border-amber-300 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="notableThings" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          Co jsi tam našel
        </label>
        <textarea
          id="notableThings"
          name="notableThings"
          rows={3}
          maxLength={400}
          className="block w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-cyan-100/30 focus:border-amber-300 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="screenshot" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          Screenshot
        </label>
        <input
          id="screenshot"
          name="screenshot"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="block w-full rounded-md border border-white/15 bg-white/5 text-sm text-cyan-100/80 file:mr-3 file:rounded file:border-0 file:bg-amber-400 file:px-3 file:py-2 file:font-serif file:text-sm file:text-gray-900 file:transition hover:file:bg-amber-300"
        />
        <p className="mt-1 text-xs text-cyan-100/50">JPG, PNG nebo WebP, max. 8 MB</p>
      </div>

      <div>
        <label htmlFor="note" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          Poznámka (nepovinné)
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          maxLength={300}
          className="block w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-cyan-100/30 focus:border-amber-300 focus:outline-none"
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-cyan-100/70">
        <input
          type="checkbox"
          name="rightsConfirmed"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-white/5 text-amber-400 focus:ring-amber-300"
        />
        Potvrzuji, že mám právo tento screenshot zveřejnit.
      </label>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-300">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="min-h-[44px] w-full rounded-md bg-amber-400 px-4 py-2 font-serif text-sm text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Odesílám návrh…" : "Odeslat návrh"}
      </button>
    </form>
  );
}
