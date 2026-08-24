import { VERIFICATION_LABEL, type VerificationLevel } from "../../data/fish";

const COLOR: Record<VerificationLevel, string> = {
  "game-confirmed": "text-emerald-400",
  official: "text-emerald-400",
  community: "text-amber-300",
  unverified: "text-cyan-100/50",
};

export default function VerificationBadge({
  level,
  className = "",
}: {
  level: VerificationLevel;
  className?: string;
}) {
  return (
    <span className={`${COLOR[level]} ${className}`}>
      {VERIFICATION_LABEL[level]}
    </span>
  );
}
