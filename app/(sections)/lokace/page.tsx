import type { Metadata } from "next";
import { getCurrentUser } from "../../../lib/auth/current-user";
import { getLocationEntries, getMyPendingLocations } from "../../../lib/universal-content-api/locations";
import AdPlaceholder from "../../components/AdPlaceholder";
import LokaceBrowser from "./LokaceBrowser";

export const metadata: Metadata = {
  title: "Lokace",
  description: "Mapy a popisy lovišť v How to Fish — kurátorovaný přehled i komunitní doplňky.",
};

export default async function LokacePage() {
  const user = await getCurrentUser();

  const [locations, myPending] = await Promise.all([
    getLocationEntries().catch(() => []),
    user ? getMyPendingLocations(user.steamId).catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-white">
      <h1 className="font-serif text-3xl">Lokace</h1>
      <p className="mt-3 text-cyan-100/70">
        Co v jednotlivých lokacích chytíte, na co si dát pozor a jak se do nich dostanete.
      </p>

      <div className="mt-6">
        <AdPlaceholder />
      </div>

      <div className="mt-8">
        <LokaceBrowser locations={[...locations, ...myPending]} />
      </div>
    </div>
  );
}
