import Image from "next/image";
import FishSilhouette from "./FishSilhouette";

/**
 * Cover karty hry — stejný princip jako FishImage.tsx: dokud nemáme
 * vlastní/legální obrázek, vykreslí se stylový placeholder (oceánský
 * gradient + vodní silueta + iniciála hry), ne rozbitý obrázek ani cizí
 * hotlink. Jakmile se `image` doplní do data/games.ts (ideálně soubor v
 * public/games/covers/), použije se skutečný cover.
 *
 * Placeholder má několik barevných variant odvozených z `slug`, aby grid
 * nepůsobil jako 48 identických dlaždic — pořád jde o náš vlastní
 * dekorativní prvek, ne o cizí artwork.
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

  return (
    <div
      role="img"
      aria-label={`${name} — cover zatím chybí`}
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${paletteFor(slug)} shadow-[inset_0_0_30px_rgba(0,0,0,0.35)] ${className}`}
    >
      {/* Jemný světelný akcent nahoře — "hladina" — ať placeholder
          nepůsobí jako prázdný šedý blok. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent"
      />
      <FishSilhouette className="pointer-events-none absolute -bottom-2 -right-2 h-20 w-20 -rotate-6 text-amber-300/15 motion-reduce:rotate-0" />
      <span
        aria-hidden="true"
        className="font-serif text-5xl font-bold text-[#f4ead9]/85 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
      >
        {initial}
      </span>
    </div>
  );
}
