"use client";

import { useMemo, useState } from "react";
import type { GuideEntry } from "../../../lib/universal-content-api/types";
import AddCommunityRecordButton from "../../components/community/AddCommunityRecordButton";
import CommunityDataTable, { type CommunityColumn } from "../../components/community/CommunityDataTable";

function normalize(value: string) {
  return value.toLocaleLowerCase("cs-CZ");
}

const columns: CommunityColumn<GuideEntry>[] = [
  { key: "category", label: "Kategorie", render: (r) => r.category ?? "—" },
  { key: "summary", label: "Krátký popis", render: (r) => r.summary ?? "—" },
];

export default function NavodyBrowser({ guides }: { guides: GuideEntry[] }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const guide of guides) if (guide.category) set.add(guide.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "cs"));
  }, [guides]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return guides.filter((guide) => {
      if (categoryFilter !== "all" && guide.category !== categoryFilter) return false;
      if (!q) return true;
      return normalize(guide.title).includes(q);
    });
  }, [guides, query, categoryFilter]);

  return (
    <div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Hledat návod…"
          aria-label="Hledat návod"
          className="w-full max-w-sm rounded-md border border-white/15 bg-[#0e3347]/60 px-4 py-2.5 text-sm text-white placeholder:text-cyan-100/40 focus:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        />
        <AddCommunityRecordButton href="/navody/navrhnout" label="Přidat nový návod" />
      </div>

      {categories.length > 1 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2 font-serif">
          <FilterButton active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} label="Vše" />
          {categories.map((category) => (
            <FilterButton key={category} active={categoryFilter === category} onClick={() => setCategoryFilter(category)} label={category} />
          ))}
        </div>
      )}

      <CommunityDataTable
        rows={filtered}
        columns={columns}
        cardSubtitle={(r) => [r.category, r.summary]}
        emptyMessage="Nic jsme nenašli. Zkus jiné hledání."
        linkHref={(r) => (r.pending ? undefined : `/navody/${r.slug}`)}
        correctionHref={(r) => `/navody/navrhnout?correction=${encodeURIComponent(r.title)}`}
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
