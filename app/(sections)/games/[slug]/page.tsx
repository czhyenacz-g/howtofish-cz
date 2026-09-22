import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../../../components/Breadcrumbs.tsx";
import GameCover from "../../../components/GameCover";
import GameStreamersSection from "../../../components/GameStreamersSection";
import GameVideosSection from "../../../components/GameVideosSection";
import { SITE_URL } from "../../../config/site.ts";
import {
  AUDIENCE_TYPE_LABEL,
  FISHING_IMPORTANCE_LABEL,
  GAME_STATUS_LABEL,
  getGameBySlug,
  getGamesWithGameDetailPage,
  hasGameDetailPage,
} from "../../../../data/games.ts";
import { getGameDetailContent, getGameStreamers } from "../../../../data/game-details.ts";
import { getApprovedGameVideos } from "../../../../lib/games/game-videos.ts";

// Univerzální detail hry. Vzniká POUZE pro hry, které mají `hasDetail` a
// `detailHref` mířící na tuhle routu (`getGamesWithGameDetailPage`) —
// ostatní hry katalog záměrně neodkazuje a `dynamicParams = false` zajistí,
// že sem žádný jiný slug nevede (žádné 404 odkazy z karet).
// How to Fish tu záměrně není: jeho obsah bydlí v existujících sekcích
// a jeho karta vede na /ryby.

export const dynamicParams = false;

// ISR: stránka se obnovuje nejvýš jednou za 10 minut — schválená videa se
// tak objeví bez rebuildu a DB se nečte při každém requestu. YouTube API se
// při renderu NIKDY nevolá (discovery je jen ruční CLI skript), takže
// kvóta je v bezpečí.
export const revalidate = 600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getGamesWithGameDetailPage().map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game || !hasGameDetailPage(game)) return {};

  const content = getGameDetailContent(game.slug);
  const title = content?.seoTitle ?? `${game.name} – rybaření a tipy | HowToFish.cz`;
  const description =
    content?.metaDescription ?? `Rybaření ve hře ${game.name}: co se v něm vyplatí hledat a proč stojí za to.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/games/${game.slug}` },
    openGraph: {
      description,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(game.name)}&sub=${encodeURIComponent("Rybaření ve hrách")}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game || !hasGameDetailPage(game)) notFound();

  const content = getGameDetailContent(game.slug);
  const streamers = getGameStreamers(game);
  // Výpadek DB (nebo ještě nespárovaná tabulka) nesmí stránku shodit —
  // bez schválených videí se sekce prostě nevykreslí.
  const videos = await getApprovedGameVideos(game.slug).catch(() => []);

  // „Co hledat“ = ručně psané uživatelské labely, jinak fallback na
  // searchKeywords z katalogu (interní query stringy se nikdy nezobrazují
  // doslova, viz zadání bod 4B).
  const whatToLookFor = content?.whatToLookFor ?? game.searchKeywords ?? [];
  const quotes = game.quotes ?? [];

  const breadcrumbItems = [
    { label: "HowToFish.cz", href: "/" },
    { label: "Hry", href: "/hry-s-rybarenim" },
    { label: game.name },
  ];
  const pageUrl = `${SITE_URL}/games/${game.slug}`;

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#081c2c] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems, SITE_URL, pageUrl)) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <Breadcrumbs items={breadcrumbItems} />

        <Link
          href="/hry-s-rybarenim"
          className="mt-4 inline-flex text-sm text-cyan-100/70 underline hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          ← Všechny hry s rybařením
        </Link>

        {/* --- HERO --- */}
        <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,320px)_1fr] sm:items-start">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10">
            <GameCover name={game.name} slug={game.slug} image={game.image} className="absolute inset-0" />
          </div>

          <div>
            <h1 className="font-serif text-3xl sm:text-4xl">{game.name}</h1>

            <ul className="mt-3 flex flex-wrap gap-1.5">
              <li className="rounded border border-cyan-200/30 bg-white/5 px-2 py-0.5 font-serif text-[11px] tracking-wide text-cyan-100">
                {AUDIENCE_TYPE_LABEL[game.audienceType]}
              </li>
              <li className="rounded border border-white/15 bg-white/5 px-2 py-0.5 font-serif text-[11px] tracking-wide text-[#f4ead9]">
                {FISHING_IMPORTANCE_LABEL[game.fishingImportance]}
              </li>
              <li
                className={`rounded border px-2 py-0.5 font-serif text-[11px] tracking-wide ${
                  game.status === "available"
                    ? "border-amber-300 bg-amber-400 text-gray-900"
                    : "border-white/15 bg-white/5 text-cyan-100/70"
                }`}
              >
                {GAME_STATUS_LABEL[game.status]}
              </li>
            </ul>

            <p className="mt-2 text-xs uppercase tracking-wide text-cyan-100/45">{game.platforms.join(" · ")}</p>

            {content?.tagline && <p className="mt-4 text-cyan-100/85">{content.tagline}</p>}

            {quotes.length > 0 && (
              <blockquote className="mt-4 border-l-2 border-amber-400/50 pl-3 font-serif text-base italic text-amber-100/90">
                {quotes.map((quote) => (
                  <p key={quote}>„{quote}“</p>
                ))}
              </blockquote>
            )}
          </div>
        </div>

        {/* --- A) RYBAŘENÍ V TÉTO HŘE --- */}
        {content && (
          <section className="mt-10" aria-labelledby="game-fishing">
            <h2 id="game-fishing" className="font-serif text-xl sm:text-2xl">
              Rybaření v této hře
            </h2>
            {content.fishing.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-cyan-100/80">
                {paragraph}
              </p>
            ))}
          </section>
        )}

        {/* --- B) CO HLEDAT --- */}
        {whatToLookFor.length > 0 && (
          <section className="mt-10" aria-labelledby="game-look-for">
            <h2 id="game-look-for" className="font-serif text-xl sm:text-2xl">
              Co hledat
            </h2>
            <p className="mt-2 text-sm text-cyan-100/70">Výrazy, které se u téhle hry vyplatí sledovat.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {whatToLookFor.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-cyan-100/80"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* --- C) DALŠÍ HRY ZE SÉRIE (jen text, žádné fake routy) --- */}
        {game.relatedGames && game.relatedGames.length > 0 && (
          <section className="mt-10" aria-labelledby="game-related">
            <h2 id="game-related" className="font-serif text-xl sm:text-2xl">
              Další hry ze série
            </h2>
            <p className="mt-2 text-sm text-cyan-100/70">
              {game.series && game.series !== game.name
                ? `Další ${game.series} hry, ve kterých se rybaří:`
                : "Související hry, které stojí za to znát:"}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {game.relatedGames.map((related) => (
                <li
                  key={related}
                  className="rounded-lg border border-white/10 bg-[#0e3347]/50 px-3 py-2 text-sm text-cyan-100/80"
                >
                  {related}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-cyan-100/50">
              Tyhle hry zatím vlastní stránku nemají — doplníme je postupně.
            </p>
          </section>
        )}

        {/* --- D) + E) Připravené sekce: bez dat se vůbec nevykreslí --- */}
        <GameStreamersSection streamers={streamers} />
        <GameVideosSection videos={videos} />
      </div>
    </div>
  );
}
