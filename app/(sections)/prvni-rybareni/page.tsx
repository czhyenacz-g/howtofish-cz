import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../../components/Breadcrumbs";
import StarterKitAffiliateLink from "../../components/StarterKitAffiliateLink";
import { SITE_URL } from "../../config/site";
import {
  AFFILIATE_DISCLOSURE,
  FIRST_FISHING_DESCRIPTION,
  FIRST_FISHING_FAQ,
  FIRST_FISHING_H1,
  FIRST_FISHING_PATH,
  FIRST_FISHING_SOURCES,
  FIRST_FISHING_TITLE,
  FIRST_FISHING_UPDATED_AT,
} from "../../../data/first-fishing";
import { MAX_STARTER_KITS, getStarterKitAffiliateUrl, starterKits } from "../../../data/starter-kits";

// Průvodce prvním skutečným rybařením v ČR (cílová stránka interního
// banneru RealFishingPromo). Statický obsah, žádné API volání. Právní
// údaje a zdroje viz data/first-fishing.ts; startovací sety viz
// data/starter-kits.ts (bez ceny a skladovosti — mění se u prodejce).
// Záměrně BEZ RealFishingPromo (banner nevede sám na sebe) a bez AdSlot
// (vlastní partnerský obsah stačí).

export const metadata: Metadata = {
  title: { absolute: FIRST_FISHING_TITLE },
  description: FIRST_FISHING_DESCRIPTION,
  alternates: { canonical: FIRST_FISHING_PATH },
  openGraph: {
    title: FIRST_FISHING_TITLE,
    description: FIRST_FISHING_DESCRIPTION,
    images: [{ url: `/api/og?title=${encodeURIComponent("První rybaření")}&sub=${encodeURIComponent("HowToFish.cz")}`, width: 1200, height: 630 }],
  },
};

const SECTIONS = [
  { id: "jak-zacit", label: "Jak začít od nuly" },
  { id: "rybarsky-listek", label: "Rybářský lístek" },
  { id: "povolenka", label: "Povolenka k lovu" },
  { id: "bez-listku", label: "Kde bez lístku" },
  { id: "zpusob-lovu", label: "Jaký způsob lovu" },
  { id: "vybaveni", label: "Základní vybavení" },
  { id: "startovaci-set", label: "Startovací set" },
  { id: "dokoupit", label: "Co dokoupit" },
  { id: "chovani", label: "Ryby a příroda" },
  { id: "faq", label: "Časté otázky" },
];

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map((part) => parseInt(part, 10));
  return `${day}. ${month}. ${year}`;
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-12 scroll-mt-6">
      <h2 id={`${id}-h`} className="font-serif text-2xl text-amber-300">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-cyan-100/85">{children}</div>
    </section>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">
      {children}
    </a>
  );
}

