import type { MetadataRoute } from "next";
import { SITE_LAUNCHED, SITE_URL } from "./config/site";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/demo"];

  // /ryby je disallow, dokud web není spuštěný — viz SITE_LAUNCHED.
  if (!SITE_LAUNCHED) {
    disallow.push("/ryby");
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
