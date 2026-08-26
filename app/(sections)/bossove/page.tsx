import type { Metadata } from "next";
import { getCurrentUser } from "../../../lib/auth/current-user";
import { getBossEntries, getMyPendingBosses } from "../../../lib/universal-content-api/bosses";
import AdSlot from "../../components/AdSlot";
import BossoveBrowser from "./BossoveBrowser";

export const metadata: Metadata = {
  title: "Bossové",
  description: "Přehled bossů v How to Fish a taktiky na jejich poražení — kurátorovaný přehled i komunitní doplňky.",
};

export default async function BossovePage() {
  const user = await getCurrentUser();

  const [bosses, myPending] = await Promise.all([
    getBossEntries().catch(() => []),
    user ? getMyPendingBosses(user.steamId).catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-white">
      <h1 className="font-serif text-3xl">Bossové</h1>
      <p className="mt-3 text-cyan-100/70">
        Jak se na souboj připravit, jaké vybavení se hodí a jaké taktiky fungují nejlépe.
      </p>

      <div className="mt-6">
        <AdSlot pathname="/bossove" />
      </div>

      <div className="mt-8">
        <BossoveBrowser bosses={[...bosses, ...myPending]} />
      </div>
    </div>
  );
}
