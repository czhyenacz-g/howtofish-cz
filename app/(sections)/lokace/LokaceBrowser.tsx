"use client";

import { useMemo, useState } from "react";
import type { LocationEntry } from "../../../lib/universal-content-api/types";
import AddCommunityRecordButton from "../../components/community/AddCommunityRecordButton";
import CommunityDataTable, { type CommunityColumn } from "../../components/community/CommunityDataTable";

function normalize(value: string) {
  return value.toLocaleLowerCase("cs-CZ");
}

const columns: CommunityColumn<LocationEntry>[] = [
  { key: "island", label: "Ostrov", render: (r) => r.island ?? "—" },
  { key: "notableThings", label: "Co tam najdeš", render: (r) => r.notableThings ?? "—" },
  { key: "note", label: "Poznámka", render: (r) => r.note ?? "—" },
];

export default function LokaceBrowser({ locations }: { locations: LocationEntry[] }) {
  const [query, setQuery] = useState("");
  const [islandFilter, setIslandFilter] = useState<string>("all");

  const islands = useMemo(() => {
    const set = new Set<string>();
    for (const loc of locations) if (loc.island) set.add(loc.island);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "cs"));
  }, [locations]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return locations.filter((loc) => {
      if (islandFilter !== "all" && loc.island !== islandFilter) return false;
      if (!q) return true;
      return normalize(loc.title).includes(q);
    });
  }, [locations, query, islandFilter]);

  return (
    <div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Hledat lokaci…"
          aria-label="Hledat lokaci"
          className="w-full max-w-sm rounded-md border border-white/15 bg-[#0e3347]/60 px-4 py-2.5 text-sm text-white placeholder:text-cyan-100/40 focus:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        />
        <AddCommunityRecordButton href="/lokace/navrhnout" label="Přidat novou lokaci" />
      </div>

      {islands.length > 1 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2 font-serif">
          <FilterButton active={islandFilter === "all"} onClick={() => setIslandFilter("all")} label="Vše" />
          {islands.map((island) => (
            <FilterButton key={island} active={islandFilter === island} onClick={() => setIslandFilter(island)} label={island} />
          ))}
        </div>
      )}

      <CommunityDataTable
        rows={filtered}
        columns={columns}
        cardSubtitle={(r) => [r.island, r.notableThings]}
        emptyMessage="Nic jsme nenašli. Zkus jiné hledání."
        correctionHref={(r) => `/lokace/navrhnout?correction=${encodeURIComponent(r.title)}`}
      />
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md border px-4 py-1.5 text-sm transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        active
          ? "border-amber-300 bg-amber-400 text-gray-900"
          : "border-white/15 bg-white/10 text-cyan-100/80 hover:border-amber-400/50 hover:bg-white/20"
      }`}
    >
      {label}
    </button>
  );
}
