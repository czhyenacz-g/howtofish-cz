import type { IconProps } from "./types";

// Jednoduchá fajfka pro "Ověřeno" gear badge — stejný stroke styl jako
// ostatní jednoduché ikony v projektu.
export default function CheckIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5L9.5 18L20 6" />
    </svg>
  );
}
