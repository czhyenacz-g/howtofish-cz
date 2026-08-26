import type { Metadata } from "next";
import { buildFeedbackEmail } from "../../components/feedback-email";

const TITLE = "Právní informace";
const DESCRIPTION = "Informace o provozu HowToFish.cz, ochranných známkách, affiliate odkazech a uživatelském obsahu.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pravni-informace" },
  openGraph: { images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
};

export default function PravniInformacePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-white">
      <h1 className="font-serif text-3xl">Právní informace</h1>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">O webu</h2>
        <p className="mt-3 text-cyan-100/80">
          HowToFish.cz je neoficiální český komunitní/fanouškovský web ke hře How to Fish. Není provozován ani
          oficiálně spojen s vývojářem ani vydavatelem hry.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Ochranné známky a herní obsah</h2>
        <p className="mt-3 text-cyan-100/80">
          Název hry How to Fish, případná loga a další herní prvky náleží jejich příslušným vlastníkům. Vlastní
          grafika, texty a design HowToFish.cz jsou samostatné a s nimi si nespojujte oficiální materiály hry.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Affiliate</h2>
        <p className="mt-3 text-cyan-100/80">
          Některé odkazy na tomto webu mohou být partnerské. Pokud přes ně nakoupíte, můžeme získat provizi. Cena
          pro vás se tím nemění. Konkrétní partnerská/reklamní umístění na webu jsou vždy označená jako{" "}
          <span className="text-amber-200">Partnerský tip</span> nebo <span className="text-amber-200">Reklama</span>.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-amber-300">Uživatelský obsah</h2>
        <p className="mt-3 text-cyan-100/80">
          Přihlášení uživatelé mohou na web nahrávat vlastní screenshoty a další obsah (např. návrhy nových
          záznamů). Nahráním obsahu potvrzujete, že k němu máte právo ho sdílet. Web může nevhodný nebo
          neoprávněný obsah odstranit.
        </p>
      </section>

      <section className="mt-8 border-t border-white/10 pt-6">
        <h2 className="font-serif text-xl text-amber-300">Kontakt</h2>
        <p className="mt-3 text-cyan-100/80">
          Ohledně obsahu tohoto webu nás můžeš kontaktovat na{" "}
          <a href={`mailto:${buildFeedbackEmail()}`} className="underline hover:text-amber-300">
            {buildFeedbackEmail()}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
