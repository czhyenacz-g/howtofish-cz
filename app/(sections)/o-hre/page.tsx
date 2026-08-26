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
        How to Fish je stylizovaná rybářská adventura, ve které se hráč vydává na ostrovy plné ryb, podivných
        tvorů a absurdní fyziky. Důraz je na průzkum, samotné rybaření a objevování — spíš než na realistickou
        simulaci.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-amber-300">Co je How to Fish</h2>
        <p className="mt-3 text-cyan-100/80">
          Jde o hru od studia Dazed Games dostupnou na Steamu, ve které hráč prozkoumává souostroví, chytá ryby a
          další tvory a postupně se dostává na nové ostrovy a k novému vybavení. Tón hry je odlehčený, humorný a
          místy záměrně přehnaný.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Co ve hře děláte</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-cyan-100/80">
          <li>lovíte ryby a další tvory prutem a různými návnadami,</li>
          <li>prozkoumáváte jednotlivé ostrovy a jejich lokace,</li>
          <li>sháníte a vylepšujete vybavení,</li>
          <li>utkáváte se s bossy,</li>
          <li>plníte questy a achievementy.</li>
        </ul>
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
        <h2 className="font-serif text-xl text-amber-300">Česká komunita HowToFish.cz</h2>
        <p className="mt-3 text-cyan-100/80">
          HowToFish.cz je česká komunitní encyklopedie ke hře How to Fish. Najdeš tu přehled ryb a úlovků,
          předmětů, bossů, lokací, návody, seznam achievementů, přehled živých streamů a komunitní screenshoty
          úlovků od ostatních hráčů.
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
      </section>

      <section className="mt-8 border-t border-white/10 pt-6">
        <h2 className="font-serif text-xl text-amber-300">Neoficiální fan web</h2>
        <p className="mt-3 text-cyan-100/80">
          HowToFish.cz je neoficiální komunitní/fanouškovský web a není spojený s vývojářem ani vydavatelem hry How
          to Fish. Víc o tom najdeš na stránce{" "}
          <Link href="/pravni-informace" className="underline hover:text-amber-300">
            Právní informace
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
