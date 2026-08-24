import type { Metadata } from "next";
import SectionPlaceholder from "../../components/SectionPlaceholder";

export const metadata: Metadata = {
  title: "Aktualizace",
  description: "Přehled aktualizací a patch notes hry How to Fish.",
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
