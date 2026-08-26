import type { Metadata } from "next";
import { getCurrentUser } from "../../../lib/auth/current-user";
import { getGuideEntries, getMyPendingGuides } from "../../../lib/universal-content-api/guides";
import AdSlot from "../../components/AdSlot";
import NavodyBrowser from "./NavodyBrowser";

const TITLE = "Návody";
const DESCRIPTION = "České návody pro How to Fish — pro začátečníky i pokročilé, kurátorované i komunitní.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/navody" },
  openGraph: { images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
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
        <AdSlot pathname="/navody" />
      </div>

      <div className="mt-8">
        <NavodyBrowser guides={[...guides, ...myPending]} />
      </div>
    </div>
  );
}
