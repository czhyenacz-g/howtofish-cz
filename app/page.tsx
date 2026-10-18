import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FeedbackCallout from "./components/FeedbackCallout";
import AdSlot from "./components/AdSlot";
import CreatorCard from "./components/CreatorCard.tsx";
import GameCard from "./components/GameCard.tsx";
import GameVideoCard from "./components/GameVideoCard.tsx";
import OceanWaves from "./components/OceanWaves";
import RotatingQuote from "./components/RotatingQuote.tsx";
import { FishIcon, GuideIcon, ItemIcon, LocationIcon, AchievementIcon, BossIcon } from "./components/icons";
import { getCurrentUser } from "../lib/auth/current-user";
import { creatorProfiles } from "../data/creators.ts";
import { getGameBySlug, getGameQuotes, getGamesWithGameDetailPage, gameEntries } from "../data/games.ts";
import { getHomepageGameVideos } from "../lib/games/game-videos.ts";
import { getLiveStreams } from "../lib/streams/get-live-streams.ts";
import { findLiveStreamForCreator } from "../lib/creators/live-match.ts";

// Homepage = rozcestník celého webu (režim minimální údržby, říjen 2026):
// hero → hry s vlastní stránkou → původní How to Fish → videa → streameři
// a živé vysílání. Krabí invaze je odkázaná z patičky.
// Vlastní canonical na "/" (viz app/sitemap.ts, app/ryby/page.tsx).
const TITLE = "HowToFish.cz – rybaření ve hrách";
const DESCRIPTION = "Web o hrách, ve kterých se dá rybařit. Minecraft, Stardew Valley, Pokémon, Sea of Thieves a další.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: `/api/og?title=${encodeURIComponent("Rybaření ve hrách")}&sub=${encodeURIComponent("HowToFish.cz")}`, width: 1200, height: 630 }],
  },
};

// Stejný zdroj jako /stream a /streameri (lib/streams/get-live-streams.ts)
// — žádná druhá LIVE integrace.
export const revalidate = 60;

// Kolik her s vlastním detailem se ukazuje v sekci Hry (zbytek je na
// /hry-s-rybarenim) a kolik tvůrců v sekci Streameři.
const HOMEPAGE_GAME_LIMIT = 12;
const HOMEPAGE_CREATOR_LIMIT = 6;

const WORLD_CARDS = [
  { href: "/ryby", label: "Ryby", icon: FishIcon },
  { href: "/navody", label: "Návody", icon: GuideIcon },
  { href: "/predmety", label: "Předměty", icon: ItemIcon },
  { href: "/bossove", label: "Bossové", icon: BossIcon },
  { href: "/lokace", label: "Lokace", icon: LocationIcon },
  { href: "/achievementy", label: "Achievementy", icon: AchievementIcon },
];

