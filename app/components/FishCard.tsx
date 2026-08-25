import Link from "next/link";
import type { FishEntry } from "../../data/fish";
import type { CommunityCatch } from "../../lib/universal-content-api/types";
import FishImage from "./FishImage";
import VerificationBadge from "./VerificationBadge";

const CATEGORY_LABEL: Record<FishEntry["category"], string> = {
  ryba: "Ryba",
  tvor: "Tvor",
};

export default function FishCard({
  entry,
  featuredCatch,
}: {
  entry: FishEntry;
  featuredCatch?: CommunityCatch;
}) {
  return (
    <Link
      href={`/ryby/${entry.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0e3347]/60 transition duration-150 hover:-translate-y-0.5 hover:border-amber-400/60 hover:bg-[#0e3347] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[4/3] w-full">
        <FishImage image={featuredCatch?.image.url ?? entry.image} alt={entry.name} className="absolute inset-0" />
        {entry.isBoss && (
          <span className="absolute left-2 top-2 -rotate-2 rounded border border-amber-300 bg-amber-400 px-2 py-0.5 font-serif text-[11px] uppercase tracking-wide text-gray-900 shadow-sm">
            Boss
          </span>
        )}

        {featuredCatch ? (
          <>
            <span className="absolute right-2 top-2 rotate-2 rounded border border-amber-300 bg-amber-400 px-2 py-0.5 font-serif text-[10px] uppercase tracking-wide text-gray-900 shadow-sm">
              První úlovek
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 pb-1.5 pt-6">
              <span
                title={`Rybář: ${featuredCatch.nickname}`}
                className="inline-block max-w-full -rotate-1 truncate rounded border border-amber-300/70 bg-[#e8cfa0] px-2 py-0.5 font-serif text-[11px] font-semibold text-[#0a2438] shadow-sm"
              >
                Rybář: {featuredCatch.nickname}
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 pb-2 pt-6 text-center">
            <span className="inline-block max-w-full -rotate-1 rounded border border-amber-300/70 bg-[#e8cfa0] px-2 py-1 font-serif text-[11px] leading-snug text-[#0a2438] shadow-sm">
              <span className="font-bold">Rybář:</span>{" "}
              <span className="font-normal text-[#0a2438]/70">Ještě nikdo nenahrál fotku úlovku</span>
            </span>
            <span className="inline-block rounded border border-amber-300 bg-amber-400 px-2.5 py-1 font-serif text-[11px] font-semibold uppercase tracking-wide text-gray-900 shadow-sm">
              Nahraj první úlovek
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 text-left">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-serif text-white group-hover:text-amber-300">
            {entry.name}
            {entry.czechName && (
              <span className="ml-1 font-sans font-normal text-cyan-100/60">
                ({entry.czechName})
              </span>
            )}
          </h2>
          <span className="shrink-0 rounded border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-cyan-100/70">
            {CATEGORY_LABEL[entry.category]}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-cyan-100/70">
          {entry.shortDescription}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-cyan-100/50">
          {entry.locations && <span>{entry.locations.join(", ")}</span>}
          {entry.rarity && <span>{entry.rarity}</span>}
          <VerificationBadge level={entry.verification} />
        </div>
      </div>
    </Link>
  );
}
