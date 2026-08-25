"use client";

import { useActionState } from "react";
import { submitItemSuggestionAction, type SubmitItemState } from "./actions";
import { ITEM_TYPES } from "./evaluate-item-suggestion";

const initialState: SubmitItemState = { status: "idle" };

export default function ItemSuggestionForm() {
  const [state, formAction, isPending] = useActionState(submitItemSuggestionAction, initialState);

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
          placeholder="Golden Rod"
          className="block w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-cyan-100/30 focus:border-amber-300 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="itemType" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          Typ
        </label>
        <select
          id="itemType"
          name="itemType"
          defaultValue=""
          className="block w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-300 focus:outline-none"
        >
          <option value="">Nevybráno</option>
          {ITEM_TYPES.map((type) => (
            <option key={type} value={type} className="bg-[#0e3347]">
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="obtainedAt" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          Kde získat
        </label>
        <input
          id="obtainedAt"
          name="obtainedAt"
          type="text"
          maxLength={160}
          placeholder="Ostrov 3, obchod"
          className="block w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-cyan-100/30 focus:border-amber-300 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="use" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          K čemu slouží
        </label>
        <input
          id="use"
          name="use"
          type="text"
          maxLength={200}
          placeholder="Lepší rybaření"
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
