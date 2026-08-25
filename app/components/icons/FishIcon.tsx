import type { IconProps } from "./types";

export default function FishIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <polygon points="1,12 9,7 9,17" />
      <polygon points="9,7 23,10.5 23,13.5 9,17" />
    </svg>
  );
}
