import type { Metadata } from "next";
import Link from "next/link";
import { STEAM_URL } from "../../config/site";

const TITLE = "O hře";
const DESCRIPTION =
  "Co je How to Fish, kdo hru vytvořil a co najdeš na české komunitní encyklopedii HowToFish.cz — ryby, bossové, předměty, lokace, návody a achievementy.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/o-hre" },
  openGraph: { images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
};

const SECTION_LINKS = [
  { href: "/ryby", label: "Ryby" },
  { href: "/predmety", label: "Předměty" },
  { href: "/bossove", label: "Bossové" },
  { href: "/lokace", label: "Lokace" },
  { href: "/navody", label: "Návody" },
  { href: "/achievementy", label: "Achievementy" },
  { href: "/stream", label: "Živě / Stream" },
] as const;

export default function OHrePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-white">
      <h1 className="font-serif text-3xl sm:text-4xl">How to Fish – o hře</h1>
      <p className="mt-4 text-lg text-cyan-100/80">
        How to Fish je stylizovaná fyzikální rybářská hra pro jednoho až čtyři hráče. Začínáš po ztroskotání na
        malém ostrově — a abys se dostal dál, musíš se naučit rybařit.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-amber-300">Co je How to Fish</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-cyan-100/80">
          <li>Chytáš ryby a další tvory.</li>
          <li>Úlovky můžeš prodávat a získávat za ně peníze.</li>
          <li>Za peníze kupuješ lepší vybavení, zbraně a další věci.</li>
          <li>Plníš questy a postupuješ přes další ostrovy.</li>
          <li>Na jednotlivých ostrovech potkáváš bossy a nebezpečnější tvory.</li>
          <li>Postupně hledáš vzácnější a zajímavější úlovky.</li>
        </ul>
        <p className="mt-4 rounded-lg border border-amber-300/20 bg-white/5 px-4 py-3 text-cyan-100/90">
          <strong className="text-amber-300">Zjednodušeně:</strong> ztroskotáš → lovíš → prodáváš → kupuješ vybavení
          → plníš questy → porážíš bossy → postupuješ na další ostrovy → hledáš stále vzácnější úlovky.
        </p>
        <p className="mt-4 text-cyan-100/80">
          Hra kombinuje rybaření, fyziku, akci, FPS prvky a absurdní humor — hrát lze sólo i v online kooperaci.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Kdo hru vytvořil</h2>
        <p className="mt-3 text-cyan-100/80">
          How to Fish vytvořilo studio Dazed Games a hra vyšla na platformě Steam. Aktuální informace o hře, ceně a
          dostupnosti najdeš přímo na jejím{" "}
          <a href={STEAM_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">
            Steam obchodě
          </a>
          .
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Proč vzniká HowToFish.cz</h2>
        <p className="mt-3 text-cyan-100/80">
          HowToFish.cz je neoficiální český komunitní web pro hráče How to Fish. Cílem je nabídnout na jednom místě
          českou encyklopedii ryb a tvorů, informace o úlovcích, předmětech, bossech a lokacích, praktické návody,
          živé streamy, komunitní screenshoty úlovků, přehled změn a novinek ve hře a jednoduché herní a komunitní
          funkce.
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-serif text-sm">
          {SECTION_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="underline hover:text-amber-300">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Výraznější, samostatné CTA na konkrétní minihru — odlišené od
            obyčejných textových odkazů výše, viz zadání. */}
        <Link
          href="/hra"
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-amber-500 px-8 py-3 font-serif text-base text-gray-900 shadow-lg shadow-amber-900/20 transition hover:bg-amber-400"
        >
          Zahrát Krabí invazi
        </Link>
      </section>

      <section className="mt-8 border-t border-white/10 pt-6">
        <h2 className="font-serif text-xl text-amber-300">Neoficiální fan web</h2>
        <p className="mt-3 text-cyan-100/80">
          HowToFish.cz není spojený s vývojářem ani vydavatelem hry How to Fish. Víc o tom najdeš na stránce{" "}
          <Link href="/pravni-informace" className="underline hover:text-amber-300">
            Právní informace
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
