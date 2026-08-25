"use client";

import { useActionState } from "react";

export type CorrectionFormState = { status: "idle" | "error"; message?: string };

// Sdílený formulář "Navrhnout opravu" — stejná pole napříč všemi čtyřmi
// doménami (viz lib/community/validation.ts#evaluateCorrection), jen
// jiná server action se za `action` propem předá.
export default function CorrectionForm({
  target,
  action,
}: {
  target: string;
  action: (prevState: CorrectionFormState, formData: FormData) => Promise<CorrectionFormState>;
}) {
  const [state, formAction, isPending] = useActionState(action, { status: "idle" });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <p className="mb-1 text-sm font-medium text-[#f4ead9]">Opravuješ</p>
        <p className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">{target}</p>
        <input type="hidden" name="target" value={target} />
      </div>

      <div>
        <label htmlFor="proposedChanges" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          Co se má opravit nebo doplnit
        </label>
        <textarea
          id="proposedChanges"
          name="proposedChanges"
          required
          rows={4}
          maxLength={500}
          placeholder="Např. špatná lokace — správně je Ostrov 2, ne Ostrov 1."
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
          rows={2}
          maxLength={300}
          className="block w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-cyan-100/30 focus:border-amber-300 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="screenshot" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          Screenshot (nepovinné)
        </label>
        <input
          id="screenshot"
          name="screenshot"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full rounded-md border border-white/15 bg-white/5 text-sm text-cyan-100/80 file:mr-3 file:rounded file:border-0 file:bg-amber-400 file:px-3 file:py-2 file:font-serif file:text-sm file:text-gray-900 file:transition hover:file:bg-amber-300"
        />
        <p className="mt-1 text-xs text-cyan-100/50">JPG, PNG nebo WebP, max. 8 MB</p>
      </div>

      <label className="flex items-start gap-2 text-xs text-cyan-100/70">
        <input
          type="checkbox"
          name="rightsConfirmed"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-white/5 text-amber-400 focus:ring-amber-300"
        />
        Potvrzuji, že mám právo tento obsah zveřejnit.
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
        {isPending ? "Odesílám opravu…" : "Odeslat návrh opravy"}
      </button>
    </form>
  );
}
