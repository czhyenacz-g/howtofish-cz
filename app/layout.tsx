import type { Metadata } from "next";
import { Bree_Serif, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import AmbientAudioToggle from "./components/AmbientAudioToggle";
import CharacterCallout from "./components/CharacterCallout";
import { GOATCOUNTER_CODE } from "./config/analytics";
import { getActivePromotions } from "../lib/universal-content-api/promotions";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "./config/site";

// Globální typografie webu — herní serifový font (nadpisy, navigace,
// tlačítka, karty) + čitelný sans pro delší texty. Viz CLAUDE.md pro
// detaily o tom, jak byl font vybraný (podle oficiálních screenshotů hry).
const breeSerif = Bree_Serif({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Malý, ne-citlivý seznam (admin-psaný marketing text) — viz
  // CharacterCallout.tsx pro proč se výběr podle route dělá až
  // client-side (usePathname() dostupné až po mountu).
  const sellerPromotions = await getActivePromotions("seller").catch(() => []);

  return (
    <html lang="cs" className={`${breeSerif.variable} ${inter.variable}`}>
      <body className="bg-gray-900 font-sans text-white antialiased">
        {children}
        <AmbientAudioToggle />
        <CharacterCallout sellerPromotions={sellerPromotions} />
        <Analytics />
        {GOATCOUNTER_CODE && (
          <Script
            data-goatcounter={`https://${GOATCOUNTER_CODE}.goatcounter.com/count`}
            src="//gc.zgo.at/count.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
