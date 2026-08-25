import type { IconProps } from "./types";

// Otevřená kniha — dvě stránky s mezerou u hřbetu, funguje na
// libovolném pozadí (mezera místo barevného kontrastu).
export default function GuideIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M2 4.5 11 6v14L2 18.5V4.5Z" />
      <path d="M22 4.5 13 6v14l9-1.5V4.5Z" />
    </svg>
  );
}
