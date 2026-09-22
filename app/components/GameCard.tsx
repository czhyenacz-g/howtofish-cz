import Link from "next/link";
import {
  AUDIENCE_TYPE_LABEL,
  FISHING_IMPORTANCE_LABEL,
  GAME_STATUS_LABEL,
  type GameEntry,
} from "../../data/games";
import GameCover from "./GameCover";

// Barvy stavu — "Máme obsah" je jediná výrazná (jantarová, stejná jako
// ostatní CTA na webu), "Připravujeme"/"Brzy" zůstávají tlumené.
const STATUS_CLASS: Record<GameEntry["status"], string> = {
  available: "border-amber-300 bg-amber-400 text-gray-900",
  preparing: "border-cyan-200/50 bg-cyan-400/15 text-cyan-100",
  planned: "border-white/15 bg-white/5 text-cyan-100/70",
};

/**
 * Karta hry v katalogu /hry-s-rybarenim. Karta odkazuje POUZE tehdy, když
 * hra skutečně má na webu obsah (`hasDetail` + `detailHref`) — hry bez
 * detailu jsou záměrně neklikací, aby žádná karta nevedla na 404 (stav
 * komunikuje badge "Připravujeme" / "Brzy").
 *
 * Karta záměrně nese jen čtyři informace navíc k názvu: důležitost
 * rybaření (vlevo nahoře na coveru), publikum (vpravo nahoře), štítky a
 * stav (dole) — víc by ji přeplnilo.
 */
export default function GameCard({ entry }: { entry: GameEntry }) {
  const clickable = entry.hasDetail && Boolean(entry.detailHref);
  const featuredRing = entry.isFeatured ? " border-amber-400/30" : "";

  const content = (
    <>
      <div className="relative aspect-[16/10] w-full">
        <GameCover name={entry.name} slug={entry.slug} image={entry.image} className="absolute inset-0" />
        <span className="absolute left-2 top-2 rounded border border-white/20 bg-[#0a2438]/80 px-2 py-0.5 font-serif text-[11px] tracking-wide text-[#f4ead9] backdrop-blur-sm">
          {FISHING_IMPORTANCE_LABEL[entry.fishingImportance]}
        </span>
        <span className="absolute right-2 top-2 rounded border border-cyan-200/30 bg-[#0a2438]/80 px-2 py-0.5 font-serif text-[11px] tracking-wide text-cyan-100 backdrop-blur-sm">
          {AUDIENCE_TYPE_LABEL[entry.audienceType]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 text-left">
        <h3 className="font-serif text-base leading-snug text-white group-hover:text-amber-300">{entry.name}</h3>

        {entry.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <li key={tag} className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-cyan-100/70">
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="text-[11px] uppercase tracking-wide text-cyan-100/45">{entry.platforms.join(" · ")}</span>
          <span className={`shrink-0 rounded border px-2 py-0.5 font-serif text-[11px] ${STATUS_CLASS[entry.status]}`}>
            {GAME_STATUS_LABEL[entry.status]}
          </span>
        </div>
      </div>
    </>
  );

  const shellClass = `flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0e3347]/60 transition duration-150 motion-reduce:transition-none${featuredRing}`;

  if (!clickable) {
    return <article className={shellClass}>{content}</article>;
  }

  return (
    <Link
      href={entry.detailHref!}
      aria-label={`${entry.name} — otevřít obsah na webu`}
      className={`group ${shellClass} hover:-translate-y-0.5 hover:border-amber-400/60 hover:bg-[#0e3347] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-reduce:hover:translate-y-0`}
    >
      {content}
    </Link>
  );
}
