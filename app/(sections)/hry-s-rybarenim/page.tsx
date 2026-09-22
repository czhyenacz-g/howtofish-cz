import type { Metadata } from "next";
import AdSlot from "../../components/AdSlot";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../../components/Breadcrumbs.tsx";
import GameCard from "../../components/GameCard";
import { SITE_URL } from "../../config/site";
import { getGamesWithDetail, getOrderedGames } from "../../../data/games";
import GameSuggestForm from "./GameSuggestForm";
import RotatingQuote, { type RotatingQuoteItem } from "../../components/RotatingQuote.tsx";

const PATHNAME = "/hry-s-rybarenim";
const TITLE = "Hry, ve kterých se rybaří | HowToFish.cz";
const DESCRIPTION =
  "Objev hry, ve kterých se dá rybařit. Minecraft, Stardew Valley, Pokémon, Sea of Thieves, Fishing Planet a desítky dalších her s rybařením.";

// Citáty v hero sekci — střídají se jemným fade efektem (viz
// RotatingQuote.tsx), pořadí je pevné, ne náhodné.
const QUOTES: RotatingQuoteItem[] = [
  { text: "Pamatuješ na Old Rod, se kterým jsi pořád tahal Magikarpy?" },
  { text: "Kolik hodin jsi strávil u Fishing Pond místo zachraňování Hyrule?" },
  { text: "Ve Stardew Valley jsi šel pro jednu rybu. Vrátil ses za tři hodiny." },
  { text: "V Minecraftu jsi chtěl rybu. Vytáhl jsi enchanted book." },
  { text: "Noctis možná zachraňoval svět, ale stejně nejradši rybařil." },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATHNAME },
  openGraph: {
    images: [{ url: `/api/og?title=${encodeURIComponent("Hry, ve kterých se rybaří")}`, width: 1200, height: 630 }],
  },
};

export default function HrySRybarenimPage() {
  const games = getOrderedGames();
  const gamesWithDetail = getGamesWithDetail();

  const breadcrumbItems = [{ label: "HowToFish.cz", href: "/" }, { label: "Hry, ve kterých se rybaří" }];
  const pageUrl = `${SITE_URL}${PATHNAME}`;

  // ItemList odpovídá skutečnému obsahu stránky; `url` mají jen hry,
  // které na webu opravdu mají cílovou stránku (viz hasDetail/detailHref)
  // — u ostatních by odkaz na neexistující detail byl jen šum.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: pageUrl,
    itemListElement: games.map((game, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: game.name,
      ...(game.detailHref ? { url: `${SITE_URL}${game.detailHref}` } : {}),
    })),
  };

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#081c2c] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems, SITE_URL, pageUrl)) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <Breadcrumbs items={breadcrumbItems} />

        {/* --- HERO --- */}
        <div className="mx-auto mt-6 max-w-3xl text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">Hry, ve kterých se rybaří 🎣</h1>
          <p className="mt-4 text-base text-cyan-100/85 sm:text-lg">
            Od Minecraftu přes Stardew Valley až po Pokémony. Vybíráme hry, kde je rybaření důležitou mechanikou,
            minihrou nebo nezapomenutelnou součástí zážitku.
          </p>
        </div>

        <div className="mt-6">
          <RotatingQuote quotes={QUOTES} />
        </div>

        <div className="mt-8">
          <AdSlot pathname={PATHNAME} />
        </div>

        {/* --- TOP 50 --- */}
        <section className="mt-12" aria-labelledby="top-50">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="top-50" className="font-serif text-2xl sm:text-3xl">
              Top {games.length} her s rybařením
            </h2>
            <p className="text-xs text-cyan-100/50">
              Pracovní katalog — pořadí není žebříček kvality.
            </p>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-cyan-100/70">
            U každé hry vidíš, jak velkou roli v ní rybaření hraje a jestli už k ní máme vlastní obsah. Další hry
            postupně doplňujeme — od her, kde je rybaření jádrem, po ty, kde je milou vzpomínkou.
          </p>

          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {games.map((game) => (
              <li key={game.slug}>
                <GameCard entry={game} />
              </li>
            ))}
          </ul>
        </section>

        {/* --- CTA: CHYBÍ TU TVOJE HRA? --- */}
        <section
          aria-labelledby="chybi-hra"
          className="mt-14 rounded-2xl border border-amber-400/30 bg-[#0e3347]/70 p-6 sm:p-8"
        >
          <h2 id="chybi-hra" className="font-serif text-2xl">
            Chybí tu tvoje oblíbená hra?
          </h2>
          <p className="mt-2 max-w-2xl text-cyan-100/80">
            Znáš hru, ve které se dá rybařit, ale v seznamu ji nevidíš? Napiš nám ji.
          </p>
          <div className="mt-6 max-w-xl">
            <GameSuggestForm />
          </div>
          {gamesWithDetail.length > 0 && (
            <p className="mt-6 text-xs text-cyan-100/50">
              Zatím máme vlastní obsah jen u {gamesWithDetail.length === 1 ? "jedné hry" : `${gamesWithDetail.length} her`} z
              katalogu — u ostatních na něm pracujeme.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
