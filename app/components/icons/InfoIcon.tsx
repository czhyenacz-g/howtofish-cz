import type { IconProps } from "./types";

// Jednoduché "i" v kruhu pro informační stránku (O hře) — tečka a
// dřík písmene jsou skutečné díry (fillRule evenodd), stejný styl jako
// ostatní nav ikony.
export default function InfoIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" fillRule="evenodd" aria-hidden="true">
      <path
        d="M12,2 A10,10 0 1,0 12,22 A10,10 0 1,0 12,2 Z
           M10.8,7.8 A1.3,1.3 0 1,0 13.4,7.8 A1.3,1.3 0 1,0 10.8,7.8 Z
           M10.6,10.5 H13.4 V18 H10.6 Z"
      />
    </svg>
  );
}
