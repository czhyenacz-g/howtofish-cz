import type { Metadata } from "next";
import { fishEntries } from "../../data/fish";
import FishBrowser from "./FishBrowser";

export const metadata: Metadata = {
  title: { absolute: "Ryby a úlovky – How to Fish CZ" },
  description:
    "Česká encyklopedie ryb, tvorů a úlovků ze hry How to Fish. Zjisti, kde je najít, jak je chytit a k čemu slouží.",
};

export default function RybyPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a2438] via-[#0e4f66] to-[#146b78] px-4 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Encyklopedie úlovků</h1>
          <p className="mt-3 text-cyan-100/80">
            Ryby, mořští tvorové a další věci, které můžeš ve hře How to Fish
            chytit.
          </p>
        </div>

        <div className="mt-10">
          <FishBrowser fish={fishEntries} />
        </div>
      </div>
    </div>
  );
}
