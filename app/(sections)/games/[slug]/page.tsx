import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "../../../components/AdSlot";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../../../components/Breadcrumbs.tsx";
import GameCover from "../../../components/GameCover";
import GameStreamersSection from "../../../components/GameStreamersSection";
import GameVideosSection from "../../../components/GameVideosSection";
import RealFishingPromo from "../../../components/RealFishingPromo";
import { SITE_URL } from "../../../config/site.ts";
import {
  AUDIENCE_TYPE_LABEL,
  FISHING_IMPORTANCE_LABEL,
  getGameBySlug,
  getGamesWithGameDetailPage,
  hasGameDetailPage,
} from "../../../../data/games.ts";
import { getGameDetailContent, getGameStreamers, type GameGuideTable } from "../../../../data/game-details.ts";
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

function GuideTable({ table }: { table: GameGuideTable }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[20rem] text-left text-sm">
        <caption className="bg-white/5 px-3 py-2 text-left font-serif text-sm text-amber-200">{table.caption}</caption>
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-cyan-100/50">
          <tr>
            {table.head.map((cell) => (
              <th key={cell} scope="col" className="px-3 py-2">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {table.rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell, index) => (
                <td key={index} className={`px-3 py-2 ${index === 0 ? "text-white" : "text-cyan-100/80"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

  // „Co hledat“ = jen ručně psané uživatelské labely z game-details.ts.
  // Interní monitoring data (searchKeywords) se veřejně nezobrazují.
  const whatToLookFor = content?.whatToLookFor ?? [];
  const quotes = game.quotes ?? [];
  const importanceLabel = FISHING_IMPORTANCE_LABEL[game.fishingImportance];
  const audienceLabel = AUDIENCE_TYPE_LABEL[game.audienceType];

  const breadcrumbItems = [
    { label: "HowToFish.cz", href: "/" },
    { label: "Hry", href: "/hry-s-rybarenim" },
    { label: game.name },
  ];
  const pageUrl = `${SITE_URL}/games/${game.slug}`;
  const guide = content?.guide ?? [];
  const faq = content?.faq ?? [];
  // FAQPage JSON-LD jen když FAQ na stránce skutečně je (stejný text).
  const faqJsonLd =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#081c2c] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems, SITE_URL, pageUrl)) }}
      />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <Breadcrumbs items={breadcrumbItems} />

        <Link
          href="/hry-s-rybarenim"
          className="mt-4 inline-flex text-sm text-cyan-100/70 underline hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          ← Všechny hry s rybařením
        </Link>

        {/* --- HERO --- */}
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0e3347]/90 via-[#0a2438]/75 to-[#146b78]/50 p-5 sm:p-7">
          {/* Jemné dekorativní pozadí (statické vlny + světelný akcent) —
              stránka nemá působit jako čistě textový blok. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 400 60"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 w-full text-[#1c8a95]/25 sm:h-16"
          >
            <polygon points="0,34 70,22 140,36 210,20 280,34 350,22 400,32 400,60 0,60" fill="currentColor" />
            <polygon points="0,46 90,36 180,48 270,34 360,46 400,40 400,60 0,60" fill="currentColor" opacity="0.6" />
          </svg>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-amber-200/10 blur-3xl"
          />

          <div className="relative grid gap-6 sm:grid-cols-[minmax(0,340px)_1fr] sm:items-start">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/15 shadow-lg shadow-black/30">
              <GameCover name={game.name} slug={game.slug} image={game.image} className="absolute inset-0" />
            </div>

            <div>
              <h1 className="font-serif text-3xl sm:text-4xl">{content?.h1 ?? game.name}</h1>

              {/* Bez stavového štítku — stránka sama je ten obsah. Badge publika
                  se skryje, když je stejný jako důležitost rybaření. */}
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {audienceLabel !== importanceLabel && (
                  <li className="rounded-full border border-cyan-200/30 bg-white/5 px-2.5 py-0.5 font-serif text-[11px] tracking-wide text-cyan-100">
                    {audienceLabel}
                  </li>
                )}
                <li className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-serif text-[11px] tracking-wide text-[#f4ead9]">
                  {importanceLabel}
                </li>
              </ul>

              <p className="mt-3 text-xs uppercase tracking-wide text-cyan-100/45">{game.platforms.join(" · ")}</p>

              {content?.tagline && <p className="mt-4 text-cyan-100/85">{content.tagline}</p>}

              {quotes.length > 0 && (
                <blockquote className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 font-serif text-base italic text-amber-100/90">
                  {quotes.map((quote) => (
                    <p key={quote}>„{quote}“</p>
                  ))}
                </blockquote>
              )}
            </div>
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

        {/* --- A2) PLNÝ PRŮVODCE (volitelný, jen hry s `guide` v game-details.ts) --- */}
        {guide.length > 0 && (
          <>
            <nav aria-label="Obsah průvodce" className="mt-8 rounded-xl border border-white/10 bg-[#0e3347]/60 p-4">
              <p className="font-serif text-sm text-amber-300">Obsah průvodce</p>
              <ol className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                {guide.map((section, index) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="text-cyan-100/80 underline-offset-2 hover:text-amber-300 hover:underline">
                      {index + 1}. {section.heading}
                    </a>
                  </li>
                ))}
                {faq.length > 0 && (
                  <li>
                    <a href="#caste-otazky" className="text-cyan-100/80 underline-offset-2 hover:text-amber-300 hover:underline">
                      {guide.length + 1}. Časté otázky
                    </a>
                  </li>
                )}
              </ol>
            </nav>
            {guide.map((section) => (
              <section key={section.id} id={section.id} className="mt-10 scroll-mt-6" aria-labelledby={`${section.id}-h`}>
                <h2 id={`${section.id}-h`} className="font-serif text-xl sm:text-2xl">
                  {section.heading}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-cyan-100/80">
                    {paragraph}
                  </p>
                ))}
                {section.tables?.map((table) => <GuideTable key={table.caption} table={table} />)}
                {section.bullets && (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-cyan-100/80">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
                {section.note && (
                  <p className="mt-4 rounded-lg border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-100/90">
                    {section.note}
                  </p>
                )}
              </section>
            ))}
          </>
        )}

        {faq.length > 0 && (
          <section id="caste-otazky" className="mt-10 scroll-mt-6" aria-labelledby="caste-otazky-h">
            <h2 id="caste-otazky-h" className="font-serif text-xl sm:text-2xl">
              Časté otázky
            </h2>
            <dl className="mt-4 space-y-4">
              {faq.map((item) => (
                <div key={item.question}>
                  <dt className="font-semibold text-white">{item.question}</dt>
                  <dd className="mt-1 text-cyan-100/80">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* --- B) CO HLEDAT --- */}
        {whatToLookFor.length > 0 && (
          <section className="mt-10" aria-labelledby="game-look-for">
            <h2 id="game-look-for" className="font-serif text-xl sm:text-2xl">
              Co hledat
            </h2>
            <p className="mt-2 text-sm text-cyan-100/70">
              Anglické výrazy, podle kterých k téhle hře najdeš návody a videa o rybaření.
            </p>
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

        {/* Reklamní banner mezi obsahovými bloky (stejný AdSlot jako jinde,
            kontext = cesta detailu hry). */}
        <div className="mt-10">
          <AdSlot pathname={`/games/${game.slug}`} />
        </div>

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
          </section>
        )}

        {/* --- D) + E) Sekce bez dat se vůbec nevykreslí --- */}
        <GameStreamersSection streamers={streamers} />
        <GameVideosSection videos={videos} />

        {content?.sources && content.sources.length > 0 && (
          <section className="mt-10 border-t border-white/10 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-100/50">Zdroje</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {content.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-cyan-100/70 underline hover:text-amber-300">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
            {content.lastReviewed && (
              <p className="mt-3 text-xs text-cyan-100/50">Obsah ověřen podle zdrojů: {content.lastReviewed.split("-").reverse().map(Number).join(". ")}.</p>
            )}
          </section>
        )}

        {/* Interní kampaň "první skutečné rybaření" — max. 1 na stránku, až pod obsahem. */}
        <RealFishingPromo placement="game" className="mt-12" />
      </div>
    </div>
  );
}
