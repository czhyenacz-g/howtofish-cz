import type { Metadata } from "next";
import { getCurrentUser } from "../../../lib/auth/current-user";
import { getItemEntries, getMyPendingItems } from "../../../lib/universal-content-api/items";
import AdSlot from "../../components/AdSlot";
import PredmetyBrowser from "./PredmetyBrowser";

const TITLE = "Předměty";
const DESCRIPTION = "Vybavení, návnady a upgrady v How to Fish — kurátorovaný přehled i komunitní doplňky.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/predmety" },
  openGraph: { images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
};

export default async function PredmetyPage() {
  const user = await getCurrentUser();

  const [items, myPending] = await Promise.all([
    getItemEntries().catch(() => []),
    user ? getMyPendingItems(user.steamId).catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-white">
      <h1 className="font-serif text-3xl">Předměty</h1>
      <p className="mt-3 text-cyan-100/70">
        Vybavení, návnady a upgrady v How to Fish — základ tvoříme my, komunita ho může doplňovat.
      </p>

      <div className="mt-6">
        <AdSlot pathname="/predmety" />
      </div>

      <div className="mt-8">
        <PredmetyBrowser items={[...items, ...myPending]} />
      </div>
    </div>
  );
}
