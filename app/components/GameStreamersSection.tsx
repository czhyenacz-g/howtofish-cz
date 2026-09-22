import Link from "next/link";
import type { GameStreamerRef } from "../../data/game-details.ts";

/**
 * „Streameři, kteří tuhle hru hrají“ na detailu hry.
 *
 * Sekce je PŘIPRAVENÁ pro další fázi (monitoring), ale dokud pro danou
 * hru nemáme data, nevykreslí se vůbec — žádný prázdný blok (viz zadání
 * bod 4D). Data dodává `getGameStreamers()` v data/game-details.ts, který
 * teď vrací prázdný seznam; žádný nový discovery ani API.
 *
 * `slug` míří na existující profil v rámci našeho streamer systému,
 * `url` je externí odkaz na platformu.
 */
export default function GameStreamersSection({ streamers }: { streamers: GameStreamerRef[] }) {
  if (streamers.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="game-streamers">
      <h2 id="game-streamers" className="font-serif text-xl sm:text-2xl">
        Streameři, kteří tuhle hru hrají
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {streamers.map((streamer) => (
          <li key={`${streamer.name}-${streamer.slug ?? streamer.url ?? ""}`}>
            {streamer.slug ? (
              <Link
                href={`/streameri/${streamer.slug}`}
                className="inline-flex min-h-[36px] items-center rounded-md border border-white/15 bg-white/5 px-3 py-1.5 font-serif text-sm text-[#f4ead9] transition hover:border-amber-300/60 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                {streamer.name}
              </Link>
            ) : streamer.url ? (
              <a
                href={streamer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[36px] items-center rounded-md border border-white/15 bg-white/5 px-3 py-1.5 font-serif text-sm text-[#f4ead9] transition hover:border-amber-300/60 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                {streamer.name}
              </a>
            ) : (
              <span className="inline-flex min-h-[36px] items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-serif text-sm text-[#f4ead9]/80">
                {streamer.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
