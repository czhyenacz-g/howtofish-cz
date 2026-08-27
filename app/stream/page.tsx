import type { Metadata } from "next";
import { getLiveStreams } from "../../lib/streams/get-live-streams";
import { pickPromotion } from "../../lib/promotions/match-route";
import { getActivePromotions } from "../../lib/universal-content-api/promotions";
import StreamBrowser from "./StreamBrowser";

const PATHNAME = "/stream";

const TITLE = "Kdo právě hraje How to Fish?";
const DESCRIPTION = "Živé streamy How to Fish z Twitch, YouTube a Kick na jednom místě.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/stream" },
  openGraph: { images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
};

// Stránka je ISR cachovaná stejně jako jednotlivé fetch() v provider
// modulech — data se pro všechny návštěvníky dohromady obnoví nejvýš
// jednou za 60 sekund, ne při každém requestu.
export const revalidate = 60;

export default async function StreamPage() {
  const [{ streams, totalViewers, failedPlatforms, updatedAt }, bannerCandidates] = await Promise.all([
    getLiveStreams(),
    // Malý veřejný seznam aktivních banner promotions (bez UCA tokenu) —
    // StreamBrowser je "use client" a přes AffiliateBannerSlot dořeší
    // 7denní "už jsem klikl" vyřazení z localStorage (viz
    // lib/promotions/clicked-promotions.ts), které server nevidí.
    getActivePromotions("banner").catch(() => []),
  ]);
  const bannerInitialPick = pickPromotion(bannerCandidates, PATHNAME);

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-3xl sm:text-4xl">
            Kdo právě hraje How to Fish?
          </h1>
          <p className="mt-3 text-cyan-100/80">
            Živé streamy How to Fish z Twitch, YouTube a Kick na jednom místě.
          </p>
        </div>

        <StreamBrowser
          streams={streams}
          totalViewers={totalViewers}
          failedPlatforms={failedPlatforms}
          updatedAt={updatedAt}
          bannerCandidates={bannerCandidates}
          bannerInitialPick={bannerInitialPick}
        />
      </div>
    </div>
  );
}
