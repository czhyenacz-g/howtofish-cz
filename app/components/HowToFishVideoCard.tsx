import Link from "next/link";
import type { HowToFishVideo } from "../../data/how-to-fish-videos.ts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
}

// Reusable karta videa — použitá na /stream, /stream/[creator] i na
// video detailu ("Další videa"). Vždy jasně uvádí skutečného autora,
// nikdy nepředstírá, že video patří HowToFish.cz nebo aktuálně
// zobrazenému tvůrci, pokud je autorem někdo jiný (viz zadání).
export default function HowToFishVideoCard({ video }: { video: HowToFishVideo }) {
  return (
    <Link
      href={`/videa/${video.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5 transition hover:border-amber-400/40"
    >
      <div className="relative aspect-video w-full bg-black/30">
        {/* eslint-disable-next-line @next/next/no-img-element -- externí YouTube CDN thumbnail */}
        <img src={video.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="font-serif text-sm text-white group-hover:text-amber-300 sm:text-base">{video.title}</p>
        <p className="text-xs text-cyan-100/60">
          Video: {video.author.name} · {formatDate(video.publishedAt)}
        </p>
      </div>
    </Link>
  );
}
