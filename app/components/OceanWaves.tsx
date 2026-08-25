// Sdílené low-poly vlny — stejné SVG/animace jako na homepage
// (app/page.tsx), jen vytažené do jedné komponenty, aby se nekopírovaly
// na každou stránku zvlášť. Zadní vrstva vyplňuje celou výšku wrapperu,
// přední je jen na ~78 %, což přesně odpovídá poměru původních
// homepage vrstev (h-36/h-28, sm:h-52/sm:h-40) — voláno tak, aby caller
// jen zvolil velikost/pozici wrapperu (absolutně na homepage, jako
// samostatný pruh ve Footeru) a vzhled zůstal všude vizuálně stejný.
// Animace (.animate-wave-back/.animate-wave-front) i
// prefers-reduced-motion jsou definované v app/globals.css.
export default function OceanWaves({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="animate-wave-back absolute inset-x-0 bottom-0 h-full w-full text-[#1c8a95] opacity-60"
      >
        <polygon
          points="0,80 160,110 320,70 480,120 640,90 800,130 960,85 1120,115 1280,75 1440,105 1440,220 0,220"
          fill="currentColor"
        />
      </svg>
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="animate-wave-front absolute inset-x-0 bottom-0 h-[78%] w-full text-[#0c4a56]"
      >
        <polygon
          points="0,140 180,160 360,130 540,170 720,140 900,175 1080,135 1260,165 1440,140 1440,220 0,220"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
