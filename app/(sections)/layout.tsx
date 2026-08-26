import Header from "../components/Header";
import Footer from "../components/Footer";
import FeedbackCallout from "../components/FeedbackCallout";
import { getCurrentUser } from "../../lib/auth/current-user";

// Sdílený layout pro sekce navigace (Návody, Předměty, Bossové, Lokace,
// Achievementy, Aktualizace) i pro /o-hre a právní stránky — route
// group, aby se Header/Footer nekopírovaly do skoro identických
// layout.tsx souborů. Stejný mechanismus jako /ryby.
export default async function SectionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <FeedbackCallout user={user ? { nickname: user.nickname } : null} />
      <Footer />
    </div>
  );
}
