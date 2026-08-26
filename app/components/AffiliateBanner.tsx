"use client";

import { useState } from "react";
import Image from "next/image";

type AffiliateBannerProps = {
  imageSrc: string;
  // Affiliate odkazy zatím nejsou vždy hotové — bez href se banner
  // zobrazí normálně, jen jako neklikací obrázek (viz zadání). Jakmile
  // admin href v promotion doplní, banner se sám stane klikací.
  href?: string;
  title: string;
  className?: string;
};

export default function AffiliateBanner({ imageSrc, href, title, className = "" }: AffiliateBannerProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const content = imageFailed ? (
    <div className="flex min-h-[100px] flex-col items-center justify-center gap-1 rounded border border-dashed border-amber-300/40 px-4 py-8 text-center">
      <span className="font-serif text-amber-300">{title}</span>
      <span className="text-xs text-cyan-100/60">Odkaz partnera</span>
    </div>
  ) : (
    <>
      <div className="relative w-full overflow-hidden rounded">
        <Image
          src={imageSrc}
          alt={title}
          width={1200}
          height={300}
          className="h-auto w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      </div>
      <p className="mt-2 text-center font-serif text-sm text-amber-300 group-hover:text-amber-200">{title}</p>
    </>
  );

  if (!href) {
    return (
      <div
        className={`block overflow-hidden rounded-lg border border-amber-300/20 bg-gradient-to-br from-[#0e4f66] via-[#146b78] to-[#1c8a95] p-3 ${className}`}
      >
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={title}
      className={`group block overflow-hidden rounded-lg border border-amber-300/20 bg-gradient-to-br from-[#0e4f66] via-[#146b78] to-[#1c8a95] p-3 transition duration-150 hover:-translate-y-0.5 hover:border-amber-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${className}`}
    >
      {content}
    </a>
  );
}
