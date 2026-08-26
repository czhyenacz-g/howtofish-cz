import type { MetadataRoute } from "next";
import { SITE_URL } from "./config/site.ts";

// Web je teď plně indexovatelný — jednotlivé technické/utilitní stránky
// (Steam auth callbacky, "/*/navrhnout" formuláře) se z indexu drží pryč
// přes vlastní `robots` meta na dané stránce (viz jejich page.tsx), ne
// přes Disallow tady, ať je crawler i tak může navštívit a uvidí ten
// meta tag. API routes nejsou SEO dokumenty, řešit netřeba.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
