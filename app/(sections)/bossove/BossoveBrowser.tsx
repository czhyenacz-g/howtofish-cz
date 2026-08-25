"use client";

import { useMemo, useState } from "react";
import type { BossEntry } from "../../../lib/universal-content-api/types";
import AddCommunityRecordButton from "../../components/community/AddCommunityRecordButton";
import CommunityDataTable, { type CommunityColumn } from "../../components/community/CommunityDataTable";

function normalize(value: string) {
  return value.toLocaleLowerCase("cs-CZ");
}

const columns: CommunityColumn<BossEntry>[] = [
  { key: "location", label: "Ostrov / lokace", render: (r) => r.location ?? "—" },
  { key: "howToFind", label: "Jak ho najít / vyvolat", render: (r) => r.howToFind ?? "—" },
  { key: "tip", label: "Tip", render: (r) => r.tip ?? "—" },
];

export default function BossoveBrowser({ bosses }: { bosses: BossEntry[] }) {
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const locationList = useMemo(() => {
    const set = new Set<string>();
    for (const boss of bosses) if (boss.location) set.add(boss.location);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "cs"));
  }, [bosses]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return bosses.filter((boss) => {
      if (locationFilter !== "all" && boss.location !== locationFilter) return false;
      if (!q) return true;
      return normalize(boss.title).includes(q);
    });
  }, [bosses, query, locationFilter]);

  return (
    <div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Hledat bosse…"
          aria-label="Hledat bosse"
          className="w-full max-w-sm rounded-md border border-white/15 bg-[#0e3347]/60 px-4 py-2.5 text-sm text-white placeholder:text-cyan-100/40 focus:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        />
        <AddCommunityRecordButton href="/bossove/navrhnout" label="Přidat nového bosse" />
      </div>

      {locationList.length > 1 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2 font-serif">
          <FilterButton active={locationFilter === "all"} onClick={() => setLocationFilter("all")} label="Vše" />
          {locationList.map((loc) => (
            <FilterButton key={loc} active={locationFilter === loc} onClick={() => setLocationFilter(loc)} label={loc} />
          ))}
        </div>
      )}

      <CommunityDataTable
        rows={filtered}
        columns={columns}
        cardSubtitle={(r) => [r.location, r.tip]}
        emptyMessage="Nic jsme nenašli. Zkus jiné hledání."
        linkHref={(r) => r.detailHref}
        correctionHref={(r) => `/bossove/navrhnout?correction=${encodeURIComponent(r.title)}`}
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
