import type { Metadata } from "next";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FeedbackCallout from "./components/FeedbackCallout";
import AdSlot from "./components/AdSlot";
import CreatorCard from "./components/CreatorCard.tsx";
import HowToFishVideoCard from "./components/HowToFishVideoCard.tsx";
import OceanWaves from "./components/OceanWaves";
import { CrabIcon, FishIcon, GuideIcon, ItemIcon, LocationIcon, AchievementIcon, BossIcon, MultiplayerIcon } from "./components/icons";
import { getCurrentUser } from "../lib/auth/current-user";
import { creatorProfiles } from "../data/creators.ts";
import { howToFishVideos } from "../data/how-to-fish-videos.ts";
import { getLiveStreams } from "../lib/streams/get-live-streams.ts";
import { findLiveStreamForCreator } from "../lib/creators/live-match.ts";

const TITLE = "Streameři, kteří hrají How to Fish | HowToFish.cz";
const DESCRIPTION = "Sleduj CZ/SK streamery, jejich videa, živé streamy a obsah kolem How to Fish. Plus Krabí invaze, Multiplayer ostrov a kompletní encyklopedie hry.";

// Homepage má teď vlastní unikátní obsah (streameři/live), ne duplicitu
// s /ryby — vlastní canonical na "/" (viz app/sitemap.ts, app/ryby/page.tsx).
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { images: [{ url: `/api/og?title=${encodeURIComponent("How to Fish CZ")}&sub=${encodeURIComponent("Streameři, live a Krabí invaze")}`, width: 1200, height: 630 }] },
};

// Stejný zdroj jako /stream a /streameri (lib/streams/get-live-streams.ts)
// — žádná druhá LIVE integrace.
export const revalidate = 60;

const WORLD_CARDS = [
  { href: "/ryby", label: "Ryby", icon: FishIcon },
  { href: "/predmety", label: "Předměty", icon: ItemIcon },
  { href: "/navody", label: "Návody", icon: GuideIcon },
  { href: "/lokace", label: "Lokace", icon: LocationIcon },
  { href: "/bossove", label: "Bossové", icon: BossIcon },
  { href: "/achievementy", label: "Achievementy", icon: AchievementIcon },
];

// Kolik tvůrců se zobrazí v homepage sekci B — zadání chce "4-6
// nejvýznamnějších/aktuálně relevantních". Bez ručně vymyšlené "featured"
// vlajky (tu bychom museli u někoho subjektivně přiřadit bez opory v
// datech) je nejčistší objektivní kritérium "má aspoň jedno doložené
// video" — přesně tvůrci z data/creator-videos.ts. LIVE tvůrci mají vždy
// přednost před tímhle výběrem, viz níže.
const HOMEPAGE_CREATOR_LIMIT = 6;

