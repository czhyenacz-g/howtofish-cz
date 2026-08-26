import Link from "next/link";
import { DISCLAIMER, NAV_LINKS, SITE_NAME } from "../config/site";
import { buildFeedbackEmail } from "./feedback-email";
import OceanWaves from "./OceanWaves";

const SECONDARY_LINKS = [
  { href: "/o-hre", label: "O hře" },
  { href: "/pravni-informace", label: "Právní informace" },
  { href: "/ochrana-soukromi", label: "Ochrana soukromí" },
] as const;

export default function Footer({ basePath = "" }: { basePath?: string }) {
  return (
    <footer className="border-t border-gray-800 bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-gray-400">
        <p className="max-w-2xl">{DISCLAIMER}</p>
        {/* Vlastní, výraznější místo pro Multiplayer ostrov — do hlavní
            xl:block pill-navigace v Headeru se už nevejde (9 položek bez
            flex-wrap), ale funkce má být dobře viditelná, viz zadání. */}
        <Link
          href={`${basePath}/multiplayer`}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 font-serif text-amber-300 transition hover:bg-amber-400/20"
        >
          🏝️ Multiplayer ostrov — najdi spoluhráče
        </Link>
        <nav aria-label="Navigace v patičce" className="mt-4">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 font-serif">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={`${basePath}${link.href}`} className="underline hover:text-amber-400">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Doplňkové odkazy v patičce" className="mt-3">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
            {SECONDARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={`${basePath}${link.href}`} className="underline hover:text-amber-400">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${buildFeedbackEmail()}`} className="underline hover:text-amber-400">
                Kontakt
              </a>
            </li>
          </ul>
        </nav>
        <p className="mt-6 font-serif text-xs text-gray-500">
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>

      {/* Stejné low-poly vlny jako na homepage — vlastní pruh s
          oceánovým gradientem, aby seděly i na jinak neutrálním pozadí
          patičky obsahových stránek. */}
      <div className="relative h-14 w-full overflow-hidden bg-gradient-to-b from-[#0e4f66] to-[#146b78] sm:h-20">
        <OceanWaves className="absolute inset-x-0 bottom-0 h-full w-full" />
      </div>
    </footer>
  );
}
