import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FeedbackCallout from "./components/FeedbackCallout";
import RybyPageContent from "./ryby/RybyPageContent";
import { getCurrentUser } from "../lib/auth/current-user";

// Homepage zobrazuje stejný obsah jako `/ryby` (jeden zdroj, viz
// RybyPageContent) — SEO canonical vždy míří na `/ryby`, `/` je jen
// alternativní vstupní bod na stejnou stránku. Title/description/OG se
// jinak dědí z root layoutu (SITE_TITLE/SITE_DESCRIPTION).
export const metadata: Metadata = {
  alternates: { canonical: "/ryby" },
};

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">
        <RybyPageContent />
      </main>
      <FeedbackCallout user={user ? { nickname: user.nickname } : null} />
      <Footer />
    </div>
  );
}
