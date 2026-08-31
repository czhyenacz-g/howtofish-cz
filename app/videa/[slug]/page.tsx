import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { creatorProfiles } from "../../../data/creators.ts";
import { getVideoBySlug, howToFishVideos } from "../../../data/how-to-fish-videos.ts";
import { SITE_URL } from "../../config/site.ts";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../../components/Breadcrumbs.tsx";
import LazyYouTubeEmbed from "../../components/LazyYouTubeEmbed.tsx";
import HowToFishVideoCard from "../../components/HowToFishVideoCard.tsx";

// /videa/[slug] — neutrální, ne creator-namespaceovaná route (viz
// zadání): video může mít víc "featured" tvůrců, takže nepatří pod
// jednoho z nich. Autor a "featured" tvůrci jsou v datech vždy
// rozlišení (data/how-to-fish-videos.ts).

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return howToFishVideos.map((v) => ({ slug: v.slug }));
}

function pageTitle(video: ReturnType<typeof getVideoBySlug>): string {
  if (!video) return "";
  return video.seoTitle ?? `${video.title} – ${video.author.name}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = getVideoBySlug(slug);
  if (!video) return {};

  const title = pageTitle(video);

  return {
    title,
    description: video.summary,
    alternates: { canonical: `/videa/${video.slug}` },
    ...(video.indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      description: video.summary,
      images: [{ url: video.thumbnailUrl, width: 1280, height: 720 }],
    },
  };
}

export default async function VideoDetailPage({ params }: Props) {
  const { slug } = await params;
  const video = getVideoBySlug(slug);
  if (!video) notFound();

  const title = pageTitle(video);
  const pageUrl = `${SITE_URL}/videa/${video.slug}`;

  // Autor + featured tvůrci dohromady, bez duplicit, resolvnutí na naše
  // creator profily (jen ti, které skutečně sledujeme).
  const involvedSlugs = Array.from(
    new Set([...(video.author.creatorSlug ? [video.author.creatorSlug] : []), ...video.featuredCreatorSlugs])
  );
  const involvedCreators = involvedSlugs
    .map((s) => creatorProfiles.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const otherVideos = howToFishVideos.filter((v) => v.slug !== video.slug).slice(0, 4);

  const breadcrumbItems = [
    { label: "HowToFish.cz", href: "/" },
    { label: "Streamy", href: "/stream" },
    { label: title },
  ];

  const jsonLd: object[] = [
    buildBreadcrumbJsonLd(breadcrumbItems, SITE_URL, pageUrl),
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: title,
      description: video.summary,
      thumbnailUrl: video.thumbnailUrl,
      uploadDate: video.publishedAt,
      embedUrl: `https://www.youtube-nocookie.com/embed/${video.videoId}`,
      contentUrl: video.url,
      creator: { "@type": "Person", name: video.author.name },
    },
  ];

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-12 text-white">
      {jsonLd.map((entry, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }} />
      ))}

      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="mt-4 font-serif text-2xl sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-cyan-100/60">
          Video: {video.author.creatorSlug ? (
            <Link href={`/stream/${video.author.creatorSlug}`} className="underline hover:text-amber-300">
              {video.author.name}
            </Link>
          ) : (
            <a href={video.author.channelUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">
              {video.author.name}
            </a>
          )}{" "}
          / YouTube
        </p>

        <div className="mt-6">
          <LazyYouTubeEmbed videoId={video.videoId} title={title} thumbnailUrl={video.thumbnailUrl} />
        </div>

        <section className="mt-6">
          <h2 className="font-serif text-lg text-amber-300">Naše shrnutí</h2>
          <p className="mt-2 text-cyan-100/80">{video.summary}</p>
        </section>

        {involvedCreators.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-lg text-amber-300">Kdo se ve videu objevuje</h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              {involvedCreators.map((c) => (
                <li key={c.slug}>
                  <Link href={`/stream/${c.slug}`} className="text-cyan-100/80 underline hover:text-amber-300">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-8 text-xs text-cyan-100/40">
          HowToFish.cz toto video pouze popisuje a propojuje s herní databází — nevlastní ho ani ho nevydává za
          vlastní obsah. Originál najdeš na{" "}
          <a href={video.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">
            YouTube
          </a>
          .
        </p>

        {otherVideos.length > 0 && (
          <section className="mt-10 border-t border-white/10 pt-6">
            <h2 className="font-serif text-lg text-amber-300">Další videa</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {otherVideos.map((v) => (
                <HowToFishVideoCard key={v.slug} video={v} />
              ))}
            </div>
          </section>
        )}

        <Link href="/stream" className="mt-10 inline-block text-sm text-cyan-100/70 underline hover:text-amber-300">
          ← Zpět na Streamy
        </Link>
      </div>
    </div>
  );
}
