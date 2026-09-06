import type { CreatorGearItem, PublicGearConfidence } from "../../data/creator-gear.ts";
import { getGearCategoryLabel } from "../../lib/creators/gear-categories.ts";
import { getGearConfidenceLabel, getGearConfidenceTooltip } from "../../lib/creators/gear-confidence.ts";
import { CheckIcon, ClockIcon, InfoIcon } from "./icons";
import GearAffiliateCta from "./GearAffiliateCta.tsx";

const CONFIDENCE_ORDER: Record<PublicGearConfidence, number> = { verified: 0, historical: 1, estimated: 2 };

const CONFIDENCE_ICON: Record<PublicGearConfidence, typeof CheckIcon> = {
  verified: CheckIcon,
  historical: ClockIcon,
  estimated: InfoIcon,
};

/**
 * "Technika streamera" sekce na /streameri/[slug] (zadání: rozšíření na
 * všechny profily). `gear` sem přichází už přefiltrovaný přes
 * getPublicGearForCreator (verified/historical/estimated, active) —
 * tahle komponenta se stará jen o vykreslení a pořadí, ne o to, co smí
 * být veřejné.
 *
 * Nadpis/úvod se liší podle toho, jestli má tvůrce aspoň jednu
 * doloženou (verified/historical) položku, nebo jen odhady — hard rule
 * ze zadání bod 22: u čistě odhadovaných profilů se nikde netváříme, že
 * jde o potvrzený setup.
 */
export default function CreatorGearSection({ gear, creatorName }: { gear: CreatorGearItem[]; creatorName: string }) {
  // Žádný "techniku zatím neznáme" dead placeholder — bez gearu se
  // sekce vůbec nevykreslí (viz zadání bod 17).
  if (gear.length === 0) return null;

  const sorted = [...gear].sort((a, b) => CONFIDENCE_ORDER[a.confidence as PublicGearConfidence] - CONFIDENCE_ORDER[b.confidence as PublicGearConfidence]);
  const confirmed = sorted.filter((item) => item.confidence !== "estimated");
  const estimatedItems = sorted.filter((item) => item.confidence === "estimated");
  const hasConfirmed = confirmed.length > 0;
  const hasEstimated = estimatedItems.length > 0;

  const heading = hasConfirmed ? "Setup a technika" : `Jakou techniku může ${creatorName} používat?`;
  const intro = hasConfirmed
    ? "Níže najdeš veřejně doloženou nebo historicky uváděnou techniku spojenou s tímto streamerem."
    : "Přesný setup tohoto streamera se nám nepodařilo veřejně ověřit. Níže jsou orientační produkty odpovídající typu jeho streamování. Nejde o potvrzený seznam používané techniky.";

  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl text-amber-300">{heading}</h2>
      <p className="mt-1 text-sm text-cyan-100/70">{intro}</p>
      <p className="mt-2 text-xs text-cyan-100/50">
        Některé odkazy jsou affiliate. Pokud přes ně nakoupíš, můžeme získat provizi bez navýšení ceny pro tebe.
      </p>

      {hasConfirmed && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {confirmed.map((item) => (
            <GearCard key={`${item.creatorSlug}-${item.productName}`} item={item} />
          ))}
        </div>
      )}

      {/* "Možné alternativy" jen když se odhady mísí s doloženými
          položkami (zadání bod 23) — u čistě odhadovaného profilu je
          celá sekce už jasně orámovaná nadpisem/úvodem výš, druhý
          podnadpis by byl matoucí duplicitní disclaimer. */}
      {hasEstimated && (
        <div className={hasConfirmed ? "mt-6" : "mt-4"}>
          {hasConfirmed && <h3 className="font-serif text-sm text-cyan-100/70">Možné alternativy</h3>}
          <div className={`grid gap-4 sm:grid-cols-2 ${hasConfirmed ? "mt-3" : ""}`}>
            {estimatedItems.map((item) => (
              <GearCard key={`${item.creatorSlug}-${item.productName}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function GearCard({ item }: { item: CreatorGearItem }) {
  const confidence = item.confidence as PublicGearConfidence;
  const sourceYear = item.sourceDate?.slice(0, 4);
  const isHistorical = confidence === "historical";
  const isEstimated = confidence === "estimated";
  const Icon = CONFIDENCE_ICON[confidence];

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100/50">{getGearCategoryLabel(item.category)}</p>
        {/* Badge má text i ikonu, ne jen barvu (zadání bod 24). title = nativní tooltip s plným vysvětlením confidence úrovně. */}
        <span
          title={getGearConfidenceTooltip(confidence)}
          className="inline-flex shrink-0 items-center gap-1 rounded border border-cyan-100/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-100/70"
        >
          <Icon className="h-2.5 w-2.5" />
          {getGearConfidenceLabel(confidence)}
        </span>
      </div>

      <p className="mt-1 font-serif text-base text-white">
        {item.brand && !item.productName.startsWith(item.brand) ? `${item.brand} ` : ""}
        {item.productName}
        {/* Nikdy nevydávat odhad za používanou techniku — přímo v názvu
            karty, ne jen v badge (zadání bod 3, hard rule). */}
        {isEstimated && <span className="text-cyan-100/50"> — odhad</span>}
      </p>

      {/* Nikdy "používá" u historical — jen "dříve používal/a" (zadání bod 4). */}
      {isHistorical && <p className="mt-1 text-xs text-cyan-100/50">dříve používal/a</p>}
      {isEstimated && <p className="mt-1 text-xs text-cyan-100/50">Možná alternativa — ne potvrzený setup.</p>}
      {item.note && <p className="mt-1 text-sm text-cyan-100/70">{item.note}</p>}

      <GearAffiliateCta item={item} />

      {/* U estimated žádný externí source link — jen disclaimer výš (zadání bod 26). */}
      {!isEstimated && item.sourceUrl && (
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-xs text-cyan-100/50 underline hover:text-amber-300"
        >
          {sourceYear ? `Zdroj z roku ${sourceYear}` : "Zdroj"}
        </a>
      )}
    </div>
  );
}
