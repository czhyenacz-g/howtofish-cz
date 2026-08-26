import type { Metadata } from "next";
import { getCurrentUser } from "../../lib/auth/current-user";
import { getLeaderboard } from "../../lib/universal-content-api/scores";
import AdSlot from "../components/AdSlot";
import CrabRushGame from "./CrabRushGame";
import Leaderboard from "./Leaderboard";
import { GAME_SLUG } from "./evaluate-score-submission";

const TITLE = "Krabí invaze";
const DESCRIPTION = "Rychlá arkádová minihra Krabí invaze — zastav kraby dřív, než utečou do moře, a dostaň se do žebříčku.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/hra" },
  openGraph: { images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
};

export default async function HraPage() {
  const [user, leaderboard] = await Promise.all([
    getCurrentUser(),
    // Výpadek Universal Content API nesmí shodit stránku — prázdný
    // žebříček je v pořádku, raw chyba návštěvníkovi ne.
    getLeaderboard(GAME_SLUG).catch(() => []),
  ]);

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-serif text-3xl sm:text-4xl">Krabí invaze</h1>
        <p className="mt-3 text-cyan-100/80">
          Krabi utíkají přes pláž do moře — přesnými klepnutími je zastav dřív, než uniknou.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <CrabRushGame user={user} />
        <div className="mt-8">
          <AdSlot pathname="/hra" />
        </div>
        <Leaderboard entries={leaderboard} />
      </div>
    </div>
  );
}
