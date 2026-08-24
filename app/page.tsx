import Link from "next/link";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "./config/site";

const SECTION_CARDS = [
  {
    href: "/navody",
    label: "Návody",
    text: "Postupy pro začátečníky i pokročilé rybáře.",
  },
  {
    href: "/ryby",
    label: "Ryby",
    text: "Přehled druhů ryb a jak je chytit.",
  },
  {
    href: "/predmety",
    label: "Předměty",
    text: "Vybavení, návnady a jejich využití.",
  },
  {
    href: "/bossove",
    label: "Bossové",
    text: "Taktiky na souboje s bossy.",
  },
  {
    href: "/lokace",
    label: "Lokace",
    text: "Mapy a popisy jednotlivých lovišť.",
  },
  {
    href: "/achievementy",
    label: "Achievementy",
    text: "Seznam úspěchů a jak je splnit.",
  },
] as const;

export default function Home() {
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
