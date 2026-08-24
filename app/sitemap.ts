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

  // /ryby jde do sitemap až po spuštění webu — viz SITE_LAUNCHED.
  if (SITE_LAUNCHED) {
    entries.push({
      url: `${SITE_URL}/ryby`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

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
