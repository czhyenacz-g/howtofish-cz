import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "../../../lib/auth/current-user";
import { getActivePresences } from "../../../lib/universal-content-api/presence";
import { getIncomingWaves } from "../../../lib/universal-content-api/waves";
import OceanWaves from "../../components/OceanWaves";
import MultiplayerBoard from "./MultiplayerBoard";

const TITLE = "Multiplayer How to Fish – najdi spoluhráče";
const DESCRIPTION = "Najdi další hráče How to Fish, ukaž že hledáš spoluhráče a spojte se přes Steam.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/multiplayer" },
  openGraph: { images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
};

const UNAVAILABLE_MESSAGE = "Multiplayer ostrov je teď chvíli nedostupný. Zkus to prosím později.";

function Hero({ activeCount, children }: { activeCount: number | null; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#f3dfb0] via-[#e8cfa0] to-[#0e4f66] px-4 pb-20 pt-16 text-[#0a2438]">
      <div className="relative mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-3xl sm:text-4xl">Multiplayer ostrov</h1>
        <p className="mt-2 font-serif text-lg text-[#0a2438]/80">Najdi další hráče How to Fish</p>
        <p className="mx-auto mt-4 max-w-xl text-sm text-[#0a2438]/70">
          Hledáš někoho na společné rybaření? Přihlas se přes Steam, dej ostatním vědět, že hledáš spoluhráče, a
          přidejte se navzájem mezi přátele.
        </p>
        {activeCount !== null && (
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#0a2438]/20 bg-white/40 px-4 py-1.5 font-serif text-sm text-[#0a2438]">
            Právě hledají spoluhráče: <strong>{activeCount}</strong> {activeCount === 1 ? "hráč" : "hráčů"}
          </p>
        )}
      </div>
      <div className="relative mx-auto mt-8 max-w-3xl">{children}</div>
      <OceanWaves className="absolute inset-x-0 bottom-0 h-16 w-full sm:h-24" />
    </div>
  );
}

// Anonymní siluety — čistě dekorativní, žádné reálné hráčské údaje
// (viz privátnost níže). Jen "prázdná lehátka" na pláži.
function AnonymousBeach() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="flex flex-col items-center gap-2 rounded-lg border border-[#0a2438]/15 bg-white/25 p-4"
        >
          <div className="h-12 w-12 rounded-full bg-[#0a2438]/15" />
          <div className="h-2 w-16 rounded-full bg-[#0a2438]/15" />
        </div>
      ))}
    </div>
  );
}

export default async function MultiplayerPage() {
  const user = await getCurrentUser();

  if (!user) {
    let activeCount: number | null = null;
    try {
      // Anonym smí dostat jen počet — pole s jednotlivými hráči (nick,
      // avatar, Steam profil) se sem nikdy nedostane, viz zadání.
      activeCount = (await getActivePresences()).length;
    } catch (error) {
      console.error("Multiplayer: načtení počtu aktivních hráčů selhalo:", error instanceof Error ? error.message : error);
    }

    return (
      <Hero activeCount={activeCount}>
        <AnonymousBeach />
        <div className="mt-8 text-center">
          <Link
            href="/api/auth/steam/login?returnTo=/multiplayer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-amber-500 px-8 py-3 font-serif text-base text-gray-900 shadow-lg shadow-amber-900/20 transition hover:bg-amber-400"
          >
            Přihlásit přes Steam
          </Link>
          <p className="mx-auto mt-4 max-w-sm text-sm text-[#0a2438]/70">
            Po přihlášení uvidíš, kdo je právě na ostrově, a můžeš se také přidat.
          </p>
        </div>
      </Hero>
    );
  }

  try {
    const [presences, incomingWaves] = await Promise.all([getActivePresences(), getIncomingWaves(user.steamId)]);

    return (
      <>
        <Hero activeCount={presences.length}>
          <p className="text-center text-sm text-[#0a2438]/70">Přihlášen jako {user.nickname}</p>
        </Hero>
        <MultiplayerBoard
          currentUser={{ steamId: user.steamId, nickname: user.nickname, avatarUrl: user.avatarUrl }}
          initialPresences={presences}
          initialIncomingWaves={incomingWaves}
        />
      </>
    );
  } catch (error) {
    console.error("Multiplayer: načtení stránky selhalo:", error instanceof Error ? error.message : error);
    return (
      <Hero activeCount={null}>
        <p className="text-center text-[#0a2438]/80">{UNAVAILABLE_MESSAGE}</p>
      </Hero>
    );
  }
}
