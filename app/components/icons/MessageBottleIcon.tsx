import type { IconProps } from "./types";

export default function MessageBottleIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <polygon points="9,2 15,2 15,5 17,8 17,21 7,21 7,8" />
      <polygon points="10,9 16,9 16,17 10,17" opacity="0.35" />
      <rect x="10" y="3" width="4" height="2" opacity="0.6" />
    </svg>
  );
}
