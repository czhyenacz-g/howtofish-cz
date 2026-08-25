import type { IconProps } from "./types";

// Nízkopolygonová bedna — tři plochy kostky s tenkými mezerami mezi
// nimi místo barevného stínování (funguje na libovolném pozadí).
export default function ItemIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <polygon points="12,2 21,7 12,12 3,7" />
      <polygon points="3,8.3 11.4,13.1 11.4,22 3,17.2" />
      <polygon points="21,8.3 12.6,13.1 12.6,22 21,17.2" />
    </svg>
  );
}
