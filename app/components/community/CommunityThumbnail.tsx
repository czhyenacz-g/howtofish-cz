"use client";

import { useState } from "react";
import Image from "next/image";
import ImageLightbox from "../ImageLightbox";

// Malý thumbnail (72–80px) — klik otevře existující lightbox (stejný
// jako u komunitních úlovků, žádná nová knihovna). Bez obrázku ukazuje
// konzistentní low-poly "?" placeholder, nikdy vymyšlený obsahový obrázek.
export default function CommunityThumbnail({ imageUrl, alt }: { imageUrl?: string; alt: string }) {
  const [open, setOpen] = useState(false);

  if (!imageUrl) {
    return (
      <div
        aria-hidden="true"
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#0a2438] font-serif text-xl text-cyan-100/25 sm:h-[72px] sm:w-[72px]"
      >
        ?
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Zobrazit obrázek – ${alt}`}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-white/10 transition hover:border-amber-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:h-[72px] sm:w-[72px]"
      >
        <Image src={imageUrl} alt="" fill sizes="72px" className="object-cover" />
      </button>
      {open && <ImageLightbox src={imageUrl} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}
