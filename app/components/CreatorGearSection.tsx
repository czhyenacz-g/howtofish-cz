import type { CreatorGearItem } from "../../data/creator-gear.ts";
import { getGearCategoryLabel } from "../../lib/creators/gear-categories.ts";
import GearAffiliateCta from "./GearAffiliateCta.tsx";

// "Technika streamera" sekce na /streameri/[slug] (viz zadání). `gear`
// sem přichází už přefiltrovaný přes getPublicGearForCreator (jen
// verified/historical, active) — tahle komponenta se stará jen o
// vykreslení, ne o to, co smí být veřejné.
export default function CreatorGearSection({ gear }: { gear: CreatorGearItem[] }) {
  // Žádný "techniku zatím neznáme" dead placeholder — bez gearu se
  // sekce vůbec nevykreslí (viz zadání bod 17).
  if (gear.length === 0) return null;

  const allHistorical = gear.every((item) => item.confidence === "historical");

  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl text-amber-300">{allHistorical ? "Technika, kterou používal/a" : "Technika a vybavení"}</h2>
      <p className="mt-1 text-xs text-cyan-100/50">
        Některé odkazy jsou affiliate. Pokud přes ně nakoupíš, můžeme získat provizi bez navýšení ceny pro tebe.
      </p>
      {/* Jeden grid pro verified i historical (ne dvě oddělené sekce) —
          u malého počtu položek je to vizuálně čistší, historical je
          jasně odlišené badge + větou na kartě, viz zadání bod 4. */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {gear.map((item) => (
          <GearCard key={`${item.creatorSlug}-${item.productName}`} item={item} />
        ))}
      </div>
    </section>
  );
}

function GearCard({ item }: { item: CreatorGearItem }) {
  const sourceYear = item.sourceDate?.slice(0, 4);
  const isHistorical = item.confidence === "historical";

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100/50">{getGearCategoryLabel(item.category)}</p>
        {/* Badge je textový, ne jen barevný signál (viz zadání bod 24). */}
        {isHistorical && (
          <span className="shrink-0 rounded border border-cyan-100/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-100/70">
            historické
          </span>
        )}
      </div>
      <p className="mt-1 font-serif text-base text-white">
        {item.brand && !item.productName.startsWith(item.brand) ? `${item.brand} ` : ""}
        {item.productName}
      </p>
      {/* Nikdy "používá" u historical — jen "dříve používal/a" (viz zadání bod 4). */}
      {isHistorical && <p className="mt-1 text-xs text-cyan-100/50">dříve používal/a</p>}
      {item.note && <p className="mt-1 text-sm text-cyan-100/70">{item.note}</p>}
      <GearAffiliateCta item={item} />
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-xs text-cyan-100/50 underline hover:text-amber-300"
      >
        {sourceYear ? `Zdroj z roku ${sourceYear}` : "Zdroj"}
      </a>
    </div>
  );
}
