import type { Metadata } from "next";
import RybyPageContent from "./RybyPageContent";

const TITLE = "Ryby a úlovky – How to Fish CZ";
const DESCRIPTION =
  "Česká encyklopedie ryb, tvorů a úlovků ze hry How to Fish. Zjisti, kde je najít, jak je chytit a k čemu slouží.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  // Homepage (`/`) má teď vlastní unikátní obsah (streameři/live), takže
  // `/ryby` je od teď sama sobě kanonická, ne canonical na dřívější
  // duplicitu (viz app/page.tsx).
  alternates: { canonical: "/ryby" },
  openGraph: {
    images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }],
  },
};

export default function RybyPage() {
  return <RybyPageContent />;
}
