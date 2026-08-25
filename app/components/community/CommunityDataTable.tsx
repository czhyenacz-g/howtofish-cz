import Link from "next/link";
import type { CommunityContentBase } from "../../../lib/universal-content-api/types";
import AuthorBadge from "./AuthorBadge";
import CommunityThumbnail from "./CommunityThumbnail";

// Reusable tabulkový základ pro /predmety, /bossove, /lokace, /navody —
// desktop tabulka / mobil karty. Obrázek + název + autor + stav jsou
// vždy stejné (CommunityContentBase), doménově specifické sloupce si
// každá stránka předává přes `columns` (desktop) a `cardSubtitle`
// (mobil) — žádný jeden obří komponent s podmínkami podle "type".
export type CommunityColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
};

export default function CommunityDataTable<T extends CommunityContentBase>({
  rows,
  columns,
  cardSubtitle,
  emptyMessage,
  correctionHref,
  linkHref,
}: {
  rows: T[];
  columns: CommunityColumn<T>[];
  cardSubtitle: (row: T) => (string | undefined)[];
  emptyMessage: string;
  // Nenápadná akce "Navrhnout opravu" u veřejných (ne pending) řádků —
  // vrať undefined, pokud se pro daný řádek nemá zobrazit.
  correctionHref?: (row: T) => string | undefined;
  // Volitelný odkaz na detail (např. návody mají /navody/[slug]).
  linkHref?: (row: T) => string | undefined;
}) {
  if (rows.length === 0) {
    return <p className="mt-10 text-center text-cyan-100/60">{emptyMessage}</p>;
  }

  return (
    <div className="mt-8">
      <div className="hidden overflow-hidden rounded-lg border border-white/10 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-cyan-100/50">
            <tr>
              <th className="w-24 px-4 py-2" aria-hidden="true" />
              <th className="px-4 py-2">Název</th>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-2">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-2">Přidal</th>
              <th className="w-32 px-4 py-2" aria-hidden="true" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => {
              const href = linkHref?.(row);
              const correction = !row.pending ? correctionHref?.(row) : undefined;
              return (
                <tr key={row.id} className={row.pending ? "bg-amber-400/5" : "hover:bg-white/5"}>
                  <td className="px-4 py-3">
                    <CommunityThumbnail imageUrl={row.imageUrl} alt={row.title} />
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {href ? (
                      <Link href={href} className="hover:text-amber-300 hover:underline">
                        {row.title}
                      </Link>
                    ) : (
                      row.title
                    )}
                    {row.pending && <PendingBadge className="mt-1" />}
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-cyan-100/70">
                      {c.render(row)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <AuthorBadge authorName={row.authorName} source={row.source} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {correction && (
                      <Link
                        href={correction}
                        className="text-xs text-cyan-100/50 underline hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        Navrhnout opravu
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const href = linkHref?.(row);
          const correction = !row.pending ? correctionHref?.(row) : undefined;
          const subtitle = cardSubtitle(row).filter((v): v is string => Boolean(v));

          const cardBody = (
            <>
              <CommunityThumbnail imageUrl={row.imageUrl} alt={row.title} />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-white">{row.title}</p>
                {subtitle.length > 0 && (
                  <p className="mt-0.5 truncate text-xs text-cyan-100/60">{subtitle.join(" · ")}</p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <AuthorBadge authorName={row.authorName} source={row.source} />
                  {row.pending && <PendingBadge />}
                </div>
                {row.pending && (
                  <p className="mt-1 text-xs italic text-amber-200/80">Tento návrh vidíš jen ty.</p>
                )}
                {correction && (
                  <Link
                    href={correction}
                    className="mt-1 inline-block text-xs text-cyan-100/50 underline hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    Navrhnout opravu
                  </Link>
                )}
              </div>
            </>
          );

          const cardClass = `flex gap-3 rounded-lg border p-3 ${
            row.pending ? "border-amber-400/40 bg-amber-400/5" : "border-white/10 bg-[#0e3347]/60"
          }`;

          return href ? (
            <Link key={row.id} href={href} className={`${cardClass} transition hover:border-amber-400/40`}>
              {cardBody}
            </Link>
          ) : (
            <div key={row.id} className={cardClass}>
              {cardBody}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PendingBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block w-fit rounded border border-amber-300 bg-amber-400 px-1.5 py-0.5 font-serif text-[10px] uppercase tracking-wide text-gray-900 ${className}`}
    >
      Čeká na schválení
    </span>
  );
}
