import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "../../../lib/auth/current-user";
import FishSuggestionForm from "./FishSuggestionForm";

// Utilitní stránka bez SEO hodnoty — noindex natrvalo (stejně jako
// ostatní "/navrhnout" formuláře).
export const metadata: Metadata = {
  title: "Navrhnout nový úlovek",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NavrhnoutPage() {
  const user = await getCurrentUser();

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-12 text-white">
      <div className="mx-auto max-w-xl">
        <Link
          href="/ryby"
          className="text-sm text-cyan-100/70 underline hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          ← Zpět na encyklopedii úlovků
        </Link>

        <h1 className="mt-4 font-serif text-3xl">Navrhnout nový úlovek</h1>
        <p className="mt-2 text-cyan-100/80">
          Narazil jsi na rybu nebo tvora, kterého v encyklopedii ještě nemáme? Pošli nám návrh — po ověření
          administrátorem ho přidáme.
        </p>

        {!user ? (
          <div className="mt-8 rounded-lg border border-amber-400/40 bg-amber-400/10 p-5 text-center">
            <p className="text-amber-200">Pro návrh nové ryby se přihlas přes Steam.</p>
            <Link
              href="/api/auth/steam/login?returnTo=/ryby/navrhnout"
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-md bg-amber-400 px-6 py-2.5 font-serif text-sm text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Přihlásit přes Steam
            </Link>
          </div>
        ) : user.isBlocked ? (
          <p className="mt-8 text-sm text-cyan-100/50">Tento účet momentálně nemůže navrhovat obsah.</p>
        ) : (
          <div className="mt-8">
            <FishSuggestionForm />
          </div>
        )}
      </div>
    </div>
  );
}
