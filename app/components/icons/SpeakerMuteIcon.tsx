import type { IconProps } from "./types";

export default function SpeakerMuteIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M3,9 H7 L12,4 V20 L7,15 H3 Z" />
      <path
        d="M15,8 L21,16 M21,8 L15,16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
