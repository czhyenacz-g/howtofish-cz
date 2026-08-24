import type { Metadata } from "next";
import { fishEntries } from "../../data/fish";
import FishingGame from "./FishingGame";

export const metadata: Metadata = {
  title: "Chyť úlovek",
  description:
    "Rychlá browserová minihra Chyť úlovek — hoď háček a zkus ulovit rybu z české encyklopedie How to Fish.",
};

export default function HraPage() {
  return (
    <div className="bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-serif text-3xl sm:text-4xl">Chyť úlovek</h1>
        <p className="mt-3 text-cyan-100/80">
          Klepni na hejno, kde právě pluje ryba, a zkus ji zaseknout dřív, než
          zmizí.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <FishingGame fish={fishEntries} />
      </div>
    </div>
  );
}
