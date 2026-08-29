import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { creatorProfiles, getCreatorProfile } from "../../../data/creators.ts";
import { SITE_URL } from "../../config/site.ts";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../../components/Breadcrumbs.tsx";

// Nová child route pod stávající /stream (dědí app/stream/layout.tsx,
// žádný zásah do StreamBrowser/live-stream logiky). Jen potvrzení
// tvůrci z data/creator-videos.ts (přes data/creators.ts) — žádná nová
// URL, žádné vymyšlené údaje.

export const dynamicParams = false;

type Props = { params: Promise<{ creator: string }> };

export function generateStaticParams() {
  return creatorProfiles.map((c) => ({ creator: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { creator: slug } = await params;
  const creator = getCreatorProfile(slug);
  if (!creator) return {};

  const title = `${creator.name} a How to Fish – videa a streamy`;
  const description = `Videa ${creator.name} ze hry How to Fish a odkazy na další český obsah, návody a streamy na HowToFish.cz.`;

  return {
    title,
    description,
    alternates: { canonical: `/stream/${creator.slug}` },
    openGraph: {
      description,
      images: [{ url: `/api/og?title=${encodeURIComponent(creator.name)}&sub=${encodeURIComponent("How to Fish CZ")}`, width: 1200, height: 630 }],
    },
  };
}

export default async function CreatorPage({ params }: Props) {
  const { creator: slug } = await params;
  const creator = getCreatorProfile(slug);
  if (!creator) notFound();

  const otherCreators = creatorProfiles.filter((c) => c.slug !== creator.slug);
  const pageUrl = `${SITE_URL}/stream/${creator.slug}`;

  const breadcrumbItems = [
    { label: "HowToFish.cz", href: "/" },
    { label: "Streamy", href: "/stream" },
    { label: creator.name },
  ];

  const jsonLd: object[] = [buildBreadcrumbJsonLd(breadcrumbItems, SITE_URL, pageUrl)];

  // VideoObject jen tam, kde máme opravdu ověřené YouTube ID (embed +
  // thumbnail existují) — u Kick tvůrců žádné vymyšlené uploadDate/duration.
  for (const video of creator.videos) {
    if (video.platform !== "youtube" || !video.youtubeId) continue;
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: video.title,
      description: video.subtitle,
      thumbnailUrl: `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`,
      contentUrl: video.url,
    });
  }

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-12 text-white">
      {jsonLd.map((entry, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }} />
      ))}

      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="mt-4 font-serif text-3xl sm:text-4xl">{creator.name} a How to Fish</h1>

        <p className="mt-4 text-lg text-cyan-100/80">
          {creator.name} patří mezi CZ/SK tvůrce, kteří si zahráli How to Fish. Níže najdeš dostupná videa ze hry a
          odkazy na další obsah na HowToFish.cz.
        </p>

        <section className="mt-8">
          <h2 className="font-serif text-xl text-amber-300">Videa z How to Fish</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {creator.videos.map((video) => (
              <VideoCard key={video.url} video={video} />
            ))}
          </div>
        </section>

        {otherCreators.length > 0 && (
          <section className="mt-10 border-t border-white/10 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-100/50">Další CZ/SK tvůrci</h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              {otherCreators.map((c) => (
                <li key={c.slug}>
                  <Link href={`/stream/${c.slug}`} className="text-cyan-100/80 underline hover:text-amber-300">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link href="/stream" className="mt-10 inline-block text-sm text-cyan-100/70 underline hover:text-amber-300">
          ← Zpět na Streamy
        </Link>
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: { title: string; subtitle: string; platform: "youtube" | "kick"; url: string; youtubeId?: string } }) {
  const thumbnailSrc = video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg` : null;

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-lg border border-white/10 bg-white/5 transition hover:border-amber-400/40"
    >
      {thumbnailSrc ? (
        <div className="relative aspect-video w-full">
          <Image src={thumbnailSrc} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
        </div>
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#0a2438] to-[#123c4d] text-center">
          <span className="rounded border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-cyan-100/90">
            {video.platform === "kick" ? "Kick" : "YouTube"}
          </span>
        </div>
      )}
      <div className="p-3">
        <p className="font-serif text-base text-white group-hover:text-amber-300">{video.title}</p>
        <p className="mt-1 text-sm text-cyan-100/70">{video.subtitle}</p>
      </div>
    </a>
  );
}
