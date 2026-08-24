import { DISCLAIMER, LAUNCH_DATE_LABEL, STEAM_URL } from "./config/site";

function FishIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <polygon points="0,16 14,4 14,28" />
      <polygon points="14,4 40,10 40,22 14,28" />
      <circle cx="34" cy="13" r="2" fill="#0a2e42" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] text-white">
      {/* sluníčko */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-amber-300/70 blur-2xl sm:top-14 sm:h-44 sm:w-44"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-14 h-16 w-16 -translate-x-1/2 rounded-full bg-amber-200 sm:top-20 sm:h-24 sm:w-24"
      />

      {/* ostrůvek v pozadí */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-40 sm:h-56"
      >
        <polygon points="1000,140 1090,55 1180,140" fill="#e8cfa0" />
        <polygon points="1075,90 1090,55 1095,90" fill="#2f6b4f" />
        <polygon points="1085,80 1090,55 1105,85" fill="#2f6b4f" />
      </svg>

      {/* vlny */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36 w-full text-[#1c8a95] opacity-60 sm:h-52"
      >
        <polygon
          points="0,80 160,110 320,70 480,120 640,90 800,130 960,85 1120,115 1280,75 1440,105 1440,220 0,220"
          fill="currentColor"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-[#0c4a56] sm:h-40"
      >
        <polygon
          points="0,140 180,160 360,130 540,170 720,140 900,175 1080,135 1260,165 1440,140 1440,220 0,220"
          fill="currentColor"
        />
      </svg>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:py-24">
        <h1 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <FishIcon className="h-9 w-9 shrink-0 text-amber-400 sm:h-12 sm:w-12" />
          <span className="-rotate-1 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            How to Fish
          </span>
          <span className="rotate-3 rounded-full bg-amber-400 px-2.5 py-1 text-sm font-extrabold text-gray-900 sm:text-base">
            CZ
          </span>
        </h1>

        <p className="mt-5 max-w-md text-lg text-cyan-100/90 sm:text-xl">
          Česká encyklopedie ryb a úlovků ze hry How to Fish.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-400/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-amber-300 sm:text-base">
          Spouštíme {LAUNCH_DATE_LABEL}
        </div>

        <p className="mt-6 max-w-sm text-sm text-cyan-100/70 sm:text-base">
          Připravujeme české návody, přehled ryb, úlovků, lokací a dalších
          informací ze hry How to Fish.
        </p>

        <a
          href={STEAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-4 text-base font-bold text-gray-900 shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 sm:text-lg"
        >
          How to Fish na Steamu
        </a>
      </main>

      <footer className="relative z-10 px-4 pb-6 text-center text-[11px] leading-relaxed text-cyan-100/40 sm:text-xs">
        {DISCLAIMER}
      </footer>
    </div>
  );
}