export default async function Home() {
  const user = await getCurrentUser();
  const { streams } = await getLiveStreams();

  // Výpadek DB nesmí shodit homepage — bez videí se sekce prostě nevykreslí.
  const videos = await getHomepageGameVideos().catch(() => []);

  const featuredGames = getGamesWithGameDetailPage().slice(0, HOMEPAGE_GAME_LIMIT);
  const quotes = getGameQuotes();

  const withLive = creatorProfiles.map((creator) => ({ creator, liveStream: findLiveStreamForCreator(creator.name, streams) }));
  const liveCreators = withLive.filter((c) => c.liveStream);
  const contentCreators = withLive.filter((c) => !c.liveStream && c.creator.videos.length > 0);
  const homepageCreators = [...liveCreators, ...contentCreators].slice(0, HOMEPAGE_CREATOR_LIMIT);

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">
        {/* A) HERO — během pár sekund musí být jasné, že web je o rybaření ve hrách. */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0e3347] via-[#0a2438] to-[#146b78] px-4 pb-20 pt-14 text-center text-white sm:pt-20">
          <div className="relative mx-auto max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-6xl">Rybaření ve hrách</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-cyan-50/90 sm:text-xl">
              Mám rád rybaření. A když nějaká hra obsahuje prut, je dost velká šance, že místo hlavního questu skončím
              někde u vody.
            </p>
            <div className="mx-auto mt-5 max-w-2xl space-y-3 text-sm text-cyan-100/75 sm:text-base">
              <p>
                HowToFish.cz jsem původně udělal kvůli jedné hře. Postupně jsem ale začal hledat další — Minecraft,
                Stardew Valley, Pokémon, Sea of Thieves… a zjistil jsem, že her, kde se dá rybařit, je překvapivě
                hodně.
              </p>
              <p>Tak je dávám dohromady tady.</p>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/hry-s-rybarenim"
                className="min-h-[44px] rounded-full bg-amber-400 px-6 py-2.5 font-serif text-gray-900 transition hover:bg-amber-300"
              >
                Procházet hry
              </Link>
              <Link
                href="/stream"
                className="min-h-[44px] rounded-full border border-white/20 bg-white/5 px-6 py-2.5 font-serif text-white transition hover:border-amber-300/60 hover:text-amber-200"
              >
                Kdo právě vysílá
              </Link>
            </div>
            <p className="mt-4 text-sm text-cyan-100/60">
              Tady to začalo:{" "}
              <Link href="/o-hre" className="underline decoration-amber-300/40 underline-offset-4 hover:text-amber-200">
                původní How to Fish →
              </Link>
            </p>
          </div>
          <RotatingQuote quotes={quotes} className="relative mt-8" />
          <OceanWaves className="absolute inset-x-0 bottom-0 h-14 w-full sm:h-20" />
        </section>

        {/* B) HRY */}
        <section className="bg-[#0a2438] px-4 py-14 text-white">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-2xl text-amber-300 sm:text-3xl">Hry, ve kterých se rybaří</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-cyan-100/75">
              Vybíráme hry, kde je rybaření důležitou mechanikou, minihrou nebo nezapomenutelnou součástí zážitku — od
              cozy simulátorů po MMO a klasiky.
            </p>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredGames.map((game) => (
                <li key={game.slug}>
                  <GameCard entry={game} />
                </li>
              ))}
            </ul>
            <div className="mt-8 text-center">
              <Link
                href="/hry-s-rybarenim"
                className="inline-flex min-h-[44px] items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-5 py-2.5 font-serif text-amber-300 transition hover:bg-amber-400/20"
              >
                Všech {gameEntries.length} her →
              </Link>
            </div>
          </div>
        </section>

        {/* C) PŮVODNÍ HOW TO FISH — web na téhle hře vznikl a encyklopedie je
            jeho hlavní organický vstup, proto hned za hrami.
            Obrázek je lokální asset projektu (žádný cizí artwork). */}
        <section className="bg-[#0e3347] px-4 py-14 text-white">
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a2438]/85 via-[#0e3347]/60 to-[#146b78]/40 px-6 py-8 text-center sm:px-10 sm:py-10">
              <svg
                aria-hidden="true"
                viewBox="0 0 400 60"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-14 w-full text-[#1c8a95]/25"
              >
                <polygon points="0,34 70,22 140,36 210,20 280,34 350,22 400,32 400,60 0,60" fill="currentColor" />
                <polygon points="0,46 90,36 180,48 270,34 360,46 400,40 400,60 0,60" fill="currentColor" opacity="0.6" />
              </svg>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-amber-200/10 blur-3xl"
              />

              <div className="relative">
                <Image
                  src="/images/howtofish-header-logo.webp"
                  alt="How to Fish"
                  width={899}
                  height={299}
                  className="mx-auto h-14 w-auto sm:h-20"
                />
                <h2 className="mt-4 font-serif text-2xl text-amber-300 sm:text-3xl">Původní How to Fish</h2>
                <p className="mx-auto mt-3 max-w-2xl text-cyan-100/80">
                  Tady to celé začalo. Česká encyklopedie hry How to Fish — ryby, návody, předměty, bossové, lokace
                  a achievementy.
                </p>
                <ul className="mt-7 grid gap-3 sm:grid-cols-3">
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
                <Link
                  href="/o-hre"
                  className="mt-7 inline-flex min-h-[44px] items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-5 py-2.5 font-serif text-amber-300 transition hover:bg-amber-400/20"
                >
                  Vše o How to Fish →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* D) VIDEA — výhradně z DB (schválená + aktivní), žádné YouTube volání při renderu. */}
        {videos.length > 0 && (
          <section className="bg-[#081c2c] px-4 py-14 text-white">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-center font-serif text-2xl text-amber-300 sm:text-3xl">Rybářská videa ze světa her</h2>
              <p className="mx-auto mt-3 max-w-2xl text-center text-cyan-100/75">
                Ručně vybraná videa od tvůrců na YouTube — od návodů po rybářské výzvy.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <li key={video.externalId}>
                    <GameVideoCard video={video} gameName={getGameBySlug(video.gameSlug)?.name} />
                  </li>
                ))}
              </ul>
              <div className="mt-8 text-center">
                <Link href="/hry-s-rybarenim" className="font-serif text-amber-300 underline hover:text-amber-200">
                  Videa najdeš i u jednotlivých her →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* REKLAMNÍ BANNER — jediný na homepage, mezi obsahovými bloky (UCA promotions, placement "banner"). */}
        <section className="bg-[#0a2438] px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <AdSlot pathname="/" />
          </div>
        </section>

        {/* E) STREAMEŘI A ŽIVÉ VYSÍLÁNÍ — jeden blok místo dvou (karty tvůrců + stav živého vysílání). */}
        <section className="bg-[#0a2438] px-4 py-14 text-white">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-serif text-2xl text-amber-300 sm:text-3xl">Streameři a živé vysílání</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-cyan-100/75">
              Sleduj hráče, kteří hrají How to Fish i další hry, kde je rybaření součástí zážitku.{" "}
              {streams.length > 0
                ? `Právě streamuje ${streams.length} ${streams.length === 1 ? "tvůrce" : "tvůrců"}.`
                : "Teď zrovna nikdo nestreamuje."}
            </p>
            {homepageCreators.length > 0 && (
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {homepageCreators.map(({ creator, liveStream }) => (
                  <li key={creator.slug}>
                    <CreatorCard creator={creator} liveStream={liveStream} />
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/stream"
                className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 font-serif text-white transition hover:border-amber-300/60 hover:text-amber-200"
              >
                Kdo je právě živě →
              </Link>
              <Link href="/streameri" className="font-serif text-amber-300 underline hover:text-amber-200">
                Všichni streameři →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <FeedbackCallout user={user ? { nickname: user.nickname } : null} />
      <Footer />
    </div>
  );
}
