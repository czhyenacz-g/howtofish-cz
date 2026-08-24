import type { Metadata } from "next";
import Link from "next/link";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "../config/site";

// Prefix pro interní odkazy na této stránce. Až se /demo přesune na /,
// stačí smazat tuhle jednu konstantu.
const BASE = "/demo";

export const metadata: Metadata = {
  title: "Demo",
  description: SITE_DESCRIPTION,
};

const SECTION_CARDS = [
  {
    href: `${BASE}/navody`,
    label: "Návody",
    text: "Postupy pro začátečníky i pokročilé rybáře.",
  },
  {
    href: `${BASE}/ryby`,
    label: "Ryby",
    text: "Přehled druhů ryb a jak je chytit.",
  },
  {
    href: `${BASE}/predmety`,
    label: "Předměty",
    text: "Vybavení, návnady a jejich využití.",
  },
  {
    href: `${BASE}/bossove`,
    label: "Bossové",
    text: "Taktiky na souboje s bossy.",
  },
  {
    href: `${BASE}/lokace`,
    label: "Lokace",
    text: "Mapy a popisy jednotlivých lovišť.",
  },
  {
    href: `${BASE}/achievementy`,
    label: "Achievementy",
    text: "Seznam úspěchů a jak je splnit.",
  },
] as const;

export default function DemoHome() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold">{SITE_TAGLINE}</h1>
        <p className="text-gray-400">{SITE_DESCRIPTION}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {SECTION_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-gray-800 bg-gray-800/40 p-5 transition hover:border-amber-400"
          >
            <h2 className="mb-1 font-semibold text-amber-400">{card.label}</h2>
            <p className="text-sm text-gray-400">{card.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
