import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fishEntries } from "../../../data/fish";
import FishImage from "../../components/FishImage";

export const dynamicParams = false;

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return fishEntries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = fishEntries.find((f) => f.slug === slug);
  if (!entry) return {};

  return {
    title: `${entry.name} – kde ho najít a jak ho chytit`,
    description: entry.shortDescription,
  };
}

const CATEGORY_LABEL = {
  ryba: "Ryba",
  tvor: "Tvor",
} as const;

export default async function FishDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = fishEntries.find((f) => f.slug === slug);

  if (!entry) {
    notFound();
  }

  const basicInfo: { label: string; value: string }[] = [
    { label: "Typ", value: CATEGORY_LABEL[entry.category] },
  ];
  if (entry.locations?.length) {
    basicInfo.push({ label: "Lokalita", value: entry.locations.join(", ") });
  }
  if (entry.rarity) {
    basicInfo.push({ label: "Rarity", value: entry.rarity });
  }
  if (entry.difficulty) {
    basicInfo.push({ label: "Obtížnost", value: `${entry.difficulty} / 5` });
  }
  if (entry.sellPrice !== undefined) {
    basicInfo.push({
      label: "Prodejní cena",
      value:
        typeof entry.sellPrice === "number"
          ? `${entry.sellPrice.toLocaleString("cs-CZ")} $`
          : entry.sellPrice,
    });
  }
  if (entry.bait?.length) {
    basicInfo.push({ label: "Návnada", value: entry.bait.join(", ") });
  }
  if (entry.requiredEquipment?.length) {
    basicInfo.push({
      label: "Potřebné vybavení",
      value: entry.requiredEquipment.join(", "),
    });
  }

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/ryby"
          className="text-sm text-cyan-100/70 underline hover:text-amber-300"
        >
          ← Zpět na encyklopedii úlovků
        </Link>

        <div className="relative mt-4 aspect-[3/1] w-full overflow-hidden rounded-2xl">
          <FishImage image={entry.image} alt={entry.name} className="absolute inset-0" />
          {entry.isBoss && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-gray-900">
              Boss
            </span>
          )}
        </div>

        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
          {entry.name}
          {entry.czechName && (
            <span className="ml-2 text-xl font-normal text-cyan-100/60">
              ({entry.czechName})
            </span>
          )}
        </h1>

        <p className="mt-3 text-lg text-cyan-100/80">{entry.shortDescription}</p>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          <span className={entry.verified ? "text-emerald-400" : "text-amber-300"}>
            {entry.verified
              ? entry.gameVersion
                ? `Ověřeno pro verzi ${entry.gameVersion}`
                : "Ověřeno"
              : "Komunitní informace"}
          </span>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-amber-300">Základní informace</h2>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {basicInfo.map((item) => (
              <div key={item.label} className="flex justify-between gap-4 border-b border-white/10 py-1.5 text-sm">
                <dt className="text-cyan-100/60">{item.label}</dt>
                <dd className="text-right font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {entry.howToCatch && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-amber-300">Jak ho chytit</h2>
            <p className="mt-3 text-cyan-100/80">{entry.howToCatch}</p>
          </section>
        )}

        {entry.tips?.length ? (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-amber-300">Tipy</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-cyan-100/80">
              {entry.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {entry.questUse?.length ? (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-amber-300">Questy a použití</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-cyan-100/80">
              {entry.questUse.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-10 border-t border-white/10 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-100/50">
            Zdroje
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {entry.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-100/70 underline hover:text-amber-300"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
