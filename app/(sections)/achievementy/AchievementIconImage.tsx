// Jedna společná lokální SVG ikona pro všechny achievementy (žádné
// Steam CDN URL, žádné per-achievement mapování, žádné next/image
// transformace) — `src` zůstává v typu props kvůli volajícímu
// (AchievementCard.tsx), ale komponenta ho záměrně ignoruje.
export default function AchievementIconImage({}: { src?: string }) {
  return (
    <img
      src="/icons/achievement.svg"
      alt=""
      aria-hidden="true"
      width={56}
      height={56}
      className="h-full w-full object-cover"
    />
  );
}
