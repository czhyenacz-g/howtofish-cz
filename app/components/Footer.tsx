import Link from "next/link";
import { DISCLAIMER, NAV_LINKS, SITE_NAME } from "../config/site";

export default function Footer({ basePath = "" }: { basePath?: string }) {
  return (
    <footer className="border-t border-gray-800 bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-gray-400">
        <p className="max-w-2xl">{DISCLAIMER}</p>
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
        <p className="mt-6 font-serif text-xs text-gray-500">
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}
