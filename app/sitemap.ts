import type { MetadataRoute } from "next";
import { fishEntries } from "../data/fish.ts";
import { guides as curatedGuides } from "../data/guides.ts";
import { fishGuides } from "../data/fish-guides.ts";
import { creatorProfiles } from "../data/creators.ts";
import { SITE_URL } from "./config/site.ts";

// Homepage (`/`) je záměrně mimo sitemap — zobrazuje stejný obsah jako
// `/ryby` a canonical obou vždy míří na `/ryby` (viz app/page.tsx),
// takže `/ryby` je tu jediná pravda. `/demo` je smazané (permanent
// redirect na /ryby, viz next.config.ts), `/*/navrhnout` formuláře a
// auth routes jsou trvale noindex na úrovni stránky, sem nepatří.
// `/aktualizace` zůstává mimo — je to zatím jen prázdný placeholder.
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/ryby`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/o-hre`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/hra`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/stream`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.4 },
    { url: `${SITE_URL}/multiplayer`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.5 },
  ];

  for (const path of ["/predmety", "/bossove", "/lokace", "/navody", "/achievementy"]) {
    entries.push({ url: `${SITE_URL}${path}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 });
  }

  for (const fish of fishEntries) {
    entries.push({
      url: `${SITE_URL}/ryby/${fish.slug}`,
      lastModified: new Date(fish.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Jen kurátorované návody (statická data/guides.ts) — komunitní
  // (schválené přes UCA) se do sitemap teď nezahrnují, ať zůstane
  // synchronní a nezávislé na dostupnosti UCA při buildu/requestu.
  // Jsou pořád dohledatelné přes odkazy na /navody.
  for (const guide of curatedGuides) {
    entries.push({
      url: `${SITE_URL}/navody/${guide.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  // Nové SEO návody ("jak chytit" / "kde najít") — statická
  // data/fish-guides.ts, jen skutečně existující (a tedy indexovatelné)
  // stránky, viz generateStaticParams v jejich page.tsx.
  for (const guide of fishGuides) {
    const prefix = guide.type === "how-to-catch" ? "jak-chytit" : "kde-najit";
    entries.push({
      url: `${SITE_URL}/navody/${prefix}-${guide.fishSlug}`,
      lastModified: guide.lastReviewed ? new Date(guide.lastReviewed) : new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  // Streamer detail pages — jen potvrzení tvůrci z data/creator-videos.ts.
  for (const creator of creatorProfiles) {
    entries.push({
      url: `${SITE_URL}/stream/${creator.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }

  return entries;
}
