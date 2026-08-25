// Vlastní low-poly krab — žádný externí asset. `walking` zapíná
// smyčkovou "běžeckou" animaci (nohy + mírné kývání těla), `hit`/`dying`
// spouští krátké jednorázové animace definované v app/globals.css.
export default function CrabIcon({
  className = "",
  walking = false,
  hit = false,
  dying = false,
}: {
  className?: string;
  walking?: boolean;
  hit?: boolean;
  dying?: boolean;
}) {
  const rootClass = [className, walking ? "animate-crab-walk" : "", hit ? "animate-crab-hit" : "", dying ? "animate-crab-die" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <svg viewBox="0 0 48 32" className={rootClass} aria-hidden="true">
      <g className={walking ? "animate-crab-leg-a" : ""} stroke="#8a2e12" strokeWidth="2.5" strokeLinecap="round">
        <line x1="15" y1="19" x2="6" y2="24" />
        <line x1="16" y1="22" x2="8" y2="29" />
      </g>
      <g className={walking ? "animate-crab-leg-b" : ""} stroke="#8a2e12" strokeWidth="2.5" strokeLinecap="round">
        <line x1="33" y1="19" x2="42" y2="24" />
        <line x1="32" y1="22" x2="40" y2="29" />
      </g>

      <polygon points="9,11 3,4 5,15 11,16" fill="#d9552f" />
      <polygon points="39,11 45,4 43,15 37,16" fill="#d9552f" />

      <ellipse cx="24" cy="17" rx="14" ry="9" fill="#e0653f" />
      <ellipse cx="24" cy="14" rx="11.5" ry="5" fill="#f0805a" opacity="0.55" />

      <line x1="19" y1="10" x2="18" y2="5" stroke="#8a2e12" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="29" y1="10" x2="30" y2="5" stroke="#8a2e12" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18" cy="5" r="2" fill="#1a1a1a" />
      <circle cx="30" cy="5" r="2" fill="#1a1a1a" />
    </svg>
  );
}
