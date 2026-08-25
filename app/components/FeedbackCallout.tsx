"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FeedbackEmailButton from "./FeedbackEmailButton";
import { MessageBottleIcon } from "./icons";

// Jen nickname, nikdy celý CurrentUser (steamId apod. sem nepatří) —
// email se sestavuje výhradně uvnitř FeedbackEmailButton, který se
// renderuje jen v této (přihlášené) větvi, takže se u anonymního
// návštěvníka vůbec neobjeví v SSR HTML.
export default function FeedbackCallout({ user }: { user: { nickname: string } | null }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-lg border border-amber-400/30 bg-[#0e3347]/60 p-6 text-center sm:p-8">
        <MessageBottleIcon className="mx-auto h-10 w-10 text-amber-300" />
        <h2 className="mt-3 font-serif text-xl text-white">Chybí ti tu něco?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-cyan-100/70">
          Našel jsi chybu nebo nám něco chybí? Dej nám vědět.
        </p>

        {user ? (
          <div className="mt-5">
            <FeedbackEmailButton nickname={user.nickname} pathname={pathname} />
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-sm text-cyan-100/70">Chceš nám něco doplnit? Přihlas se přes Steam.</p>
            <Link
              href={`/api/auth/steam/login?returnTo=${encodeURIComponent(pathname)}`}
              className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-amber-400 px-6 py-2.5 font-serif text-sm text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:w-auto"
            >
              Přihlásit přes Steam
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
