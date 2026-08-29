import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideEntries } from "../../../../lib/universal-content-api/guides";
import AuthorBadge from "../../../components/community/AuthorBadge";
import HowToCatchGuide, { getHowToCatchMetadata } from "../HowToCatchGuide";
import WhereToFindGuide, { getWhereToFindMetadata } from "../WhereToFindGuide";

const HOW_TO_CATCH_PREFIX = "jak-chytit-";
const WHERE_TO_FIND_PREFIX = "kde-najit-";

type Props = {
  params: Promise<{ slug: string }>;
};

// Komunitní návody mohou kdykoliv přibýt (approve v adminu), takže na
// rozdíl od /ryby/[slug] tahle stránka NENÍ staticky generovaná ze
// seznamu předem — čte se vždy aktuální getGuideEntries() (curated +
// approved, cachováno na úrovni fetch, viz community.ts).
//
// Nové SEO návody "jak chytit"/"kde najít" (data/fish-guides.ts) jsou
// technicky vyřešené TADY, ne jako vlastní sourozenecké route složky
// (`jak-chytit-[slug]`, `kde-najit-[slug]`) — ty by měly ve výsledné URL
// přesně to, co je potřeba, ale v Next.js App Routeru za běhu kolidují
// s tímhle existujícím `[slug]` (ověřeno reálným requestem: `[slug]`
// match dřív a request na prefixovanou route nikdy nedorazí, i když
// `next build` tuhle kolizi nenahlásí). Prefix slugu se proto rozhoduje
// hned na začátku a deleguje se do HowToCatchGuide/WhereToFindGuide —
// žádná existující curated/komunitní guide slug s těmito prefixy
// nezačíná ("jak-porazit-…", "community-…"), takže ke kolizi nedochází.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug.startsWith(HOW_TO_CATCH_PREFIX)) {
    return getHowToCatchMetadata(slug.slice(HOW_TO_CATCH_PREFIX.length));
  }
  if (slug.startsWith(WHERE_TO_FIND_PREFIX)) {
    return getWhereToFindMetadata(slug.slice(WHERE_TO_FIND_PREFIX.length));
  }

  const guides = await getGuideEntries().catch(() => []);
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/navody/${guide.slug}` },
    openGraph: {
      description: guide.summary,
      images: [{ url: `/api/og?title=${encodeURIComponent(guide.title)}`, width: 1200, height: 630 }],
    },
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;

  if (slug.startsWith(HOW_TO_CATCH_PREFIX)) {
    return <HowToCatchGuide fishSlug={slug.slice(HOW_TO_CATCH_PREFIX.length)} />;
  }
  if (slug.startsWith(WHERE_TO_FIND_PREFIX)) {
    return <WhereToFindGuide fishSlug={slug.slice(WHERE_TO_FIND_PREFIX.length)} />;
  }

  const guides = await getGuideEntries().catch(() => []);
  const guide = guides.find((g) => g.slug === slug);

  if (!guide) {
    notFound();
  }

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/navody"
          className="text-sm text-cyan-100/70 underline hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          ← Zpět na návody
        </Link>

        <h1 className="mt-4 font-serif text-3xl sm:text-4xl">{guide.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {guide.category && (
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs uppercase tracking-wide text-cyan-100/60">
              {guide.category}
            </span>
          )}
          <AuthorBadge authorName={guide.authorName} source={guide.source} />
        </div>

        <p className="mt-4 text-lg text-cyan-100/80">{guide.summary}</p>

        {guide.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- uživatelský screenshot s volným poměrem stran
          <img
            src={guide.imageUrl}
            alt={guide.title}
            className="mt-6 w-full rounded-lg border border-white/10 object-cover"
          />
        )}

        {guide.content && (
          <div className="mt-8 space-y-4 whitespace-pre-line text-cyan-100/80">{guide.content}</div>
        )}
      </div>
    </div>
  );
}
