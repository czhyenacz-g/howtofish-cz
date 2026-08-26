import type { Metadata } from "next";
import { getLiveStreams } from "../../lib/streams/get-live-streams";
import { getActivePromotionForRoute } from "../../lib/universal-content-api/promotions";
import StreamBrowser from "./StreamBrowser";

export const metadata: Metadata = {
  title: "Kdo právě hraje How to Fish?",
  description: "Živé streamy How to Fish z Twitch, YouTube a Kick na jednom místě.",
};

// Stránka je ISR cachovaná stejně jako jednotlivé fetch() v provider
// modulech — data se pro všechny návštěvníky dohromady obnoví nejvýš
// jednou za 60 sekund, ne při každém requestu.
export const revalidate = 60;

export default async function StreamPage() {
  const [{ streams, totalViewers, failedPlatforms, updatedAt }, bannerPromotion] = await Promise.all([
    getLiveStreams(),
    getActivePromotionForRoute("banner", "/stream").catch(() => null),
  ]);

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
          bannerPromotion={bannerPromotion}
        />
      </div>
    </div>
  );
}