export default async function Home() {
  const user = await getCurrentUser();
  const { streams } = await getLiveStreams();

  const withLive = creatorProfiles.map((creator) => ({ creator, liveStream: findLiveStreamForCreator(creator.name, streams) }));
  const liveCreators = withLive.filter((c) => c.liveStream);
  const contentCreators = withLive.filter((c) => !c.liveStream && c.creator.videos.length > 0);
  const homepageCreators = [...liveCreators, ...contentCreators].slice(0, HOMEPAGE_CREATOR_LIMIT);

  const recentVideos = [...howToFishVideos].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">
        {/* A) HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0e3347] via-[#0a2438] to-[#146b78] px-4 pb-20 pt-14 text-center text-white sm:pt-20">
          <div className="relative mx-auto max-w-2xl">
            <h1 className="font-serif text-3xl sm:text-5xl">Streameři, kteří hrají How to Fish</h1>
            <p className="mx-auto mt-4 max-w-xl text-cyan-100/80 sm:text-lg">
              Sleduj CZ/SK streamery, jejich videa, živé streamy a obsah kolem How to Fish — na jednom místě.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/streameri" className="min-h-[44px] rounded-full bg-amber-400 px-5 py-2.5 font-serif text-gray-900 transition hover:bg-amber-300">
                Zobrazit streamery
              </Link>
              <Link href="/stream" className="min-h-[44px] rounded-full border border-white/20 bg-white/5 px-5 py-2.5 font-serif text-white transition hover:border-amber-300/60 hover:text-amber-200">
                Kdo je právě živě
              </Link>
            </div>
          </div>
          <OceanWaves className="absolute inset-x-0 bottom-0 h-14 w-full sm:h-20" />
        </section>

        {/* B) STREAMEŘI */}
        {homepageCreators.length > 0 && (
          <section className="bg-[#0a2438] px-4 py-12 text-white">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center font-serif text-2xl text-amber-300">Streameři kolem How to Fish</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {homepageCreators.map(({ creator, liveStream }) => (
                  <li key={creator.slug}>
                    <CreatorCard creator={creator} liveStream={liveStream} />
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-center">
                <Link href="/streameri" className="font-serif text-amber-300 underline hover:text-amber-200">
                  Všichni streameři →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* C) PRÁVĚ ŽIVĚ */}
        <section className="bg-[#081c2c] px-4 py-12 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-2xl text-amber-300">Kdo právě hraje How to Fish</h2>
            {streams.length > 0 ? (
              <>
                <p className="mt-2 text-cyan-100/70">
                  Právě živě: {streams.length} {streams.length === 1 ? "stream" : "streamů"} na Twitchi, YouTube a Kicku.
                </p>
                <div className="mt-6">
                  <Link href="/stream" className="inline-flex min-h-[44px] items-center rounded-full bg-amber-400 px-5 py-2.5 font-serif text-gray-900 transition hover:bg-amber-300">
                    Sledovat živě →
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-cyan-100/70">Teď zrovna nikdo How to Fish nestreamuje. Mrkni na poslední videa níž, nebo zkus stránku Živě později.</p>
                <div className="mt-6">
                  <Link href="/stream" className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 font-serif text-white transition hover:border-amber-300/60 hover:text-amber-200">
                    Otevřít Živě →
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* D) NEJNOVĚJŠÍ VIDEA / ZÁZNAMY */}
        {recentVideos.length > 0 && (
          <section className="bg-[#0a2438] px-4 py-12 text-white">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-center font-serif text-2xl text-amber-300">Nejnovější How to Fish videa</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {recentVideos.map((video) => (
                  <HowToFishVideoCard key={video.slug} video={video} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* AD) REKLAMNÍ BANNER — stejný AdSlot jako jinde (UCA promotions,
            placement "banner"), uprostřed obsahu mezi videi a Krabí invazí. */}
        <section className="bg-[#081c2c] px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <AdSlot pathname="/" />
          </div>
        </section>

        {/* E) KRABÍ INVAZE */}
        <section className="bg-gradient-to-r from-[#b8402c] to-[#7a2a1c] px-4 py-14 text-center text-white">
          <div className="mx-auto max-w-xl">
            <CrabIcon className="mx-auto h-10 w-10 text-amber-200" />
            <h2 className="mt-3 font-serif text-2xl sm:text-3xl">Krabí invaze</h2>
            <p className="mt-2 text-white/85">Rychlá arkádová minihra na chvilku mezi streamy — uteč krabům a zapiš se do žebříčku.</p>
            <Link href="/hra" className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-amber-400 px-6 py-2.5 font-serif text-gray-900 transition hover:bg-amber-300">
              Hrát →
            </Link>
          </div>
        </section>

        {/* F) MULTIPLAYER OSTROV */}
        <section className="bg-[#0e3347] px-4 py-10 text-center text-white">
          <div className="mx-auto max-w-xl">
            <MultiplayerIcon className="mx-auto h-8 w-8 text-cyan-200" />
            <h2 className="mt-2 font-serif text-xl">Multiplayer ostrov</h2>
            <p className="mt-1.5 text-sm text-cyan-100/70">Komunitní funkce — najdi spoluhráče na How to Fish přes Steam.</p>
            <Link href="/multiplayer" className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 font-serif text-sm text-amber-300 transition hover:bg-amber-400/20">
              🏝️ Najít spoluhráče
            </Link>
          </div>
        </section>

        {/* G) SVĚT HOW TO FISH */}
        <section className="bg-[#081c2c] px-4 py-12 text-white">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-serif text-2xl text-amber-300">Objev svět How to Fish</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-cyan-100/70">
              Kompletní česká encyklopedie hry — ryby, předměty, návody, lokace, bossové a achievementy.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {WORLD_CARDS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-center transition hover:border-amber-400/40 hover:bg-white/10"
                  >
                    <Icon className="h-6 w-6 text-amber-300" />
                    <span className="font-serif text-sm text-white">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* H) O HŘE */}
        <section className="bg-[#0a2438] px-4 py-12 text-center text-white">
          <div className="mx-auto max-w-lg">
            <h2 className="font-serif text-xl text-amber-300">Co je How to Fish?</h2>
            <p className="mt-2 text-sm text-cyan-100/70">
              Fyzikální rybářská hra na Steamu, kde ztroskotáš na ostrově a musíš se naučit rybařit, abys přežil.
            </p>
            <Link href="/o-hre" className="mt-4 inline-block font-serif text-amber-300 underline hover:text-amber-200">
              Více o How to Fish →
            </Link>
          </div>
        </section>
      </main>
      <FeedbackCallout user={user ? { nickname: user.nickname } : null} />
      <Footer />
    </div>
  );
}
