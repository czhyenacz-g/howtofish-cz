import Header from "../components/Header";
import Footer from "../components/Footer";
import FeedbackCallout from "../components/FeedbackCallout";
import { getCurrentUser } from "../../lib/auth/current-user";

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
