import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "../../../../lib/auth/current-user";
import CorrectionForm from "../../../components/community/CorrectionForm";
import { submitItemCorrectionAction } from "./actions";
import ItemSuggestionForm from "./ItemSuggestionForm";

// Utilitní stránka bez SEO hodnoty — noindex natrvalo, bez ohledu na
// SITE_LAUNCHED (stejně jako /ryby/navrhnout).
export const metadata: Metadata = {
  title: "Navrhnout nový předmět",
  robots: { index: false, follow: false },
};

export default async function NavrhnoutPredmetPage({
  searchParams,
}: {
  searchParams: Promise<{ correction?: string }>;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const correctionTarget = params.correction?.trim();

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-12 text-white">
      <div className="mx-auto max-w-xl">
        <Link
          href="/predmety"
          className="text-sm text-cyan-100/70 underline hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          ← Zpět na předměty
        </Link>

        <h1 className="mt-4 font-serif text-3xl">
          {correctionTarget ? "Navrhnout opravu" : "Navrhnout nový předmět"}
        </h1>
        <p className="mt-2 text-cyan-100/80">
          {correctionTarget
            ? "Něco u tohoto záznamu nesedí? Napiš nám, co se má opravit — administrátor to posoudí."
            : "Narazil jsi na vybavení nebo návnadu, kterou tu ještě nemáme? Pošli nám návrh — po ověření ho přidáme."}
        </p>

        {!user ? (
          <div className="mt-8 rounded-lg border border-amber-400/40 bg-amber-400/10 p-5 text-center">
            <p className="text-amber-200">
              {correctionTarget ? "Pro návrh opravy se přihlas přes Steam." : "Pro návrh nového předmětu se přihlas přes Steam."}
            </p>
            <Link
              href={`/api/auth/steam/login?returnTo=${encodeURIComponent(
                correctionTarget ? `/predmety/navrhnout?correction=${encodeURIComponent(correctionTarget)}` : "/predmety/navrhnout"
              )}`}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-md bg-amber-400 px-6 py-2.5 font-serif text-sm text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Přihlásit přes Steam
            </Link>
          </div>
        ) : user.isBlocked ? (
          <p className="mt-8 text-sm text-cyan-100/50">Tento účet momentálně nemůže navrhovat obsah.</p>
        ) : (
          <div className="mt-8">
            {correctionTarget ? (
              <CorrectionForm target={correctionTarget} action={submitItemCorrectionAction} />
            ) : (
              <ItemSuggestionForm />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
