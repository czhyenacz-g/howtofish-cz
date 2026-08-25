"use client";

import { useMemo, useState } from "react";
import type { FishCategory, FishEntry } from "../../data/fish";
import type { CommunityCatch } from "../../lib/universal-content-api/types";
import FishCard from "../components/FishCard";

const FILTERS: { key: "all" | FishCategory; label: string }[] = [
  { key: "all", label: "Vše" },
  { key: "ryba", label: "Ryby" },
  { key: "tvor", label: "Ostatní tvorové" },
];

function normalize(value: string) {
  return value.toLocaleLowerCase("cs-CZ");
}

export default function FishBrowser({
  fish,
  featuredCatches = {},
}: {
  fish: FishEntry[];
  featuredCatches?: Record<string, CommunityCatch>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | FishCategory>("all");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return fish.filter((entry) => {
      if (filter !== "all" && entry.category !== filter) return false;
      if (!q) return true;
      return (
        normalize(entry.name).includes(q) ||
        (entry.czechName ? normalize(entry.czechName).includes(q) : false)
      );
    });
  }, [fish, query, filter]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Hledat rybu nebo tvora…"
        aria-label="Hledat rybu nebo tvora"
        className="mx-auto block w-full max-w-xl rounded-md border border-white/15 bg-[#0e3347]/60 px-4 py-2.5 text-sm text-white placeholder:text-cyan-100/40 focus:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      />

      <div className="mt-4 flex flex-wrap justify-center gap-2 font-serif">
        {FILTERS.map((f, i) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`rounded-md border px-4 py-1.5 text-sm transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
              i % 2 === 0 ? "rotate-[-0.5deg]" : "rotate-[0.5deg]"
            } ${
              filter === f.key
                ? "border-amber-300 bg-amber-400 text-gray-900 shadow-[0_2px_0_0_rgba(0,0,0,0.25)]"
                : "border-white/15 bg-white/10 text-cyan-100/80 hover:border-amber-400/50 hover:bg-white/20"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-cyan-100/60">
          Nic jsme nenašli. Zkus jiné hledání.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <FishCard key={entry.slug} entry={entry} featuredCatch={featuredCatches[entry.slug]} />
          ))}
        </div>
      )}
    </div>
  );
}
