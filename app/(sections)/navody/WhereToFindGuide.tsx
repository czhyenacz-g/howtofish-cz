import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fishEntries } from "../../../data/fish";
import { fishGuides, getFishGuidesForFish } from "../../../data/fish-guides";
import { SITE_URL } from "../../config/site";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../../components/Breadcrumbs";

// Vykresluje /navody/kde-najit-{fishSlug} — volané z app/(sections)/navody/[slug]/page.tsx,
// viz komentář v HowToCatchGuide.tsx pro důvod (route-level konflikt se
// sourozeneckým `[slug]`, ověřeno reálným requestem).

function findGuide(fishSlug: string) {
  return fishGuides.find((g) => g.type === "where-to-find" && g.fishSlug === fishSlug);
}

export function getWhereToFindMetadata(fishSlug: string): Metadata {
  const guide = findGuide(fishSlug);
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/navody/kde-najit-${guide.fishSlug}` },
    openGraph: {
      description: guide.description,
      images: [{ url: `/api/og?title=${encodeURIComponent(guide.title)}`, width: 1200, height: 630 }],
    },
  };
}

export default function WhereToFindGuide({ fishSlug }: { fishSlug: string }) {
  const guide = findGuide(fishSlug);
  if (!guide) notFound();

  const fish = fishEntries.find((f) => f.slug === guide.fishSlug);
  const catchGuide = getFishGuidesForFish(guide.fishSlug).find((g) => g.type === "how-to-catch");
  const pageUrl = `${SITE_URL}/navody/kde-najit-${guide.fishSlug}`;

  const breadcrumbItems = [
    { label: "HowToFish.cz", href: "/" },
    { label: "Návody", href: "/navody" },
    { label: guide.title.replace(" v How to Fish", "") },
  ];

  const jsonLd = [
    buildBreadcrumbJsonLd(breadcrumbItems, SITE_URL, pageUrl),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      url: pageUrl,
      inLanguage: "cs",
      ...(guide.lastReviewed ? { datePublished: guide.lastReviewed, dateModified: guide.lastReviewed } : {}),
      author: { "@type": "Organization", name: "HowToFish.cz" },
      publisher: { "@type": "Organization", name: "HowToFish.cz" },
    },
  ];

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-12 text-white">
      {jsonLd.map((entry, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }} />
      ))}

      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="mt-4 font-serif text-3xl sm:text-4xl">{guide.title}</h1>

        <p className="mt-4 text-lg text-cyan-100/80">{guide.intro}</p>

        {guide.shortAnswer && (
          <section className="mt-8 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4">
            <h2 className="font-serif text-lg text-amber-300">Rychlá odpověď</h2>
            <p className="mt-2 text-cyan-100/90">{guide.shortAnswer}</p>
          </section>
        )}

        {guide.location && (
          <section className="mt-8">
            <h2 className="font-serif text-xl text-amber-300">{guide.location.name}</h2>
            <p className="mt-3 text-cyan-100/80">{guide.location.text}</p>
            <Link href="/lokace" className="mt-2 inline-block text-sm text-cyan-100/70 underline hover:text-amber-300">
              Zobrazit všechny lokace →
            </Link>
          </section>
        )}

        <section className="mt-10 border-t border-white/10 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-100/50">Související obsah</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {catchGuide && (
              <li>
                <Link href={`/navody/jak-chytit-${catchGuide.fishSlug}`} className="text-cyan-100/80 underline hover:text-amber-300">
                  Jak {fish?.name ?? guide.fishSlug} chytit
                </Link>
              </li>
            )}
            {fish && (
              <li>
                <Link href={`/ryby/${fish.slug}`} className="text-cyan-100/80 underline hover:text-amber-300">
                  Detail {fish.name} v encyklopedii
                </Link>
              </li>
            )}
          </ul>
        </section>

        {guide.sources.length > 0 && (
          <section className="mt-8 border-t border-white/10 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-100/50">Zdroje</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {guide.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-cyan-100/70 underline hover:text-amber-300">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {guide.lastReviewed && (
          <p className="mt-8 text-xs text-cyan-100/40">
            Aktualizováno:{" "}
            {new Date(guide.lastReviewed).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" })}
          </p>
        )}
      </div>
    </div>
  );
}
