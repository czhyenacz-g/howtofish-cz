import type { ContentSource } from "../../../lib/universal-content-api/types";

// Komunitní kredit — "Přidal: {nickname}" pro komunitní záznamy,
// "Přidal: HowToFish.cz" pro kurátorovaný základ. Vizuálně odlišené, ať
// je hned vidět, čí je to zásluha.
export default function AuthorBadge({ authorName, source }: { authorName: string; source: ContentSource }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded px-2 py-0.5 text-xs font-medium ${
        source === "community"
          ? "border border-amber-300/50 bg-amber-400/10 text-amber-300"
          : "bg-white/10 text-cyan-100/60"
      }`}
    >
      Přidal: {authorName}
    </span>
  );
}
