import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { SITE_LAUNCHED } from "../config/site";
import { getCurrentUser } from "../../lib/auth/current-user";

// Sdílený layout pro zatím prázdné sekce navigace (Návody, Předměty,
// Bossové, Lokace, Achievementy, Aktualizace) — route group, aby se
// Header/Footer/SITE_LAUNCHED gating nekopírovaly do šesti skoro
// identických layout.tsx souborů. Stejný mechanismus jako /ryby.
export const metadata: Metadata = SITE_LAUNCHED
  ? {}
  : {
      robots: {
        index: false,
        follow: false,
      },
    };

export default async function SectionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
