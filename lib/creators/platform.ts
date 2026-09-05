// Odvozuje, na kterých platformách tvůrce skutečně máme obsah — ze
// STÁVAJÍCÍCH polí (creator.videos[].platform, creator.externalLink.href),
// nikdy z nového vymyšleného pole "twitch"/"youtube"/"kick" URL (zadání:
// "nevymýšlej žádná data"). Žádná duplicitní datová vrstva.
import type { CreatorProfile } from "../../data/creators.ts";
import type { Platform } from "../streams/types.ts";

function inferPlatformFromUrl(url: string): Platform | null {
  if (/twitch\.tv/i.test(url)) return "twitch";
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/kick\.com/i.test(url)) return "kick";
  return null;
}

/** Distinct platformy, na kterých máme pro tvůrce doložený obsah (video nebo externalLink) — stabilně seřazené. */
export function getCreatorPlatforms(creator: Pick<CreatorProfile, "videos" | "externalLink">): Platform[] {
  const platforms = new Set<Platform>();
  for (const video of creator.videos) platforms.add(video.platform);
  if (creator.externalLink) {
    const inferred = inferPlatformFromUrl(creator.externalLink.href);
    if (inferred) platforms.add(inferred);
  }
  const order: Platform[] = ["twitch", "youtube", "kick"];
  return order.filter((p) => platforms.has(p));
}

/** Nejlepší dostupný odkaz na tvůrce mimo web — skutečný profil (externalLink), jinak jeho nejnovější doložené video. `undefined`, pokud nemáme ani jedno (v praxi se nestává, ale žádná data se nevymýšlí). */
export function getCreatorPrimaryLink(creator: Pick<CreatorProfile, "videos" | "externalLink">): { href: string; isProfile: boolean } | undefined {
  if (creator.externalLink) return { href: creator.externalLink.href, isProfile: true };
  const first = creator.videos[0];
  return first ? { href: first.url, isProfile: false } : undefined;
}
