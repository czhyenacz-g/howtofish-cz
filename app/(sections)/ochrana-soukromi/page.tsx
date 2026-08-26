import type { Metadata } from "next";
import { buildFeedbackEmail } from "../../components/feedback-email";

const TITLE = "Ochrana soukromí";
const DESCRIPTION = "Co HowToFish.cz zpracovává při Steam přihlášení, nahrávání komunitního obsahu a běžném provozu webu.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/ochrana-soukromi" },
  openGraph: { images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
};

export default function OchranaSoukromiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-white">
      <h1 className="font-serif text-3xl">Ochrana soukromí</h1>
      <p className="mt-3 text-cyan-100/80">
        Tady je popsané, co HowToFish.cz skutečně zpracovává. Text odpovídá reálné funkčnosti webu, ne obecné
        šabloně.
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Přihlášení přes Steam</h2>
        <p className="mt-3 text-cyan-100/80">
          Při přihlášení přes Steam (OpenID) z veřejného Steam profilu uložíme tvoje Steam ID, veřejnou přezdívku a
          URL profilového obrázku. Tyto údaje se ukládají v naší databázi a slouží k zobrazení tvého jména/avataru
          u příspěvků a k případnému omezení přístupu při zneužívání webu.
        </p>
        <p className="mt-3 text-cyan-100/80">
          Přihlášení drží podepsaná (ne šifrovaná) session cookie, která v sobě nese jen Steam ID a datum
          vyexpirování — žádná citlivá data. Session vydrží 30 dní. Aktuální stav účtu (např. případné omezení) se
          vždy dočítá z databáze, nikdy z cookie samotné.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Komunitní nahrávky (screenshoty, návrhy)</h2>
        <p className="mt-3 text-cyan-100/80">
          Když jako přihlášený uživatel nahraješ screenshot úlovku nebo pošleš návrh nového záznamu (ryba, boss,
          předmět, lokace, návod), ukládáme obrázek, tvou volitelnou poznámku, tvoje Steam ID a přezdívku a čas
          odeslání. Návrh je nejdřív ve stavu &bdquo;čeká na schválení&ldquo; a veřejně se zobrazí až po schválení.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Universal Content API</h2>
        <p className="mt-3 text-cyan-100/80">
          Obsah webu a komunitní příspěvky (viz výše) jsou uložené v backendu Universal Content API, který
          provozujeme pro potřeby HowToFish.cz a případně dalších našich projektů. Technické podrobnosti tohoto
          backendu nejsou veřejné.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Statistiky návštěvnosti</h2>
        <p className="mt-3 text-cyan-100/80">
          Pro základní statistiky návštěvnosti používáme Vercel Analytics, které nepoužívá trvalé sledovací
          cookies a data zpracovává agregovaně. Web může volitelně používat i cookie-free analytiku GoatCounter —
          aktuálně není na webu zapnutá.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Provozní logy</h2>
        <p className="mt-3 text-cyan-100/80">
          Web běží na hostingu Vercel, který jako běžná součást provozu může krátkodobě zaznamenávat technické
          údaje o požadavcích (např. IP adresu a user-agent) pro účely bezpečnosti a diagnostiky. Tyto logy
          nepoužíváme k marketingovému sledování.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Cookies</h2>
        <p className="mt-3 text-cyan-100/80">
          Web používá jen technicky nezbytnou přihlašovací (session) cookie popsanou výše — bez ní by přihlášení
          přes Steam nefungovalo. Web aktuálně nepoužívá žádné analytické ani marketingové cookies vyžadující
          předchozí souhlas.
        </p>
      </section>

      <section className="mt-8 border-t border-white/10 pt-6">
        <h2 className="font-serif text-xl text-amber-300">Kontakt</h2>
        <p className="mt-3 text-cyan-100/80">
          Dotazy k ochraně soukromí piš na{" "}
          <a href={`mailto:${buildFeedbackEmail()}`} className="underline hover:text-amber-300">
            {buildFeedbackEmail()}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
