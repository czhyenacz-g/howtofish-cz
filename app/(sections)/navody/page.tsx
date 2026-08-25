import type { Metadata } from "next";
import { getCurrentUser } from "../../../lib/auth/current-user";
import { getGuideEntries, getMyPendingGuides } from "../../../lib/universal-content-api/guides";
import AdPlaceholder from "../../components/AdPlaceholder";
import NavodyBrowser from "./NavodyBrowser";

export const metadata: Metadata = {
  title: "Návody",
  description: "České návody pro How to Fish — pro začátečníky i pokročilé, kurátorované i komunitní.",
};

export default async function NavodyPage() {
  const user = await getCurrentUser();

  const [guides, myPending] = await Promise.all([
    getGuideEntries().catch(() => []),
    user ? getMyPendingGuides(user.steamId).catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-white">
      <h1 className="font-serif text-3xl">Návody</h1>
      <p className="mt-3 text-cyan-100/70">
        Postupy pro How to Fish — od základů po souboje s bossy, psané námi i komunitou.
      </p>

      <div className="mt-6">
        <AdPlaceholder />
      </div>

      <div className="mt-8">
        <NavodyBrowser guides={[...guides, ...myPending]} />
      </div>
    </div>
  );
}
