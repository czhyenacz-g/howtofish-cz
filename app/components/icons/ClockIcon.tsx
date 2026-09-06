import type { IconProps } from "./types";

// Hodiny pro "Historické" gear badge (staré/dřívější uvádění, ne
// aktuální stav) — stejný stroke styl jako CheckIcon.
export default function ClockIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7V12L15.5 14" />
    </svg>
  );
}
