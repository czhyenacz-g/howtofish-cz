import type { Metadata } from "next";
import { getSteamAchievements } from "../../../lib/steam/achievements";
import AdPlaceholder from "../../components/AdPlaceholder";
import AchievementBrowser from "./AchievementBrowser";

export const metadata: Metadata = {
  title: "Achievementy",
  description: "Seznam achievementů v How to Fish a jak je splnit.",
};

export default async function AchievementyPage() {
  const achievements = await getSteamAchievements();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-3xl">Achievementy</h1>
      <p className="mt-3 text-gray-400">
        Achievementy How to Fish přímo ze Steamu — řazené od nejvzácnějšího po nejběžnější.
      </p>

      <div className="mt-6">
        <AdPlaceholder />
      </div>

      {!achievements || achievements.length === 0 ? (
        <div className="mt-10 rounded-lg border border-white/10 bg-[#0e3347]/60 p-6 text-center text-gray-400">
          <p>Achievementy ze Steamu zatím nejsou veřejně dostupné.</p>
        </div>
      ) : (
        <div className="mt-10">
          <AchievementBrowser achievements={achievements} />
        </div>
      )}
    </div>
  );
}
