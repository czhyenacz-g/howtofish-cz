import type { IconProps } from "./types";

// Dvě postavičky vedle sebe — jednoduchý "spoluhráči" symbol.
export default function MultiplayerIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="8.5" cy="8" r="2.8" />
      <path d="M8.5,12 C5.5,12 3,14 3,17 V19 H14 V17 C14,14 11.5,12 8.5,12 Z" />
      <circle cx="17" cy="7.5" r="2.2" opacity="0.75" />
      <path
        d="M17,11.5 C19.6,11.5 21.6,13.2 21.6,15.6 V18 H15.6 V17 C15.6,15.1 14.7,13.4 13.2,12.2 C14.2,11.8 15.5,11.5 17,11.5 Z"
        opacity="0.75"
      />
    </svg>
  );
}
