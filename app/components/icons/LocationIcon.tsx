import type { IconProps } from "./types";

export default function LocationIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" fillRule="evenodd" aria-hidden="true">
      <path
        d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Z
           M9.4,10 A2.6,2.6 0 1,0 14.6,10 A2.6,2.6 0 1,0 9.4,10 Z"
      />
    </svg>
  );
}
