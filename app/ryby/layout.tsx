import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { SITE_LAUNCHED } from "../config/site";

// Dokud web není spuštěný, celý /ryby strom (včetně budoucích
// vnořených stránek) je noindex,nofollow — potomci toto dědí, pokud
// sami nenastaví vlastní `robots`. V den spuštění stačí přepnout
// SITE_LAUNCHED na true v app/config/site.ts.
export const metadata: Metadata = SITE_LAUNCHED
  ? {}
  : {
      robots: {
        index: false,
        follow: false,
      },
    };

export default function RybyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
