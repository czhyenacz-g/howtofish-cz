import type { IconProps } from "./types";

// Gamepad — křížek a dvě tlačítka jsou skutečné díry (fillRule
// evenodd), takže fungují na libovolném pozadí.
export default function GameIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" fillRule="evenodd" aria-hidden="true">
      <path
        d="M3,9 7,7 17,7 21,9 22,15 19,18 16,15 8,15 5,18 2,15 Z
           M5.3,10 H6.7 V14 H5.3 Z
           M4,11.3 H8 V12.7 H4 Z
           M14.5,9.5 A1,1 0 1,0 16.5,9.5 A1,1 0 1,0 14.5,9.5 Z
           M16.5,11.5 A1,1 0 1,0 18.5,11.5 A1,1 0 1,0 16.5,11.5 Z"
      />
    </svg>
  );
}
