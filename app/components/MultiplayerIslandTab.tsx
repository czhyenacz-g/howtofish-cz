"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCharacterCalloutOpen } from "./useCharacterCalloutOpen";

// Route Multiplayer ostrova (stejná jako odkaz nad footerem, viz
// Footer.tsx) — na ní samotné by tenhle vstupní tab byl zbytečný.
const MULTIPLAYER_ROUTE = "/multiplayer";

const ALT_TEXT = "Multiplayer ostrov – hraj s ostatními";

function isMultiplayerRoute(pathname: string) {
  return pathname === MULTIPLAYER_ROUTE || pathname.startsWith(`${MULTIPLAYER_ROUTE}/`);
}

/**
 * Fixed boční záložka vyčnívající z pravého okraje obrazovky — trvalý,
 * ale nenásilný vstup na Multiplayer ostrov během procházení webu (viz
 * zadání "průběžný vstup", na rozdíl od klasického CTA nad footerem,
 * které zůstává beze změny). Obrázek (UCA asset #45) je navržený přesně
 * pro tenhle účel: průhledné odsazení vlevo + zlatý okraj vpravo, který
 * má "sedět" na hraně viewportu.
 *
 * `imageUrl` přichází jako prop z root layoutu (server-side fetch přes
 * getAssetById(45), viz lib/universal-content-api/assets.ts) — stejný
 * vzor jako `sellerPromotions` u CharacterCallout, protože i tahle
 * komponenta potřebuje `usePathname()` (dostupné až po mountu) na
 * skrytí na /multiplayer.
 */
export default function MultiplayerIslandTab({ imageUrl }: { imageUrl: string | null }) {
  const pathname = usePathname();
  const calloutOpen = useCharacterCalloutOpen();

  // Fallback dle zadání: chybějící/nedostupný asset komponentu jednoduše
  // nevyrenderuje — žádný placeholder, žádný broken image.
  if (!imageUrl) return null;
  if (isMultiplayerRoute(pathname)) return null;

  return (
    <>
      {/* Desktop/tablet: vertikální tab vyčnívající z pravého okraje.
          Idle stav ukazuje jen zlatý okraj a kousek grafiky (translate-x),
          hover/focus vysune celý tab. Když je vysunutý profesor/prodejce
          (calloutOpen), zasune se skoro celý pryč — jen malý proužek
          zůstává klikací, viz zadání bod 8. */}
      <Link
        href={MULTIPLAYER_ROUTE}
        aria-label="Multiplayer ostrov"
        className={`pointer-events-auto fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-l-xl transition-transform duration-300 ease-out hover:translate-x-0 focus-visible:translate-x-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 motion-reduce:transition-none sm:block ${
          // Tablet (sm..lg): užší a víc zasunutý ("méně vysunutý", viz
          // zadání). Desktop (lg+): plná šířka a spodní hranice
          // doporučeného 55-70% rozsahu z bodu 4.
          calloutOpen ? "translate-x-[88%]" : "translate-x-[68%] lg:translate-x-[60%]"
        }`}
      >
        <span className="block w-24 overflow-hidden rounded-l-xl shadow-xl shadow-black/30 ring-1 ring-white/10 lg:w-40">
          <Image
            src={imageUrl}
            alt={ALT_TEXT}
            width={1086}
            height={1448}
            className="h-auto w-full"
            priority={false}
          />
        </span>
      </Link>

      {/* Mobile: kompaktní kulaté tlačítko, jen "ikonová" horní část
          assetu (ostrov + postavičky, bez textu) přes ořez. Nad
          AmbientAudioToggle (bottom-4, po 60px) — viz bottom-24. Pod
          minimalizovanou CharacterCallout "?" bublinou (bottom-44, viz
          CharacterCallout.tsx), ta je schválně výš, aby se nekryla ani
          s tímhle tlačítkem, ani se zvukem. */}
      <Link
        href={MULTIPLAYER_ROUTE}
        aria-label="Multiplayer ostrov"
        title="Multiplayer ostrov"
        className={`pointer-events-auto fixed right-3 bottom-24 z-30 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-amber-300/60 bg-[#0a2438] shadow-lg shadow-black/40 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:hidden ${
          calloutOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={imageUrl}
          alt={ALT_TEXT}
          width={1086}
          height={1448}
          className="absolute -left-[58px] top-0 h-[201px] w-[151px] max-w-none"
        />
      </Link>
    </>
  );
}
