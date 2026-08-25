import type { IconProps } from "./types";

// Dokument s ohnutým rohem a řádky "patch notes" — roh a řádky jsou
// skutečné díry (fillRule evenodd), takže funguje na libovolném pozadí.
export default function UpdateIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" fillRule="evenodd" aria-hidden="true">
      <path
        d="M6,2 H15 L19,6 V22 H6 Z
           M15,2 L15,6 L19,6 Z
           M8,10 H16 V11.4 H8 Z
           M8,13 H16 V14.4 H8 Z
           M8,16 H13 V17.4 H8 Z"
      />
    </svg>
  );
}
