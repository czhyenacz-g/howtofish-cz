import type { Metadata } from "next";
import SectionPlaceholder from "../../components/SectionPlaceholder";

export const metadata: Metadata = {
  title: "Ryby",
  description: "Přehled druhů ryb v How to Fish a jak je chytit.",
};

export default function RybyPage() {
  return (
    <SectionPlaceholder title="Ryby">
      <p>
        Databáze ryb pro How to Fish je v přípravě — najdete tu druhy ryb,
        jejich vzácnost, lokace výskytu a tipy na návnady, kterými je
        nejsnáz chytíte.
      </p>
      <p>Konkrétní záznamy ryb doplníme, jakmile bude připravená datová struktura.</p>
    </SectionPlaceholder>
  );
}
