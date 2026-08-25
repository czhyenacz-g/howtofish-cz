import type { SteamAchievement } from "../../../lib/steam/achievements";
import { getAchievementRarity } from "./achievement-utils";
import AchievementIconImage from "./AchievementIconImage";

function formatPercent(value: number): string {
  return `${value.toLocaleString("cs-CZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} % hráčů`;
}

export default function AchievementCard({ achievement }: { achievement: SteamAchievement }) {
  const rarity = getAchievementRarity(achievement);

  return (
    <div className="flex gap-4 rounded-lg border border-white/10 bg-[#0e3347]/60 p-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-amber-400/30 bg-black/20">
        <AchievementIconImage src={achievement.iconUrl} />
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="font-serif text-white">
          {achievement.nameCs ?? achievement.name}
          {achievement.nameCs && (
            <span className="ml-1.5 font-sans text-sm font-normal text-cyan-100/40">({achievement.name})</span>
          )}
        </h2>
        {(achievement.descriptionCs ?? achievement.description) && (
          <p className="mt-1 text-sm text-cyan-100/70">
            {achievement.descriptionCs ?? achievement.description}
            {achievement.descriptionCs && achievement.description && (
              <span className="ml-1.5 text-cyan-100/40">({achievement.description})</span>
            )}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {achievement.globalPercent !== undefined && (
            <span className="text-cyan-100/60">{formatPercent(achievement.globalPercent)}</span>
          )}
          {rarity === "rare" && (
            <span className="rounded border border-amber-300/60 bg-amber-400/10 px-2 py-0.5 font-serif uppercase tracking-wide text-amber-300">
              Vzácný achievement
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
