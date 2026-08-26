import type { IconProps } from "./types";

// Krab — tělo, klepeta a nohy jako jeden tvar, oči jako skutečné díry
// (fillRule evenodd), stejný styl jako ostatní nav ikony (BossIcon apod.).
export default function CrabIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" fillRule="evenodd" aria-hidden="true">
      <path
        d="M6,9 2,5.5 3,10.5 7,11.5 Z
           M18,9 22,5.5 21,10.5 17,11.5 Z
           M12,9 C7.5,9 4.5,11.5 4.5,14.5 C4.5,17.6 7.8,19.5 12,19.5 C16.2,19.5 19.5,17.6 19.5,14.5 C19.5,11.5 16.5,9 12,9 Z
           M2.3,13 5.3,13.6 4.8,15.6 1.8,15.4 Z
           M21.7,13 18.7,13.6 19.2,15.6 22.2,15.4 Z
           M9.3,13.9 A1.1,1.1 0 1,0 11.5,13.9 A1.1,1.1 0 1,0 9.3,13.9 Z
           M12.5,13.9 A1.1,1.1 0 1,0 14.7,13.9 A1.1,1.1 0 1,0 12.5,13.9 Z"
      />
    </svg>
  );
}
