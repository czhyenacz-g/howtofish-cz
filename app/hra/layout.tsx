import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FeedbackCallout from "../components/FeedbackCallout";
import { SITE_LAUNCHED } from "../config/site";
import { getCurrentUser } from "../../lib/auth/current-user";

// Stejný mechanismus jako /ryby — dokud web není spuštěný, /hra je
// noindex,nofollow. Viz SITE_LAUNCHED v app/config/site.ts.
export const metadata: Metadata = SITE_LAUNCHED
  ? {}
  : {
      robots: {
        index: false,
        follow: false,
      },
    };

export default async function HraLayout({
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
