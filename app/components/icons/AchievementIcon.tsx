import type { IconProps } from "./types";

export default function AchievementIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <polygon points="6,3 18,3 15,12 9,12" />
      <rect x="10.5" y="12" width="3" height="3.5" />
      <polygon points="7,19.5 17,19.5 15,17 9,17" />
    </svg>
  );
}
