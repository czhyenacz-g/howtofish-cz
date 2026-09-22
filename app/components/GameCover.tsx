import Image from "next/image";
import FishSilhouette from "./FishSilhouette";

/**
 * Cover karty hry — stejný princip jako FishImage.tsx: dokud nemáme
 * vlastní obrázek, vykreslí se jednotný stylový placeholder (oceánový
 * gradient + vodní silueta + iniciála hry), ne rozbitý obrázek ani cizí
 * hotlink. Jakmile se `image` doplní do data/games.ts, použije se
 * skutečný cover.
 */
export default function GameCover({
  name,
  image,
  className = "",
}: {
  name: string;
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
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0e4f66] via-[#146b78] to-[#1c8a95] shadow-[inset_0_0_30px_rgba(0,0,0,0.35)] ${className}`}
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
