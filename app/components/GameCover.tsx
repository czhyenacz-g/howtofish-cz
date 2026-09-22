import Image from "next/image";
import FishSilhouette from "./FishSilhouette";

/**
 * Cover karty hry — stejný princip jako FishImage.tsx: dokud nemáme
 * vlastní/legální obrázek, vykreslí se stylový placeholder, ne rozbitý
 * obrázek ani cizí hotlink (žádné artworky ze Steamu/IGDB/wiki). Jakmile
 * se `image` doplní do data/games.ts (ideálně soubor v public/games/covers/),
 * použije se skutečný cover.
 *
 * Placeholder je záměrně bohatší než dřív, aby karty nepůsobily prázdně:
 * barevná varianta podle slugu + světelný akcent + jemná vlnková textura
 * + „hladina“ dole + velká iniciála hry. Pořád jde o náš vlastní
 * dekorativní prvek.
 */
const COVER_PALETTES = [
  "from-[#0e4f66] via-[#146b78] to-[#1c8a95]",
  "from-[#10394f] via-[#155f6b] to-[#24868f]",
  "from-[#0b3149] via-[#125c74] to-[#2a8f8a]",
  "from-[#15364b] via-[#0f5b62] to-[#1a7f86]",
  "from-[#0d3f5c] via-[#176a70] to-[#2c9a86]",
  "from-[#123049] via-[#0d5668] to-[#1e7f93]",
];

function paletteFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return COVER_PALETTES[hash % COVER_PALETTES.length];
}

export default function GameCover({
  name,
  slug,
  image,
  className = "",
}: {
  name: string;
  slug: string;
  image?: string;
  className?: string;
}) {
  if (image) {
    return <Image src={image} alt={name} fill className={`object-cover ${className}`} />;
  }

  const initial = name.trim().charAt(0).toUpperCase();
  const patternId = `cover-waves-${slug.replace(/[^a-z0-9-]/g, "")}`;

  return (
    <div
      role="img"
      aria-label={`${name} — cover zatím chybí`}
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${paletteFor(slug)} shadow-[inset_0_0_30px_rgba(0,0,0,0.35)] ${className}`}
    >
      {/* Jemná vlnková textura přes celou plochu — aby cover nebyl jen
          plochý gradient. */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]">
        <defs>
          <pattern id={patternId} width="28" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 7 Q 7 0 14 7 T 28 7" fill="none" stroke="#f4ead9" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* Světelný akcent shora („hladina“) + dozáření zleva. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/12 to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-6 -top-8 h-32 w-32 rounded-full bg-amber-200/10 blur-2xl"
      />

      {/* „Hladina“ dole — jemná silueta vln, stejný motiv jako jinde na webu. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 40"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-8 w-full text-[#f4ead9]/10 sm:h-10"
      >
        <polygon points="0,22 50,14 100,24 150,12 200,22 250,13 300,23 350,14 400,22 400,40 0,40" fill="currentColor" />
      </svg>

      <FishSilhouette className="pointer-events-none absolute -bottom-2 -right-2 h-20 w-20 -rotate-6 text-amber-300/15 motion-reduce:rotate-0" />

      <span
        aria-hidden="true"
        className="relative font-serif text-6xl font-bold text-[#f4ead9]/85 drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]"
      >
        {initial}
      </span>
    </div>
  );
}
