"use client";

import { useState } from "react";
import Link from "next/link";
import FishImage from "../../components/FishImage";
import ImageLightbox from "../../components/ImageLightbox";
import CatchUploadForm from "./CatchUploadForm";
import type { CommunityCatch } from "../../../lib/universal-content-api/types";

// caught_at je uložené jako "2026-09-02T08:00:00+02:00" — offset už
// odpovídá lokálnímu času zadanému uživatelem, takže datum/čas čteme
// přímo z řetězce místo přes Date/Intl (to by ho přeformátovalo do
// časové zóny běhu serveru na Vercelu, typicky UTC — přesně čemu se
// chceme vyhnout).
function formatCaughtAt(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, year, month, day, hour, minute] = match;
  return `${parseInt(day, 10)}. ${parseInt(month, 10)}. ${year} v ${hour}:${minute}`;
}

type SectionUser = { nickname: string; avatarUrl: string | null; isBlocked: boolean } | null;

export default function CommunityCatchSection({
  fishSlug,
  fishName,
  isBoss,
  featuredCatch,
  otherCatches,
  user,
}: {
  fishSlug: string;
  fishName: string;
  isBoss?: boolean;
  featuredCatch: CommunityCatch | null;
  otherCatches: CommunityCatch[];
  user: SectionUser;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const returnTo = `/ryby/${fishSlug}`;

  function UploadCta({ label }: { label: string }) {
    if (!user) {
      return (
        <Link
          href={`/api/auth/steam/login?returnTo=${encodeURIComponent(returnTo)}`}
          className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-amber-400/60 bg-amber-400/10 px-4 py-2 font-serif text-sm text-amber-300 transition hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          Přihlásit přes Steam a nahrát úlovek
        </Link>
      );
    }

    if (user.isBlocked) {
      return <p className="text-sm text-cyan-100/50">Tento účet momentálně nemůže nahrávat obsah.</p>;
    }

    return (
      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-amber-400 px-4 py-2 font-serif text-sm text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      >
        {label}
      </button>
    );
  }

  return (
    <>
      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg bg-[#0a2438]">
        {featuredCatch ? (
          <button
            type="button"
            onClick={() => setLightboxUrl(featuredCatch.image.url)}
            className="absolute inset-0 h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            aria-label="Zobrazit úlovek na celou obrazovku"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- uživatelský screenshot s volným poměrem stran, next/image by tu vyžadoval pevné rozměry */}
            <img
              src={featuredCatch.image.url}
              alt={`Úlovek – ${fishName}`}
              className="h-full w-full object-contain"
            />
          </button>
        ) : (
          <FishImage alt={fishName} className="absolute inset-0" />
        )}
        {isBoss && (
          <span className="absolute left-3 top-3 -rotate-2 rounded border border-amber-300 bg-amber-400 px-2.5 py-1 font-serif text-xs uppercase tracking-wide text-gray-900 shadow-sm">
            Boss
          </span>
        )}
        {featuredCatch && (
          <span className="absolute right-3 top-3 rotate-2 rounded border border-amber-300 bg-amber-400 px-2.5 py-1 font-serif text-xs uppercase tracking-wide text-gray-900 shadow-sm">
            První úlovek
          </span>
        )}
      </div>

      {featuredCatch ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div>
            <p className="font-serif text-amber-300">První úlovek na HowToFish.cz</p>
            <p className="text-cyan-100/70">
              Rybář: <span className="font-medium text-white">{featuredCatch.nickname}</span> · chytil{" "}
              {formatCaughtAt(featuredCatch.caughtAt)}
            </p>
            {featuredCatch.note && <p className="mt-1 italic text-cyan-100/60">„{featuredCatch.note}“</p>}
          </div>
          <UploadCta label="Nahraj svůj úlovek" />
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-amber-400/40 bg-amber-400/5 p-4 text-center">
          <p className="font-serif text-amber-300">Máš screenshot? Nahraj první úlovek</p>
          <p className="mt-1 text-xs text-cyan-100/60">Buď první, kdo tuhle rybu ukáže ostatním.</p>
          <p className="text-xs text-cyan-100/50">První schválený screenshot se objeví přímo v encyklopedii.</p>
          <div className="mt-3 flex justify-center">
            <UploadCta label="Nahraj svůj úlovek" />
          </div>
        </div>
      )}

      {formOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Nahrát úlovek"
          onClick={() => setFormOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-amber-300/30 bg-[#0e3347] p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg text-amber-300">Nahraj svůj úlovek</h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Zavřít"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-amber-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                ✕
              </button>
            </div>
            <CatchUploadForm fishSlug={fishSlug} />
          </div>
        </div>
      )}

      {featuredCatch !== null && (
        <section className="mt-8">
          <h2 className="font-serif text-xl text-amber-300">Nejlepší úlovek</h2>
          <p className="mt-2 text-sm text-cyan-100/50">Hodnocení komunity připravujeme.</p>
        </section>
      )}

      {otherCatches.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-xl text-amber-300">Další úlovky rybářů</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {otherCatches.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setLightboxUrl(c.image.url)}
                className="group overflow-hidden rounded-lg border border-white/10 bg-[#0e3347]/60 text-left transition hover:border-amber-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0a2438]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail náhled, celý obrázek je v lightboxu po kliknutí */}
                  <img
                    src={c.image.url}
                    alt={`Úlovek – ${fishName}, ${c.nickname}`}
                    className="h-full w-full object-cover transition duration-150 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 text-sm">
                  <p className="font-medium text-white">{c.nickname}</p>
                  <p className="text-xs text-cyan-100/60">chytil {formatCaughtAt(c.caughtAt)}</p>
                  {c.note && <p className="mt-1 line-clamp-2 text-xs italic text-cyan-100/50">„{c.note}“</p>}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {lightboxUrl && (
        <ImageLightbox src={lightboxUrl} alt={`Úlovek – ${fishName}`} onClose={() => setLightboxUrl(null)} />
      )}
    </>
  );
}
