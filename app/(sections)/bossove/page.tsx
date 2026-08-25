import type { Metadata } from "next";
import AdPlaceholder from "../../components/AdPlaceholder";
import SectionPlaceholder from "../../components/SectionPlaceholder";

export const metadata: Metadata = {
  title: "Bossové",
  description: "Přehled bossů v How to Fish a taktiky na jejich poražení.",
};

export default function BossovePage() {
  return (
    <SectionPlaceholder title="Bossové">
      <p>
        Tady najdete přehled bossů v How to Fish — jak se na souboj
        připravit, jaké vybavení se hodí a jaké taktiky fungují nejlépe.
      </p>
      <p>Konkrétní bossy postupně doplníme.</p>
      <AdPlaceholder />
    </SectionPlaceholder>
  );
}
