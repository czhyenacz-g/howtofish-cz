import Image from "next/image";
import type { FishSuggestion } from "../../lib/universal-content-api/types";
import FishImage from "./FishImage";

// Soukromá karta vlastního pending návrhu — vidí ji jen autor (server
// už dodává jen jeho vlastní návrhy, viz app/ryby/page.tsx). Není to
// odkaz jako FishCard — pro návrh zatím žádný detail neexistuje.
export default function FishSuggestionCard({ suggestion }: { suggestion: FishSuggestion }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border-2 border-dashed border-amber-400/70 bg-[#0e3347]/60">
      <div className="relative aspect-[4/3] w-full">
        {suggestion.image ? (
          <Image
            src={suggestion.image.url}
            alt={suggestion.name}
            fill
            className="object-cover opacity-70"
          />
        ) : (
          <FishImage alt={suggestion.name} className="absolute inset-0 opacity-70" />
        )}
        <span className="absolute left-2 top-2 -rotate-2 rounded border border-amber-300 bg-amber-400 px-2 py-0.5 font-serif text-[11px] uppercase tracking-wide text-gray-900 shadow-sm">
          Čeká na schválení
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4 text-left">
        <h2 className="font-serif text-white">{suggestion.name}</h2>
        <p className="text-xs text-cyan-100/60">
          Navrhl: <span className="font-medium text-white">{suggestion.nickname}</span>
        </p>
        <p className="mt-auto text-xs italic text-amber-200/80">Tento návrh zatím vidíš jen ty.</p>
      </div>
    </div>
  );
}
