import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { creatorProfiles, getCreatorProfile } from "../../../data/creators.ts";
import { getVideosAuthoredBy, getVideosFeaturingButNotAuthoredBy } from "../../../data/how-to-fish-videos.ts";
import { SITE_URL } from "../../config/site.ts";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../../components/Breadcrumbs.tsx";
import HowToFishVideoCard from "../../components/HowToFishVideoCard.tsx";
import LazyYouTubeEmbed from "../../components/LazyYouTubeEmbed.tsx";

// Kolik "dalších CZ/SK tvůrců" se zobrazí dole na stránce — s rostoucím
// počtem tvůrců by celý seznam byl moc dlouhý (viz zadání "stačí 4-6,
// ne všech 15"). Pořadí je stabilní (`creatorProfiles` má pevné pořadí,
// žádný Math.random ani Date.now), takže výběr je deterministický a
// nemění se při každém buildu.
const RELATED_CREATORS_LIMIT = 6;

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

  const hasVideos = creator.videos.length > 0;
  // U tvůrců bez ověřeného videa nepíšeme do titulku/description "videa
  // a streamy" — nemáme je, co bychom ukázali (viz zadání "nevymýšlej
  // neověřené informace"). `seoTitle`/`seoDescription` (volitelné, viz
  // data/creators.ts) přebijí tuhle obecnou šablonu, když chceme
  // konkrétnější text pro daného tvůrce.
  const title =
    creator.seoTitle ?? (hasVideos ? `${creator.name} a How to Fish – videa a streamy` : `${creator.name} a How to Fish`);
  const description =
    creator.seoDescription ??
    (hasVideos
      ? `Videa ${creator.name} ze hry How to Fish a odkazy na další český obsah, návody a streamy na HowToFish.cz.`
      : `${creator.name} a How to Fish: co víme o jeho spojení se hrou, a odkazy na další český obsah na HowToFish.cz.`);

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

  const otherCreators = creatorProfiles.filter((c) => c.slug !== creator.slug).slice(0, RELATED_CREATORS_LIMIT);
  const pageUrl = `${SITE_URL}/stream/${creator.slug}`;

  // Doložená souvislost mezi tvůrci (např. společné hraní) — obousměrně:
  // "forward" je tvůrce, na kterého tenhle profil odkazuje
  // (relatedCreatorSlug), "mentionedBy" jsou profily, které odkazují sem.
  const relatedCreator = creator.relatedCreatorSlug
    ? creatorProfiles.find((c) => c.slug === creator.relatedCreatorSlug)
    : undefined;
  const mentionedBy = creatorProfiles.filter((c) => c.relatedCreatorSlug === creator.slug);

  // Nový video content model (data/how-to-fish-videos.ts) — oddělené od
  // staršího creator.videos (carousel na homepage, beze změny). Autor
  // vs. "jen se objevuje" je tu podstatné rozlišení, viz zadání.
  const authoredVideos = getVideosAuthoredBy(creator.slug);
  const featuredVideos = getVideosFeaturingButNotAuthoredBy(creator.slug);

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

  // Nový video model — reálný uploadDate z YouTube Data API, autor
  // odpovídá skutečnému nahrávajícímu kanálu, ne aktuálně zobrazenému
  // tvůrci (viz zadání "netvrď, že video vlastníme").
  for (const video of [...authoredVideos, ...featuredVideos]) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: video.title,
      description: video.summary,
      thumbnailUrl: video.thumbnailUrl,
      uploadDate: video.publishedAt,
      embedUrl: `https://www.youtube-nocookie.com/embed/${video.videoId}`,
      contentUrl: video.url,
      creator: { "@type": "Person", name: video.author.name },
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
          {creator.bio ??
            `${creator.name} patří mezi CZ/SK tvůrce, kteří si zahráli How to Fish. Níže najdeš dostupná videa ze hry a odkazy na další obsah na HowToFish.cz.`}
        </p>

        {(relatedCreator || mentionedBy.length > 0) && (
          <p className="mt-3 text-sm text-cyan-100/70">
            {relatedCreator && (
              <>
                {creator.name} se objevil při společném hraní s{" "}
                <Link href={`/stream/${relatedCreator.slug}`} className="underline hover:text-amber-300">
                  {relatedCreator.name}
                </Link>
                .
              </>
            )}
            {mentionedBy.map((mentioner) => (
              <span key={mentioner.slug} className="block">
                {mentioner.name} se s {creator.name} objevil/a při společném hraní How to Fish —{" "}
                <Link href={`/stream/${mentioner.slug}`} className="underline hover:text-amber-300">
                  více o {mentioner.name}
                </Link>
                .
              </span>
            ))}
          </p>
        )}

        {creator.externalLink && (
          <a
            href={creator.externalLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-md bg-amber-400 px-4 py-2 font-serif text-sm text-gray-900 transition hover:bg-amber-300"
          >
            {creator.externalLink.label}
          </a>
        )}

        {creator.videos.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-xl text-amber-300">Videa z How to Fish</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {creator.videos.map((video) => (
                <VideoCard key={video.url} video={video} />
              ))}
            </div>
          </section>
        )}

        {authoredVideos.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-xl text-amber-300">Vlastní How to Fish videa</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {authoredVideos.map((video) => (
                <HowToFishVideoCard key={video.slug} video={video} />
              ))}
            </div>
          </section>
        )}

        {featuredVideos.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-xl text-amber-300">{creator.name} v dalších How to Fish videích</h2>
            <p className="mt-1 text-sm text-cyan-100/60">
              Videa od jiných tvůrců, ve kterých se {creator.name} objevuje.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {featuredVideos.map((video) => (
                <HowToFishVideoCard key={video.slug} video={video} />
              ))}
            </div>
          </section>
        )}

        {otherCreators.length > 0 && (
          <section className="mt-10 border-t border-white/10 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-100/50">Další CZ/SK tvůrci</h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              {otherCreators.map((c) => (
                <li key={c.slug}>
                  <Link href={`/stream/${c.slug}`} className="text-cyan-100/80 underline hover:text-amber-300">
                    {c.name} <span className="text-cyan-100/40">{c.country === "SK" ? "🇸🇰" : "🇨🇿"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10 border-t border-white/10 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-100/50">Průvodce How to Fish</h2>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            <li>
              <Link href="/ryby" className="text-cyan-100/80 underline hover:text-amber-300">
                Ryby
              </Link>
            </li>
            <li>
              <Link href="/navody" className="text-cyan-100/80 underline hover:text-amber-300">
                Návody
              </Link>
            </li>
            <li>
              <Link href="/bossove" className="text-cyan-100/80 underline hover:text-amber-300">
                Bossové
              </Link>
            </li>
            <li>
              <Link href="/lokace" className="text-cyan-100/80 underline hover:text-amber-300">
                Lokace
              </Link>
            </li>
          </ul>
        </section>

        <Link href="/stream" className="mt-10 inline-block text-sm text-cyan-100/70 underline hover:text-amber-300">
          ← Zpět na Streamy
        </Link>
      </div>
    </div>
  );
}

function VideoCard({
  video,
}: {
  video: { title: string; subtitle: string; platform: "youtube" | "kick"; url: string; youtubeId?: string; image?: string };
}) {
  // Reálné YouTube ID -> lazy embed po kliknutí (LazyYouTubeEmbed, stejná
  // komponenta jako /videa/[slug]) + explicitní "Otevřít na YouTube"
  // odkaz, viz zadání. Kick (nebo YouTube bez ID) beze změny — pořád jen
  // odkaz na skutečný profil/klipy, žádný vymyšlený/fake embed.
  if (video.platform === "youtube" && video.youtubeId) {
    return (
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
        <LazyYouTubeEmbed
          videoId={video.youtubeId}
          title={video.title}
          thumbnailUrl={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
        />
        <div className="p-3">
          <p className="font-serif text-base text-white">{video.title}</p>
          <p className="mt-1 text-sm text-cyan-100/70">{video.subtitle}</p>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-semibold text-amber-300 underline hover:text-amber-200"
          >
            Otevřít na YouTube ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-lg border border-white/10 bg-white/5 transition hover:border-amber-400/40"
    >
      {video.image ? (
        <div className="relative aspect-video w-full">
          <Image src={video.image} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
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
