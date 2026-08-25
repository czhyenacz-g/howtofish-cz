import Link from "next/link";

// Kompaktní odznak odvozený z hlavní identity (public/images/howtofish-main-logo.png):
// nízkopolygonová rybka + dvoubarevný rybářský splávek (červená/krémová),
// stejné barvy jako zbytek herního UI (tmavě modrá + krémový rámeček).
function HeaderLogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="7" fill="#0a2438" stroke="#e8cfa0" strokeOpacity="0.5" strokeWidth="1.5" />
      <polygon points="7,17 14,12 14,22" fill="#5eead4" />
      <polygon points="14,12 24,14.5 24,19.5 14,22" fill="#2dd4bf" />
      <circle cx="23" cy="9" r="3.2" fill="#ef4444" />
      <path d="M19.8,9 a3.2,3.2 0 0 0 6.4,0 Z" fill="#f4ead9" />
    </svg>
  );
}

// Kompaktní header verze loga — vychází z hlavní homepage grafiky
// (rybka + červeno-krémový splávek + krémový nápis + CZ cedulka
// s barvami vlajky), ale je to vlastní, výrazně zjednodušená horizontální
// sazba stavěná pro malou výšku headeru, ne oříznutý/zmenšený PNG.
export default function HeaderLogo({ basePath = "" }: { basePath?: string }) {
  return (
    <Link
      href={basePath || "/"}
      aria-label="How to Fish CZ — domů"
      className="flex shrink-0 items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
    >
      <HeaderLogoMark className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
      <span className="flex items-center gap-1.5">
        <span className="font-serif text-base leading-none text-[#f4ead9] sm:text-lg">How to Fish</span>
        <span className="hidden flex-col items-center sm:flex">
          <span className="rounded-t border border-b-0 border-[#e8cfa0]/40 bg-[#0a2438] px-1.5 pt-0.5 font-serif text-[10px] font-bold leading-tight tracking-wide text-[#e8cfa0]">
            CZ
          </span>
          <span className="flex h-[3px] w-full overflow-hidden rounded-b border border-t-0 border-[#e8cfa0]/40">
            <span className="flex-1 bg-red-500" />
            <span className="flex-1 bg-white" />
            <span className="flex-1 bg-blue-600" />
          </span>
        </span>
      </span>
    </Link>
  );
}
