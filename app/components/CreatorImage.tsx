"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CreatorProfile } from "../../data/creators.ts";
import { getCreatorImageChain } from "../../lib/creators/creator-image.ts";
import CreatorAvatar from "./CreatorAvatar.tsx";

/**
 * Nahrazuje čistě dekorativní iniciálový kruh na kartách tvůrců
 * (CreatorCard.tsx — katalog /streameri i homepage sekce Streameři)
 * reálným obrázkem, když existuje (pořadí priorit viz
 * lib/creators/creator-image.ts). `children` je zbytek hlavičky karty
 * (jméno/vlajka/platform badge) — komponenta sama rozhoduje o layoutu
 * (video = 16:9 banner nahoře, jinak kompaktní kruh vedle jména), takže
 * tahle logika nežije duplicitně v CreatorCard.
 *
 * "use client" jen kvůli onError fallback řetězci — žádný network
 * request navíc, URL se skládá čistě z existujících dat. Řetězec má
 * vždy garantovaný konec (`"initial"` bez `src`), takže onError nikdy
 * nezacyklí.
 */
export default function CreatorImage({ creator, children }: { creator: CreatorProfile; children: ReactNode }) {
  const chain = useMemo(() => getCreatorImageChain(creator), [creator]);
  const [index, setIndex] = useState(0);
  const current = chain[Math.min(index, chain.length - 1)];

  function advance() {
    setIndex((i) => Math.min(i + 1, chain.length - 1));
  }

  if (current.type === "video") {
    return (
      <>
        {/* Bleed přes padding karty (viz CreatorCard.tsx p-4/sm:p-5) —
            záporný margin jen top/left/right, spodek řeší parent gap. */}
        <div className="-mx-4 -mt-4 aspect-video overflow-hidden bg-white/5 sm:-mx-5 sm:-mt-5">
          {/* eslint-disable-next-line @next/next/no-img-element -- externí YouTube CDN thumbnail, next/image by vyžadoval remotePatterns navíc (stejný vzorec jako LazyYouTubeEmbed.tsx) */}
          <img src={current.src} alt={current.alt} loading="lazy" onError={advance} className="h-full w-full object-cover" />
        </div>
        <div className="flex items-center gap-3">{children}</div>
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {current.type === "initial" ? (
        <CreatorAvatar name={creator.name} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- malý avatar/fallback náhled, next/image by přidával zbytečnou optimalizaci pro tuhle velikost
        <img
          src={current.src}
          alt={current.alt}
          loading="lazy"
          onError={advance}
          className="h-14 w-14 shrink-0 rounded-full border border-white/10 object-cover"
        />
      )}
      {children}
    </div>
  );
}
