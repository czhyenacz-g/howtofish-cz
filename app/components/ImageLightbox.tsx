"use client";

import { useEffect } from "react";

// Jednoduchý lightbox bez knihovny — zvětšený obrázek, zavření přes X,
// Escape nebo klik mimo. Používá se pro komunitní úlovky (viz
// app/ryby/[slug]/CommunityCatchSection.tsx), kde nesmí dojít k oříznutí
// (object-contain), na rozdíl od thumbnail náhledů v galerii.
export default function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- externí uživatelský obsah, celý originál bez ořezu */}
      <img
        src={src}
        alt={alt}
        onClick={(event) => event.stopPropagation()}
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Zavřít"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xl text-white transition hover:border-amber-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      >
        ✕
      </button>
    </div>
  );
}
