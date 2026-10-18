import { FishIcon } from "./icons";
import RealFishingPromoLink from "./RealFishingPromoLink";
import { REAL_FISHING_PROMO_COPY, type RealFishingPromoPlacement } from "./real-fishing-promo";

/**
 * Interní, nenápadný banner kampaně "první skutečné rybaření" — vede na
 * vlastní obsahovou stránku /prvni-rybareni, NENÍ to affiliate odkaz.
 * Server komponenta (statický obsah), klientský je jen CTA odkaz kvůli
 * měření. Bez popupu, sticky pozice, zvuku i API volání.
 *
 * Pravidlo: max. jeden RealFishingPromo na stránku (hlídá
 * test/real-fishing-promo.test.ts) a nikdy na /prvni-rybareni, právních
 * stránkách ani 404.
 */
export default function RealFishingPromo({
  placement,
  className = "",
}: {
  placement: RealFishingPromoPlacement;
  className?: string;
}) {
  return (
    <aside
      aria-label="První skutečné rybaření"
      className={`rounded-2xl border border-amber-400/30 bg-gradient-to-br from-[#0e3347]/80 via-[#0a2438]/70 to-[#146b78]/40 p-5 text-white sm:p-6 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <FishIcon className="mt-0.5 h-7 w-7 shrink-0 text-amber-300" />
          <div>
            <p className="font-serif text-lg text-amber-300 sm:text-xl">{REAL_FISHING_PROMO_COPY.title}</p>
            <p className="mt-1 text-sm text-cyan-100/80">{REAL_FISHING_PROMO_COPY.text}</p>
          </div>
        </div>
        <RealFishingPromoLink placement={placement} label={REAL_FISHING_PROMO_COPY.cta} />
      </div>
    </aside>
  );
}
