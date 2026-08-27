"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { isExternalHref } from "../../lib/promotions/match-route";

type AffiliateBannerProps = {
  imageSrc: string;
  // Affiliate odkazy zatím nejsou vždy hotové — bez href se banner
  // zobrazí normálně, jen jako neklikací obrázek (viz zadání). Jakmile
  // admin href v promotion doplní, banner se sám stane klikací.
  href?: string;
  title: string;
  className?: string;
  // Voláno SYNCHRONNĚ při kliknutí na skutečný odkaz (ne při renderu) —
  // typicky markPromotionClicked z clicked-promotions.ts, viz
  // AffiliateBannerSlot.tsx. Žádný preventDefault, ať middle-click,
  // Ctrl/Cmd+click i target="_blank" fungují normálně.
  onClick?: () => void;
};

export default function AffiliateBanner({ imageSrc, href, title, className = "", onClick }: AffiliateBannerProps) {
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
      {/* title je pořád v alt/aria-label výše — vizuální popisek pod
          bannerem je záměrně skrytý (viz zadání), ne odstraněný. */}
      <p className="sr-only">{title}</p>
    </>
  );

  // Značka pro seller-callout koordinaci (viz useBannerVisible.ts) — seller
  // se nesmí zobrazit přes viditelný banner. AdPlaceholder tenhle atribut
  // záměrně nemá (není to skutečná reklama).
  if (!href) {
    return (
      <div
        data-promotion-banner="true"
        className={`block overflow-hidden rounded-lg border border-amber-300/20 bg-gradient-to-br from-[#0e4f66] via-[#146b78] to-[#1c8a95] p-3 ${className}`}
      >
        {content}
      </div>
    );
  }

  const linkClassName = `group block overflow-hidden rounded-lg border border-amber-300/20 bg-gradient-to-br from-[#0e4f66] via-[#146b78] to-[#1c8a95] p-3 transition duration-150 hover:-translate-y-0.5 hover:border-amber-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${className}`;

  // Interní promotion (např. soutěž vedoucí na /hra) není affiliate reklama —
  // normální client-side navigace, žádný target="_blank"/rel="sponsored"
  // (viz zadání). Rozlišeno stejně jako u sellera, viz resolve-callout.ts.
  if (!isExternalHref(href)) {
    return (
      <Link
        href={href}
        aria-label={title}
        data-promotion-banner="true"
        onClick={onClick}
        className={linkClassName}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={title}
      data-promotion-banner="true"
      onClick={onClick}
      className={linkClassName}
    >
      {content}
    </a>
  );
}
