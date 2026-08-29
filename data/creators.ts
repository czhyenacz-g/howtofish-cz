// SEO profily tvůrců pro /stream/[creator] — ČTE data/creator-videos.ts
// (žádná duplikace faktů), ale nepřidává nic do něj a nijak ho neupravuje,
// aby zůstal homepage carousel (CreatorVideoCarousel) beze změny/rizika.
// Slug = jméno tvůrce zmenšené na malá písmena — všechna aktuální jména
// jsou bez diakritiky/mezer, takže žádný složitější slugify není potřeba.

import { creatorVideos, type CreatorVideo } from "./creator-videos.ts";

export type CreatorProfileVideo = {
  title: string;
  subtitle: string;
  platform: CreatorVideo["platform"];
  url: string;
  youtubeId?: string;
};

export type CreatorProfile = {
  slug: string;
  name: string;
  videos: CreatorProfileVideo[];
};

const creatorNames = Array.from(new Set(creatorVideos.map((v) => v.creator)));

export const creatorProfiles: CreatorProfile[] = creatorNames.map((name) => ({
  slug: name.toLowerCase(),
  name,
  videos: creatorVideos
    .filter((v) => v.creator === name)
    .map((v) => ({ title: v.title, subtitle: v.subtitle, platform: v.platform, url: v.url, youtubeId: v.youtubeId })),
}));

export function getCreatorProfile(slug: string): CreatorProfile | undefined {
  return creatorProfiles.find((c) => c.slug === slug);
}