export default function PrvniRybareniPage() {
  const pageUrl = `${SITE_URL}${FIRST_FISHING_PATH}`;
  const kits = starterKits.slice(0, MAX_STARTER_KITS);
  const breadcrumbItems = [{ label: "HowToFish.cz", href: "/" }, { label: "První rybaření" }];

  const jsonLd = [
    buildBreadcrumbJsonLd(breadcrumbItems, SITE_URL, pageUrl),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: FIRST_FISHING_H1,
      description: FIRST_FISHING_DESCRIPTION,
      url: pageUrl,
      inLanguage: "cs",
      datePublished: FIRST_FISHING_UPDATED_AT,
      dateModified: FIRST_FISHING_UPDATED_AT,
      author: { "@type": "Organization", name: "HowToFish.cz" },
      publisher: { "@type": "Organization", name: "HowToFish.cz" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FIRST_FISHING_FAQ.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#081c2c] px-4 py-10 text-white sm:py-14">
      {jsonLd.map((entry, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }} />
      ))}

      <article className="mx-auto max-w-3xl">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="mt-6 font-serif text-3xl sm:text-4xl">{FIRST_FISHING_H1}</h1>
        <p className="mt-4 text-lg text-cyan-100/85">
          Ve hrách stačí nahodit a počkat na záběr. U skutečné vody je potřeba vědět pár věcí navíc: kde smíš lovit,
          jaké oprávnění potřebuješ a jakou výbavu si pořídit. Tady je to sepsané pro úplné začátečníky v Česku.
        </p>
        <p className="mt-3 text-xs text-cyan-100/50">
          Aktualizováno {formatDate(FIRST_FISHING_UPDATED_AT)}. Pravidla se mohou měnit — u konkrétní vody vždy platí
          podmínky jejího uživatele nebo provozovatele.
        </p>

        <nav aria-label="Obsah stránky" className="mt-8 rounded-xl border border-white/10 bg-[#0e3347]/60 p-4">
          <p className="font-serif text-sm text-amber-300">Obsah</p>
          <ol className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {SECTIONS.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-cyan-100/80 underline-offset-2 hover:text-amber-300 hover:underline">
                  {index + 1}. {section.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Section id="jak-zacit" title="1. Jak začít rybařit od nuly">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong className="text-white">Vyber si vodu.</strong> Buď rybářský revír (řeky, nádrže a rybníky, které
              spravuje rybářský svaz nebo jiný uživatel revíru), nebo soukromý či komerční rybník s vlastními pravidly.
            </li>
            <li>
              <strong className="text-white">Zařiď si oprávnění.</strong> V revíru potřebuješ rybářský lístek a
              povolenku k lovu. Na soukromé vodě souhlas provozovatele a splnění jeho podmínek.
            </li>
            <li>
              <strong className="text-white">Pořiď si jednoduchou výbavu</strong> pro jeden způsob lovu, ne „na
              všechno“.
            </li>
            <li>
              <strong className="text-white">Poprvé jdi s někým zkušeným</strong> nebo se přidej k rybářskému kroužku
              místní organizace — naučíš se montáže i pravidla rychleji než z videí.
            </li>
          </ol>
        </Section>

        <Section id="rybarsky-listek" title="2. Kdy potřebuji rybářský lístek">
          <p>
            Podle zákona č. 99/2004 Sb. o rybářství musí mít každý, kdo loví v <strong className="text-white">rybářském
            revíru</strong>, u sebe rybářský lístek a (pokud není sám uživatelem revíru) i povolenku k lovu. Rybářský
            revír je úředně vyhlášená vodní plocha — od vyhlášení se odvíjí, jaká pravidla na ní platí.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Lístek vydává <strong className="text-white">obecní úřad</strong> (obce s rozšířenou působností nebo
              pověřený obecní úřad, v Praze příslušná městská část) a platí pro celé Česko.
            </li>
            <li>
              Vydává se na <strong className="text-white">30 dní, 10 let nebo na dobu neurčitou</strong>. Poplatky podle
              MZe: 200 Kč (30 dní), 500 Kč (10 let), 250 Kč (10 let se sníženým poplatkem, např. pro děti do 15 let) a
              1 000 Kč (na dobu neurčitou).
            </li>
            <li>
              Pro <strong className="text-white">první lístek na 10 let nebo na dobu neurčitou</strong> doložíš osvědčení
              o získané kvalifikaci — u Českého rybářského svazu ho dostaneš po zkoušce v místní organizaci.
            </li>
            <li>
              <strong className="text-white">30denní lístek</strong> kvalifikaci nevyžaduje — stačí doklad totožnosti a
              zaplacený poplatek. Hodí se na vyzkoušení, ale sám o sobě lov v revíru nepovoluje — k tomu je potřeba i
              povolenka.
            </li>
          </ul>
        </Section>

        <Section id="povolenka" title="3. Jak funguje povolenka k lovu">
          <p>
            Povolenka je „vstupenka“ do konkrétních revírů. Vydává ji <strong className="text-white">uživatel
            revíru</strong> (u většiny revírů Český nebo Moravský rybářský svaz), zpravidla za úplatu, v papírové nebo
            elektronické podobě. Bez platného rybářského lístku ji nedostaneš.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Český rybářský svaz vydává povolenky <strong className="text-white">celosvazové, územní a místní</strong> a
              zvlášť pro pstruhové a mimopstruhové revíry. Cesta k nim u ČRS vede přes členství v místní organizaci
              (přihláška, zápisné a členský příspěvek).
            </li>
            <li>
              Do povolenky se nesmazatelně zapisuje docházka a úlovky. K povolence patří pravidla revíru: lovné míry,
              doby hájení, denní doba lovu, limity úlovků a povolené způsoby lovu.
            </li>
            <li>
              Při lovu na položenou nebo na plavanou smíš mít nejvýše <strong className="text-white">2 udice</strong>, při
              přívlači nebo muškaření jednu.
            </li>
          </ul>
        </Section>

        <Section id="bez-listku" title="4. Kde lze rybařit bez rybářského lístku">
          <p>
            Zákonná povinnost mít lístek a povolenku se vztahuje na rybářské revíry. Vody, které revírem nejsou —
            soukromé rybníky nebo komerční „sportovní“ rybníky — mají vlastní pravidla, která určuje jejich vlastník nebo
            provozovatel.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Vždy potřebuješ <strong className="text-white">souhlas provozovatele</strong> (obvykle placený lov na den
              nebo na hodiny) a musíš dodržet jeho podmínky.
            </li>
            <li>
              <strong className="text-white">Neplatí</strong>, že na každém soukromém rybníku se smí lovit bez lístku —
              někteří provozovatelé ho vyžadují. A některé vody, které vypadají soukromě, jsou ve skutečnosti
              rybářským revírem.
            </li>
            <li>
              Než vyrazíš, ověř si v{" "}
              <ExtLink href="https://www.rybsvaz.cz/seznam-reviru">seznamu revírů</ExtLink>, jestli voda není revír, a u
              provozovatele, co přesně potřebuješ.
            </li>
          </ul>
        </Section>

        <Section id="zpusob-lovu" title="5. Jaký způsob rybaření je vhodný pro začátečníka">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white">Feeder / method feeder (na položenou):</strong> krmítko s krmením a krátký
              návazec, prut leží na stojánku a záběr ukáže špička prutu. Dobře se učí na rybnících a klidné vodě.
            </li>
            <li>
              <strong className="text-white">Plavaná:</strong> splávek, olůvka a háček s nástrahou. Klasika na drobné a
              kaprovité ryby, potřebuje ale jiný prut a montáž než feeder.
            </li>
            <li>
              <strong className="text-white">Přívlač a muškaření:</strong> lov na umělé nástrahy a mušky — technicky
              náročnější a s vlastními pravidly (např. jen jedna udice). Spíš jako druhý krok.
            </li>
          </ul>
        </Section>

        <Section id="vybaveni" title="6. Jaké základní vybavení potřebuji">
          <ul className="list-disc space-y-2 pl-5">
            <li>Prut a naviják s navinutým vlascem pro zvolený způsob lovu.</li>
            <li>Koncovou montáž: háčky nebo hotové návazce, krmítko nebo splávek a olůvka.</li>
            <li>Nástrahu a krmení (např. červi, kukuřice, pelety, krmítková směs).</li>
            <li>
              Výbavu pro šetrné zacházení s rybou: <strong className="text-white">vyprošťovač háčků</strong>,{" "}
              <strong className="text-white">metr</strong> k měření ryb, často i <strong className="text-white">podběrák</strong>{" "}
              a na některých vodách <strong className="text-white">podložku pod ryby</strong>. Co je povinné, určuje řád
              a podmínky konkrétního revíru nebo provozovatele.
            </li>
            <li>Doklady: rybářský lístek a povolenku (případně potvrzení o zaplaceném lovu na soukromé vodě).</li>
          </ul>
        </Section>

        <Section id="startovaci-set" title="7. Co obsahuje startovací rybářský set">
          <p>
            Startovací set ušetří první výběr: prut, naviják a montáž k sobě sedí. Vybírej ho podle způsobu lovu — set na
            feeder je jiný než set na plavanou nebo přívlač.
          </p>
          <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xs text-cyan-100/70">
            {AFFILIATE_DISCLOSURE}
          </p>
          <ul className="space-y-6">
            {kits.map((kit) => (
              <li key={kit.id} className="rounded-2xl border border-amber-400/30 bg-[#0e3347]/70 p-5 sm:p-6">
                <h3 className="font-serif text-xl text-white">{kit.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-cyan-100/50">Partnerský tip · {kit.merchant}</p>
                <p className="mt-4 text-sm text-cyan-100/85">
                  <strong className="text-white">Pro koho:</strong> {kit.suitableFor}
                </p>
                <p className="mt-2 text-sm text-cyan-100/85">
                  <strong className="text-white">Na co ne:</strong> {kit.notSuitableFor}
                </p>
                <p className="mt-4 text-sm font-semibold text-white">V balení podle popisu prodejce:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-cyan-100/85">
                  {kit.contents.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-cyan-100/70">
                  Varianty: {kit.variants.join(", ")}. Kratší prut se na menší vodě a pro začátek snáz ovládá.
                </p>
                <p className="mt-3 text-xs text-cyan-100/50">
                  Aktuální cenu a dostupnost uvidíš u prodejce. Obsah balení ověřen {formatDate(kit.verifiedAt)}.
                </p>
                <div className="mt-5">
                  <StarterKitAffiliateLink
                    href={getStarterKitAffiliateUrl(kit)}
                    productId={kit.id}
                    placement="prvni-rybareni"
                  >
                    Zobrazit set u prodejce
                  </StarterKitAffiliateLink>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="dokoupit" title="8. Co si musím pořídit zvlášť">
          <ul className="list-disc space-y-2 pl-5">
            <li>Rybářský lístek a povolenku (nebo zaplacený lov na soukromé vodě).</li>
            <li>Nástrahu a krmení — set obsahuje krmítka a formu, ale ne samotné krmení.</li>
            <li>Vyprošťovač háčků, metr, podběrák a případně podložku podle pravidel vody.</li>
            <li>Stojánek nebo vidličky na prut, náhradní návazce a háčky.</li>
            <li>Pohodlí u vody: sedačku, oblečení do počasí, pití a pytel na odpadky.</li>
          </ul>
          <p>
            Počítej i s průběžnými náklady: u svazu se platí členský příspěvek a povolenka každý rok, nástrahy a krmení
            průběžně.
          </p>
        </Section>

        <Section id="chovani" title="9. Jak se chovat k rybám a přírodě">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Rybu, kterou si nesmíš nebo nechceš ponechat (podměrečnou, v době hájení), vrať <strong className="text-white">šetrně</strong>{" "}
              zpět do vody — vyhláška to přímo ukládá.
            </li>
            <li>Na rybu sahej mokrýma rukama, pokládej ji na podložku nebo do trávy, ne na kameny či písek.</li>
            <li>Háček vyprošťuj vyprošťovačem a rybu drž mimo vodu co nejkratší dobu.</li>
            <li>Respektuj lovné míry, doby hájení a limity úlovků.</li>
            <li>Neodhazuj vlasce, háčky ani obaly — jsou nebezpečné pro ptáky i zvířata. Odnes i cizí odpadky.</li>
            <li>Drž rozestup od ostatních rybářů a nedělej u vody zbytečný hluk.</li>
          </ul>
        </Section>

        <Section id="faq" title="10. Časté otázky">
          <dl className="space-y-5">
            {FIRST_FISHING_FAQ.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-white">{item.question}</dt>
                <dd className="mt-1 text-cyan-100/85">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <section className="mt-12 border-t border-white/10 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-100/50">Zdroje</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {FIRST_FISHING_SOURCES.map((source) => (
              <li key={source.url}>
                <ExtLink href={source.url}>{source.label}</ExtLink>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-sm text-cyan-100/70">
          Rybaříš raději ve hrách? Podívej se na{" "}
          <Link href="/hry-s-rybarenim" className="underline hover:text-amber-300">
            hry, ve kterých se rybaří
          </Link>
          .
        </p>
      </article>
    </div>
  );
}
