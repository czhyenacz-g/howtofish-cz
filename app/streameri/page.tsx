import type { Metadata } from "next";
import { creatorProfiles } from "../../data/creators.ts";
import { getLiveStreams } from "../../lib/streams/get-live-streams.ts";
import { findLiveStreamForCreator } from "../../lib/creators/live-match.ts";
import { SITE_URL } from "../config/site.ts";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../components/Breadcrumbs.tsx";
import CreatorCard from "../components/CreatorCard.tsx";

const PATHNAME = "/streameri";
const TITLE = "Streameři, kteří hrají How to Fish – profily a videa | HowToFish.cz";
const DESCRIPTION = "Přehled českých a slovenských tvůrců, kteří hráli nebo streamovali How to Fish. Profily, videa a odkazy na Twitch, YouTube a Kick.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATHNAME },
  openGraph: { images: [{ url: `/api/og?title=${encodeURIComponent("Streameři How to Fish")}`, width: 1200, height: 630 }] },
};

// Stejný zdroj jako /stream a /streameri/[slug] (lib/streams/get-live-streams.ts)
// — LIVE tvůrci se zobrazí první (zadání bod 4), ostatní beze změny
// pořadí (creatorProfiles má stabilní pořadí, žádné náhodné řazení).
export const revalidate = 60;

export default async function StreameriPage() {
  const { streams } = await getLiveStreams();

  const withLive = creatorProfiles.map((creator) => ({ creator, liveStream: findLiveStreamForCreator(creator.name, streams) }));
  const sorted = [...withLive].sort((a, b) => Number(Boolean(b.liveStream)) - Number(Boolean(a.liveStream)));

  const breadcrumbItems = [{ label: "HowToFish.cz", href: "/" }, { label: "Streameři" }];
  const pageUrl = `${SITE_URL}${PATHNAME}`;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: pageUrl,
    itemListElement: creatorProfiles.map((creator, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/streameri/${creator.slug}`,
      name: creator.name,
    })),
  };

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-12 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems, SITE_URL, pageUrl)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <div className="mx-auto max-w-5xl">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mx-auto mt-4 max-w-2xl text-center">
          <h1 className="font-serif text-3xl sm:text-4xl">Streameři, kteří hrají How to Fish</h1>
          <p className="mt-3 text-cyan-100/80">Čeští a slovenští tvůrci, jejich videa, streamy a odkazy na Twitch, YouTube a Kick.</p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(({ creator, liveStream }) => (
            <li key={creator.slug}>
              <CreatorCard creator={creator} liveStream={liveStream} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
