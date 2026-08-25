import type { Metadata } from "next";
import AdPlaceholder from "../../components/AdPlaceholder";
import SectionPlaceholder from "../../components/SectionPlaceholder";

export const metadata: Metadata = {
  title: "Návody",
  description: "České návody pro How to Fish — pro začátečníky i pokročilé.",
};

export default function NavodyPage() {
  return (
    <SectionPlaceholder title="Návody">
      <p>
        Tady postupně přibudou návody pro How to Fish — jak chytit první
        rybu, jak efektivně vydělávat peníze, jak se připravit na souboj s
        bossem a další postupy pro začátečníky i pokročilé hráče.
      </p>
      <p>Sekce se právě rozjíždí, první návody přidáme v následujících týdnech.</p>
      <AdPlaceholder />
    </SectionPlaceholder>
  );
}
