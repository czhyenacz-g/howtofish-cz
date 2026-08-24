import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";

// noindex, nofollow platí pro celý /demo prostor včetně budoucích
// vnořených stránek (např. /demo/ryby/pufferfish) — nastavuje se jednou
// tady, potomci ho dědí, pokud sami nenastaví vlastní `robots`.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header basePath="/demo" />
      <main className="flex-1">{children}</main>
      <Footer basePath="/demo" />
    </div>
  );
}
