import type { IconProps } from "./types";

export default function SpeakerIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M3,9 H7 L12,4 V20 L7,15 H3 Z" />
      <path
        d="M15.5,8 C18,10 18,14 15.5,16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18,5.5 C22,9 22,15 18,18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
