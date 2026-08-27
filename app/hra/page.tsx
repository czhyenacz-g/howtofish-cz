import type { Metadata } from "next";
import { getCurrentUser } from "../../lib/auth/current-user";
import { getLeaderboard } from "../../lib/universal-content-api/scores";
import AdSlot from "../components/AdSlot";
import CrabRushGame from "./CrabRushGame";
import Leaderboard from "./Leaderboard";
import { GAME_SLUG } from "./evaluate-score-submission";

const TITLE = "Krabí invaze";
const DESCRIPTION = "Rychlá arkádová minihra Krabí invaze — zastav kraby dřív, než utečou do moře, a dostaň se do žebříčku.";
// Lidská výzva pro OG/social náhled — schválně jiná než informativní
// SEO DESCRIPTION výš (viz zadání). openGraph.description tenhle text
// přebije jen pro OG; obyčejný <meta name="description"> zůstává
// DESCRIPTION, protože openGraph objekt níž vlastní `description`
// nastavuje explicitně (jinak by se automaticky doplnil ze stránkového
// `description`, viz komentář v app/layout.tsx). Twitter card metadata
// (root layout, jen `card: "summary_large_image"`) nemá vlastní
// title/description, takže dál padá zpět na openGraph — stejný text.
const CHALLENGE_MESSAGE = "Dá si někdo se mnou soutěž v mlácení krabů? 🦀";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/hra" },
  openGraph: {
    description: CHALLENGE_MESSAGE,
    images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }],
  },
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
        {/* Lidská výzva, ne další nadpis — proto <p>, ne <h2> (viz zadání). */}
        <p className="mx-auto mt-5 inline-flex max-w-fit items-center gap-2 rounded-full border-2 border-[#3a2a1a] bg-amber-400 px-4 py-2 font-serif text-sm text-gray-900 shadow-md sm:text-base">
          <span aria-hidden="true">🦀</span> Dá si někdo se mnou soutěž v mlácení krabů?
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <Leaderboard entries={leaderboard} />
        <div className="mt-8">
          <AdSlot pathname="/hra" />
        </div>
        <div className="mt-8">
          <CrabRushGame user={user} />
        </div>
      </div>
    </div>
  );
}
