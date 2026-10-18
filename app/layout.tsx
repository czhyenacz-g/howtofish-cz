import type { Metadata } from "next";
import { Bree_Serif, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import PageViewTracker from "./components/PageViewTracker";
import { GOATCOUNTER_CODE } from "./config/analytics";
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
  // Žádný sitewide canonical default tady — každá indexovatelná stránka
  // si nastavuje vlastní `alternates.canonical`.
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "cs_CZ",
    type: "website",
    // Existující dynamický OG generátor (app/api/og), žádný nový
    // statický obrázek — jednotlivé stránky si přebijí jen `images`
    // (title/description se pro OG i Twitter automaticky doplní z
    // vlastního title/description dané stránky).
    images: [{ url: `/api/og?title=${encodeURIComponent(SITE_NAME)}`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  // Žádný sitewide `robots` — default je index/follow a explicitní
  // hodnota tady se na 404 stránkách vykreslila vedle Next.js "noindex"
  // jako druhý, protichůdný <meta name="robots">. Stránky, které nemají
  // být v indexu, si `robots` nastavují samy.
  // Seznam Webmaster Tools — ověření vlastnictví domény.
  other: { "seznam-wmt": "PRiOIxgiLA0zLXxcJVMJNWhTAb9VYWzv" },
};

// Globální overlaye (CharacterCallout = Profesor + Prodavač,
// MultiplayerIslandTab, AmbientAudioToggle) se v režimu minimální údržby
// nerenderují — jejich kód v app/components/ zůstává. Layout tím zároveň
// přestal při každém renderu volat UCA (seller promotions + asset #45).
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs" className={`${breeSerif.variable} ${inter.variable}`}>
      <body className="bg-gray-900 font-sans text-white antialiased">
        {children}
        <PageViewTracker />
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
