import Image from "next/image";
import AmbientAudioToggle from "./components/AmbientAudioToggle";
import { DISCLAIMER, LAUNCH_DATE_LABEL, SITE_NAME, STEAM_URL } from "./config/site";

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

      {/* ostrůvek v pozadí — skoro neznatelný drift */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="animate-island-drift pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-40 sm:h-56"
      >
        <polygon points="1000,140 1090,55 1180,140" fill="#e8cfa0" />
        <polygon points="1075,90 1090,55 1095,90" fill="#2f6b4f" />
        <polygon points="1085,80 1090,55 1105,85" fill="#2f6b4f" />
      </svg>

      {/* vlny — přední vrstva houpe jemně rychleji, zadní pomalý drift */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="animate-wave-back pointer-events-none absolute inset-x-0 bottom-0 h-36 w-full text-[#1c8a95] opacity-60 sm:h-52"
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
        className="animate-wave-front pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-[#0c4a56] sm:h-40"
      >
        <polygon
          points="0,140 180,160 360,130 540,170 720,140 900,175 1080,135 1260,165 1440,140 1440,220 0,220"
          fill="currentColor"
        />
      </svg>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-20">
        <h1 className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[520px]">
          <Image
            src="/images/howtofish-main-logo.png"
            alt={SITE_NAME}
            width={1536}
            height={1024}
            priority
            sizes="(max-width: 640px) 320px, (max-width: 768px) 420px, 520px"
            className="h-auto w-full rounded-2xl shadow-2xl shadow-black/40"
          />
        </h1>

        <p className="mt-6 max-w-md text-lg text-cyan-100/90 sm:text-xl">
          Česká encyklopedie ryb a úlovků ze hry How to Fish.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-400/10 px-4 py-2 font-serif text-sm uppercase tracking-wide text-amber-300 sm:text-base">
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
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-4 font-serif text-base text-gray-900 shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 sm:text-lg"
        >
          How to Fish na Steamu
        </a>
      </main>

      <footer className="relative z-10 px-4 pb-6 text-center text-[11px] leading-relaxed text-cyan-100/40 sm:text-xs">
        {DISCLAIMER}
      </footer>

      <AmbientAudioToggle />
    </div>
  );
}
