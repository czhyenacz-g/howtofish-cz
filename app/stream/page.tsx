import type { Metadata } from "next";
import Link from "next/link";
import { getLiveStreams } from "../../lib/streams/get-live-streams";
import { creatorProfiles } from "../../data/creators";
import { pickPromotion } from "../../lib/promotions/match-route";
import { getActivePromotions } from "../../lib/universal-content-api/promotions";
import { SITE_URL } from "../config/site";
import { STREAM_FAQ } from "./faq";
import StreamBrowser, { PLATFORM_BADGE_CLASS, PLATFORM_LABEL } from "./StreamBrowser";

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

  // ItemList JSON-LD jen když je co nabídnout — prázdný seznam by byl
  // jen šum. FAQPage JSON-LD je naopak vždy přítomné (statický, evergreen
  // obsah, nezávislý na tom, jestli zrovna někdo streamuje).
  const itemListJsonLd =
    streams.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          url: `${SITE_URL}${PATHNAME}`,
          itemListElement: streams.map((stream, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: stream.streamUrl,
            name: `${stream.channelName} – ${stream.title}`,
          })),
        }
      : null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: STREAM_FAQ.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-12 text-white">
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-3xl sm:text-4xl">
            Kdo právě hraje How to Fish?
          </h1>
          <p className="mt-3 text-cyan-100/80">
            Živé streamy How to Fish z Twitch, YouTube a Kick na jednom místě.
          </p>
          <p className="mt-3 text-sm text-cyan-100/60">
            Tahle stránka sbírá na jedno místo živé přenosy hráčů{" "}
            <Link href="/o-hre" className="underline hover:text-amber-300">
              How to Fish
            </Link>{" "}
            — fyzikální rybářské hry, kde ztroskotáš na ostrově a musíš se naučit rybařit, abys přežil. Sledujeme
            Twitch, YouTube i Kick zároveň, takže nemusíš procházet každou platformu zvlášť.
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

        <section className="mx-auto mt-12 max-w-2xl border-t border-white/10 pt-8">
          <h2 className="font-serif text-xl text-amber-300">Časté otázky</h2>
          <div className="mt-4 space-y-5">
            {STREAM_FAQ.map((entry) => (
              <div key={entry.question}>
                <p className="font-semibold text-white">{entry.question}</p>
                <p className="mt-1 text-cyan-100/80">{entry.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {creatorProfiles.length > 0 && (
          <section className="mx-auto mt-12 max-w-4xl border-t border-white/10 pt-8">
            <h2 className="font-serif text-xl text-amber-300">Čeští tvůrci kolem How to Fish</h2>
            <p className="mt-2 text-sm text-cyan-100/70">
              Kdo hraje, hrál nebo se objevil u How to Fish v české a slovenské komunitě.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {creatorProfiles.map((creator) => {
                const platform = creator.videos[0]?.platform;
                return (
                  <li key={creator.slug}>
                    <Link
                      href={`/stream/${creator.slug}`}
                      className="group flex h-full flex-col gap-1.5 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:border-amber-400/40 hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-serif text-base text-white group-hover:text-amber-300">{creator.name}</span>
                        {platform && (
                          <span
                            className={`shrink-0 rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${PLATFORM_BADGE_CLASS[platform]}`}
                          >
                            {PLATFORM_LABEL[platform]}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-cyan-100/70">
                        {creator.bio ?? `CZ/SK tvůrce, který/á si zahrál/a How to Fish.`}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="mx-auto mt-12 max-w-2xl border-t border-white/10 pt-8 text-center">
          <h2 className="font-serif text-xl text-amber-300">Chceš hrát s ostatními?</h2>
          <p className="mt-2 text-sm text-cyan-100/70">
            Najdi spoluhráče na Multiplayer ostrově a zahraj si How to Fish společně.
          </p>
          <Link
            href="/multiplayer"
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 font-serif text-amber-300 transition hover:bg-amber-400/20"
          >
            🏝️ Multiplayer ostrov
          </Link>
        </section>
      </div>
    </div>
  );
}
