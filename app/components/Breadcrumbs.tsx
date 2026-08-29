import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

// Jednoduchá, znovupoužitelná drobečková navigace pro nové SEO stránky
// (/navody/jak-chytit-*, /navody/kde-najit-*, /stream/[creator]) — na
// webu dřív žádná neexistovala. JSON-LD BreadcrumbList se generuje
// zvlášť přes buildBreadcrumbJsonLd (stejná data, žádná duplicitní logika).
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Drobečková navigace" className="text-sm text-cyan-100/60">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="underline hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-cyan-100/80">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[], siteUrl: string, currentUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteUrl}${item.href}` : currentUrl,
    })),
  };
}
