import type { Metadata } from "next";
import AdPlaceholder from "../../components/AdPlaceholder";
import SectionPlaceholder from "../../components/SectionPlaceholder";

export const metadata: Metadata = {
  title: "Lokace",
  description: "Mapy a popisy lovišť v How to Fish.",
};

export default function LokacePage() {
  return (
    <SectionPlaceholder title="Lokace">
      <p>
        Tady bude přehled lovišť a lokací v How to Fish — co v nich
        chytíte, na co si dát pozor a jak se do nich dostanete.
      </p>
      <p>Mapy a popisy lokací připravujeme.</p>
      <AdPlaceholder />
    </SectionPlaceholder>
  );
}
