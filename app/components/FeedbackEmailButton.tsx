"use client";

import { trackClientEvent } from "../../lib/analytics/track-client-event";
import { SITE_URL } from "../config/site";
import { buildFeedbackMailto } from "./feedback-email";

// Tahle komponenta žije jen ve větvi pro přihlášené uživatele (viz
// FeedbackCallout) — email (viz feedback-email.ts) se tak vůbec
// nevyrenderuje pro anonymní návštěvníky. Basic obfuscation, NE
// kryptografická ochrana, jen omezuje nejjednodušší scraping boty.
export default function FeedbackEmailButton({ nickname, pathname }: { nickname: string; pathname: string }) {
  const mailto = buildFeedbackMailto({ nickname, pageUrl: `${SITE_URL}${pathname}` });

  return (
    <a
      href={mailto}
      onClick={() => trackClientEvent("feedback_click", { path: pathname })}
      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-amber-400 px-6 py-2.5 font-serif text-sm text-gray-900 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:w-auto"
    >
      Napsat na HowToFish.cz
    </a>
  );
}
