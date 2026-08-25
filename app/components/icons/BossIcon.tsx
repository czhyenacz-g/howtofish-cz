import type { IconProps } from "./types";

// Lebka — oči a čelist jsou skutečné díry (fillRule evenodd), takže
// prosvítá pozadí tlačítka a ikona funguje na tmavém i světlém stavu.
export default function BossIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" fillRule="evenodd" aria-hidden="true">
      <path
        d="M12 2C7.6 2 4 5.4 4 9.8c0 2.6 1.3 4.6 3 5.9V19l2 2h6l2-2v-3.3c1.7-1.3 3-3.3 3-5.9C20 5.4 16.4 2 12 2Z
           M6.7,9.8 A1.5,1.5 0 1,0 9.7,9.8 A1.5,1.5 0 1,0 6.7,9.8 Z
           M14.3,9.8 A1.5,1.5 0 1,0 17.3,9.8 A1.5,1.5 0 1,0 14.3,9.8 Z
           M9.8,15 12,17.4 14.2,15 Z"
      />
    </svg>
  );
}
