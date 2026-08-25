// Čistě vizuální rezervace místa pro budoucí vodorovný affiliate banner
// — žádný odkaz, žádný tracking, žádná logika. Poměr stran (4:1) je
// schválně stejný jako obrázky v AffiliateBanner (1200×300), aby šlo
// později v layoutu jednoduše vyměnit:
//   <AdPlaceholder /> -> <AffiliateBanner imageSrc="..." href="..." title="..." />
// beze změny okolního layoutu.
export default function AdPlaceholder({
  label = "Reklamní prostor",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex aspect-[4/1] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-amber-300/30 bg-gradient-to-br from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.15]"
      >
        <polygon points="0,100 60,40 130,100" fill="#f4ead9" />
        <polygon points="90,100 170,20 250,100" fill="#e8cfa0" />
        <polygon points="220,100 300,55 400,100" fill="#f4ead9" />
      </svg>

      <div className="relative text-center">
        <p className="font-serif text-sm uppercase tracking-wide text-amber-300/80 sm:text-base">{label}</p>
        <p className="mt-1 text-[11px] text-cyan-100/40 sm:text-xs">budoucí affiliate banner</p>
      </div>
    </div>
  );
}
