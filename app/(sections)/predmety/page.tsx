import type { Metadata } from "next";
import AdPlaceholder from "../../components/AdPlaceholder";
import SectionPlaceholder from "../../components/SectionPlaceholder";

export const metadata: Metadata = {
  title: "Předměty",
  description: "Vybavení, návnady a upgrady v How to Fish.",
};

export default function PredmetyPage() {
  return (
    <SectionPlaceholder title="Předměty">
      <p>
        Tady bude přehled vybavení, návnad a upgradů v How to Fish — co
        která věc dělá, kde ji sehnat a kdy se vyplatí investovat.
      </p>
      <p>Sekce zatím čeká na první data, brzy ji naplníme.</p>
      <AdPlaceholder />
    </SectionPlaceholder>
  );
}
