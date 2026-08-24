import type { MetadataRoute } from "next";
import { SITE_LAUNCHED, SITE_URL } from "./config/site";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/demo"];

  // /ryby, /hra a /stream jsou disallow, dokud web není spuštěný — viz SITE_LAUNCHED.
  if (!SITE_LAUNCHED) {
    disallow.push("/ryby", "/hra", "/stream");
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
