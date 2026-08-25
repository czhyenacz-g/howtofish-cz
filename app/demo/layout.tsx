import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getCurrentUser } from "../../lib/auth/current-user";

// noindex, nofollow platí pro celý /demo prostor včetně budoucích
// vnořených stránek (např. /demo/ryby/pufferfish) — nastavuje se jednou
// tady, potomci ho dědí, pokud sami nenastaví vlastní `robots`.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DemoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <Header basePath="/demo" user={user} />
      <main className="flex-1">{children}</main>
      <Footer basePath="/demo" />
    </div>
  );
}
