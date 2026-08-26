import type { Metadata } from "next";
import { fishEntries } from "../../data/fish";
import { getCurrentUser } from "../../lib/auth/current-user";
import { getApprovedCatchCovers } from "../../lib/universal-content-api/catches";
import { getActivePromotionForRoute } from "../../lib/universal-content-api/promotions";
import { getMyPendingSuggestions } from "../../lib/universal-content-api/suggestions";
import FishBrowser from "./FishBrowser";

export const metadata: Metadata = {
  title: { absolute: "Ryby a úlovky – How to Fish CZ" },
  description:
    "Česká encyklopedie ryb, tvorů a úlovků ze hry How to Fish. Zjisti, kde je najít, jak je chytit a k čemu slouží.",
};

export default async function RybyPage() {
  const user = await getCurrentUser();

  // Jeden dávkový request na všechny featured úlovky (viz
  // getApprovedCatchCovers) — ne jeden request na rybu. Předává se
  // celý CommunityCatch (ne jen URL), ať FishCard může zobrazit i
  // nickname/badge, ne jen obrázek.
  const [covers, mySuggestions, bannerPromotion] = await Promise.all([
    getApprovedCatchCovers().catch(() => new Map()),
    // Server-side filtr podle steam_id ze session — nikdy se
    // nestahují cizí pending návrhy do browseru (viz suggestions.ts).
    user ? getMyPendingSuggestions(user.steamId).catch(() => []) : Promise.resolve([]),
    // FishBrowser je "use client" — banner promotion se vybírá tady
    // server-side (žádný seznam kandidátů do browseru) a předává už
    // hotová jako plain prop, viz AdSlot pro přímé Server Component použití.
    getActivePromotionForRoute("banner", "/ryby").catch(() => null),
  ]);
  const featuredCatches = Object.fromEntries(covers);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-16 text-white">
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full text-[#0c4a56]/70"
      >
        <polygon
          points="0,60 180,80 360,50 540,85 720,55 900,90 1080,50 1260,75 1440,55 1440,120 0,120"
          fill="currentColor"
        />
      </svg>

      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-3xl sm:text-4xl">Encyklopedie úlovků</h1>
          <p className="mt-3 text-cyan-100/80">
            Ryby, mořští tvorové a další věci, které můžeš ve hře How to Fish
            chytit.
          </p>
        </div>

        <div className="mt-10">
          <FishBrowser
            fish={fishEntries}
            featuredCatches={featuredCatches}
            suggestions={mySuggestions}
            bannerPromotion={bannerPromotion}
          />
        </div>
      </div>
    </div>
  );
}
