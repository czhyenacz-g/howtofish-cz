import type { MetadataRoute } from "next";
import { NAV_LINKS, SITE_URL } from "./config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", ...NAV_LINKS.map((link) => link.href)];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.5,
  }));
}
