import type { MetadataRoute } from "next";
import { fishEntries } from "../data/fish.ts";
import { guides as curatedGuides } from "../data/guides.ts";
import { fishGuides } from "../data/fish-guides.ts";
import { creatorProfiles } from "../data/creators.ts";
import { getIndexableVideos } from "../data/how-to-fish-videos.ts";
import { getGamesWithGameDetailPage } from "../data/games.ts";
import { getGameDetailContent } from "../data/game-details.ts";
import { FIRST_FISHING_PATH, FIRST_FISHING_UPDATED_AT } from "../data/first-fishing.ts";
import { SITE_URL } from "./config/site.ts";

// Homepage (`/`) má vlastní obsah a canonical na "/". Mimo sitemap jsou:
// `/demo` (permanent redirect na /ryby, viz next.config.ts), `/*/navrhnout`
// formuláře a auth routes (noindex), `/multiplayer` (pozastavený, noindex)
// a `/aktualizace` (odstraněný placeholder, redirect na /o-hre).
//
// `lastModified` se uvádí JEN tam, kde data nesou skutečné datum (ryby,
// SEO návody, videa, /prvni-rybareni, herní detaily s `lastReviewed`). U ostatních URL ho záměrně vynecháváme — dřív se
// tu posílal čas buildu, takže každý deploy hlásil změnu všech stránek
// a vyhledávače pak lastmod ignorují úplně.
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/streameri`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/stream`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/ryby`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/hra`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/hry-s-rybarenim`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/o-hre`, changeFrequency: "monthly", priority: 0.5 },
    // Průvodce prvním skutečným rybařením — lastModified = ruční datum
    // poslední změny obsahu (data/first-fishing.ts), ne čas buildu.
    {
      url: `${SITE_URL}${FIRST_FISHING_PATH}`,
      lastModified: new Date(FIRST_FISHING_UPDATED_AT),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Detaily her, které mají vlastní /games/[slug] stránku (viz
  // getGamesWithGameDetailPage v data/games.ts) — How to Fish tu záměrně
  // není, jeho obsah je na /ryby a ta je v sitemap zvlášť.
  for (const game of getGamesWithGameDetailPage()) {
    const lastReviewed = getGameDetailContent(game.slug)?.lastReviewed;
    entries.push({
      url: `${SITE_URL}/games/${game.slug}`,
      ...(lastReviewed ? { lastModified: new Date(lastReviewed) } : {}),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const path of ["/predmety", "/bossove", "/lokace", "/navody", "/achievementy"]) {
    entries.push({ url: `${SITE_URL}${path}`, changeFrequency: "weekly", priority: 0.6 });
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
      ...(guide.lastReviewed ? { lastModified: new Date(guide.lastReviewed) } : {}),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  // Streamer detail pages — jak ověření tvůrci s videi (data/creator-videos.ts),
  // tak opatrně formulované profily bez videa (data/creators.ts) — všichni
  // jsou skutečné, indexovatelné stránky (viz app/streameri/[slug]/page.tsx).
  // Bývalé /stream/{slug} teď trvale přesměrovává sem (next.config.ts).
  for (const creator of creatorProfiles) {
    entries.push({
      url: `${SITE_URL}/streameri/${creator.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // How to Fish video detaily — jen `indexable: true` (viz zadání "noindex
  // videa do sitemap nedávej").
  for (const video of getIndexableVideos()) {
    entries.push({
      url: `${SITE_URL}/videa/${video.slug}`,
      lastModified: new Date(video.publishedAt),
      changeFrequency: "yearly",
      priority: 0.4,
    });
  }

  return entries;
}
