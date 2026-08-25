"use client";

import { useMemo, useState } from "react";
import type { SteamAchievement } from "../../../lib/steam/achievements";
import AchievementCard from "./AchievementCard";
import { getAchievementRarity, sortByRarest } from "./achievement-utils";

const FILTERS: { key: "all" | "common" | "rare"; label: string }[] = [
  { key: "all", label: "Vše" },
  { key: "common", label: "Běžné" },
  { key: "rare", label: "Vzácné" },
];

export default function AchievementBrowser({ achievements }: { achievements: SteamAchievement[] }) {
  const [filter, setFilter] = useState<"all" | "common" | "rare">("all");

  // Řazení od nejvzácnějšího — vypadá to zajímavěji jako první dojem
  // (ukáže nejimpozantnější achievementy hned nahoře) a je to běžný
  // výchozí pohled u achievement trackerů (SteamDB apod.).
  const sorted = useMemo(() => sortByRarest(achievements), [achievements]);

  const filtered = useMemo(() => {
    if (filter === "all") return sorted;
    return sorted.filter((a) => getAchievementRarity(a) === filter);
  }, [sorted, filter]);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 font-serif">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`rounded-md border px-4 py-1.5 text-sm transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
              filter === f.key
                ? "border-amber-300 bg-amber-400 text-gray-900 shadow-[0_2px_0_0_rgba(0,0,0,0.25)]"
                : "border-white/15 bg-white/10 text-cyan-100/80 hover:border-amber-400/50 hover:bg-white/20"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((achievement) => (
          <AchievementCard key={achievement.apiName} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
