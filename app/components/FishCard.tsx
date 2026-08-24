import Link from "next/link";
import type { FishEntry } from "../../data/fish";
import FishImage from "./FishImage";

const CATEGORY_LABEL: Record<FishEntry["category"], string> = {
  ryba: "Ryba",
  tvor: "Tvor",
};

export default function FishCard({ entry }: { entry: FishEntry }) {
  return (
    <Link
      href={`/ryby/${entry.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0e3347]/60 transition hover:border-amber-400/60 hover:bg-[#0e3347]"
    >
      <div className="relative aspect-[4/3] w-full">
        <FishImage image={entry.image} alt={entry.name} className="absolute inset-0" />
        {entry.isBoss && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-gray-900">
            Boss
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 text-left">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-bold text-white group-hover:text-amber-300">
            {entry.name}
            {entry.czechName && (
              <span className="ml-1 font-normal text-cyan-100/60">
                ({entry.czechName})
              </span>
            )}
          </h2>
          <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-cyan-100/70">
            {CATEGORY_LABEL[entry.category]}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-cyan-100/70">
          {entry.shortDescription}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-cyan-100/50">
          {entry.locations && <span>{entry.locations.join(", ")}</span>}
          {entry.rarity && <span>{entry.rarity}</span>}
          <span className={entry.verified ? "text-emerald-400" : "text-amber-300"}>
            {entry.verified ? "Ověřeno" : "Komunitní info"}
          </span>
        </div>
      </div>
    </Link>
  );
}
