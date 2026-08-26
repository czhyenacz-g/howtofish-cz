import type { Metadata } from "next";
import SectionPlaceholder from "../../components/SectionPlaceholder";

// Zatím jen placeholder bez reálného obsahu — noindex, dokud sekci
// skutečně nenaplníme (viz CLAUDE.md/audit). Route zůstává dostupná,
// jen mimo hlavní navigaci (app/config/site.ts) a mimo sitemap.
export const metadata: Metadata = {
  title: "Aktualizace",
  description: "Přehled aktualizací a patch notes hry How to Fish.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AktualizacePage() {
  return (
    <SectionPlaceholder title="Aktualizace">
      <p>
        Tady budeme sledovat aktualizace a patch notes hry How to Fish a
        shrnovat, co je v nich nového pro české hráče.
      </p>
      <p>První přehledy aktualizací přidáme brzy.</p>
    </SectionPlaceholder>
  );
}
