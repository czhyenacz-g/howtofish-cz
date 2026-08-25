"use client";

import { useMemo, useState } from "react";
import type { ItemEntry } from "../../../lib/universal-content-api/types";
import AddCommunityRecordButton from "../../components/community/AddCommunityRecordButton";
import CommunityDataTable, { type CommunityColumn } from "../../components/community/CommunityDataTable";

function normalize(value: string) {
  return value.toLocaleLowerCase("cs-CZ");
}

const columns: CommunityColumn<ItemEntry>[] = [
  { key: "itemType", label: "Typ", render: (r) => r.itemType ?? "—" },
  { key: "obtainedAt", label: "Kde získat", render: (r) => r.obtainedAt ?? "—" },
  { key: "use", label: "K čemu slouží", render: (r) => r.use ?? "—" },
];

export default function PredmetyBrowser({ items }: { items: ItemEntry[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const types = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) if (item.itemType) set.add(item.itemType);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "cs"));
  }, [items]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return items.filter((item) => {
      if (typeFilter !== "all" && item.itemType !== typeFilter) return false;
      if (!q) return true;
      return normalize(item.title).includes(q);
    });
  }, [items, query, typeFilter]);

  return (
    <div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Hledat předmět…"
          aria-label="Hledat předmět"
          className="w-full max-w-sm rounded-md border border-white/15 bg-[#0e3347]/60 px-4 py-2.5 text-sm text-white placeholder:text-cyan-100/40 focus:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        />
        <AddCommunityRecordButton href="/predmety/navrhnout" label="Přidat nový předmět" />
      </div>

      {types.length > 1 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2 font-serif">
          <FilterButton active={typeFilter === "all"} onClick={() => setTypeFilter("all")} label="Vše" />
          {types.map((type) => (
            <FilterButton key={type} active={typeFilter === type} onClick={() => setTypeFilter(type)} label={type} />
          ))}
        </div>
      )}

      <CommunityDataTable
        rows={filtered}
        columns={columns}
        cardSubtitle={(r) => [r.itemType, r.obtainedAt]}
        emptyMessage="Nic jsme nenašli. Zkus jiné hledání."
        correctionHref={(r) => `/predmety/navrhnout?correction=${encodeURIComponent(r.title)}`}
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
      className={`rounded-md border px-4 py-1.5 text-sm capitalize transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        active
          ? "border-amber-300 bg-amber-400 text-gray-900"
          : "border-white/15 bg-white/10 text-cyan-100/80 hover:border-amber-400/50 hover:bg-white/20"
      }`}
    >
      {label}
    </button>
  );
}
