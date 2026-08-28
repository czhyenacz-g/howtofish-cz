import Link from "next/link";

// Tenký navigační pruh pod AgraelVideoPromo — cíl je jasný: "tohle je
// jedno zajímavé video, ale máme i vlastní stránku se streamy" (viz
// zadání). Záměrně výrazně menší než video promo i soutěžní banner.
export default function LiveStreamsLink() {
  return (
    <Link
      href="/stream"
      className="group flex min-h-[48px] flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-white/10 bg-[#0a2438]/70 px-4 py-2.5 text-sm transition duration-150 hover:border-cyan-400/40 hover:bg-[#0a2438] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <span className="flex items-center gap-2 text-cyan-100/90">
        <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
        Sleduj, kdo právě hraje How to Fish
      </span>
      <span className="flex shrink-0 items-center gap-1 font-semibold text-amber-300 transition duration-150 group-hover:translate-x-0.5">
        Zobrazit živé streamy →
      </span>
    </Link>
  );
}
