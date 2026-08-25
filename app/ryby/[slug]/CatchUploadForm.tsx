"use client";

import { useActionState } from "react";
import { uploadCatchAction, type UploadCatchState } from "./upload-action";

const initialState: UploadCatchState = { status: "idle" };

function getUtcOffsetString(date = new Date()): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${sign}${hh}:${mm}`;
}

function todayLocalDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nowLocalTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function CatchUploadForm({ fishSlug }: { fishSlug: string }) {
  const [state, formAction, isPending] = useActionState(uploadCatchAction, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm text-emerald-200">
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="fishSlug" value={fishSlug} />
      <input type="hidden" name="utcOffset" value={getUtcOffsetString()} />

      <div>
        <label htmlFor="screenshot" className="mb-1 block text-sm font-medium text-[#f4ead9]">
          Screenshot úlovku
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="caughtDate" className="mb-1 block text-sm font-medium text-[#f4ead9]">
            Datum chycení
          </label>
          <input
            id="caughtDate"
            name="caughtDate"
            type="date"
            required
            defaultValue={todayLocalDate()}
            className="block w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark] focus:border-amber-300 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="caughtTime" className="mb-1 block text-sm font-medium text-[#f4ead9]">
            Čas chycení
          </label>
          <input
            id="caughtTime"
            name="caughtTime"
            type="time"
            required
            defaultValue={nowLocalTime()}
            className="block w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark] focus:border-amber-300 focus:outline-none"
          />
        </div>
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
          placeholder="Konečně se povedl."
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
        Potvrzuji, že mám právo tento screenshot zveřejnit a že pochází z mého hraní nebo jej smím sdílet.
      </label>

      <p className="text-xs text-cyan-100/50">Nahraný obsah může být před zveřejněním zkontrolován.</p>

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
        {isPending ? "Odesílám…" : "Odeslat úlovek"}
      </button>
    </form>
  );
}
