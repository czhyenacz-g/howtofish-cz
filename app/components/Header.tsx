import Link from "next/link";
import { NAV_LINKS, SITE_NAME } from "../config/site";

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-900/95">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-bold text-white">
          {SITE_NAME}
        </Link>
        <nav aria-label="Hlavní navigace">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-300">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-amber-400">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
