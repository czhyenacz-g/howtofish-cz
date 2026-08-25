import type { MetadataRoute } from "next";
import { fishEntries } from "../data/fish";
import { SITE_LAUNCHED, SITE_URL } from "./config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // /ryby, /hra a /stream jdou do sitemap až po spuštění webu — viz SITE_LAUNCHED.
  if (SITE_LAUNCHED) {
    entries.push({
      url: `${SITE_URL}/ryby`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    entries.push({
      url: `${SITE_URL}/hra`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    });

    entries.push({
      url: `${SITE_URL}/stream`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.4,
    });

    for (const path of ["/predmety", "/bossove", "/lokace", "/navody"]) {
      entries.push({
        url: `${SITE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    for (const fish of fishEntries) {
      entries.push({
        url: `${SITE_URL}/ryby/${fish.slug}`,
        lastModified: new Date(fish.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
