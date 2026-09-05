// Určuje, jaký obrázek se má u tvůrce zobrazit na kartě (/streameri +
// homepage sekce Streameři, viz app/components/CreatorImage.tsx) — bez
// vymýšlení nových dat, jen reutilizace existujících zdrojů:
//   1) thumbnail konkrétního How to Fish videa tvůrce
//   2) profilový obrázek/logo (Kick logo z creator-videos.ts)
//   3) lokálně uložený obrázek (zatím žádný zdroj v projektu — připraveno)
//   4) generický HowToFish fallback (odvozený z existujícího loga)
//   5) iniciálový kruh (CreatorAvatar) — vždy garantovaný konec řetězce
import type { CreatorProfile } from "../../data/creators.ts";
import { getVideosAuthoredBy } from "../../data/how-to-fish-videos.ts";

export type CreatorImageCandidate =
  | { type: "video"; src: string; alt: string }
  | { type: "avatar"; src: string; alt: string }
  | { type: "fallback"; src: string; alt: string }
  | { type: "initial" };

// Lehký (27 KB) odvozený z existujícího public/images/howtofish-main-logo.png
// (sharp resize, žádná nová grafika) — jediný obrázek se stejným účelem
// jako "genericHowToFishFallback" ze zadání.
export const GENERIC_FALLBACK_IMAGE = "/images/howtofish-generic-fallback.webp";

/**
 * Nejvhodnější How to Fish video thumbnail tvůrce:
 * 1) data/how-to-fish-videos.ts, jen AUTOR (ne jen "featured") a jen
 *    `howToFishConfirmed: true` (jinak by alt text "hraje How to Fish"
 *    tvrdil něco neověřeného) — nejnovější podle `publishedAt`, `thumbnailUrl`
 *    použit přesně tak, jak je uložený (u těchhle záznamů už ověřený
 *    maxresdefault, viz komentáře v how-to-fish-videos.ts).
 * 2) data/creators.ts `creator.videos` (ze creator-videos.ts) — youtube
 *    položka s `youtubeId`; celý ten soubor je už jen CZ/SK tvůrci u How
 *    to Fish, žádný extra confirmed flag není potřeba. Thumbnail se
 *    skládá jako `hqdefault.jpg` (ne `maxresdefault` — ten u neověřeného
 *    ID umí tiše vrátit HTTP 200 s šedým "no thumbnail" obrázkem;
 *    hqdefault existuje vždy, viz zadání).
 */
function getVideoThumbnail(creator: CreatorProfile): { src: string; alt: string } | null {
  const authored = getVideosAuthoredBy(creator.slug).filter((v) => v.howToFishConfirmed);
  if (authored.length > 0) {
    const newest = [...authored].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];
    return { src: newest.thumbnailUrl, alt: `${creator.name} hraje How to Fish` };
  }

  const youtubeVideo = creator.videos.find((v) => v.platform === "youtube" && v.youtubeId);
  if (youtubeVideo?.youtubeId) {
    return { src: `https://i.ytimg.com/vi/${youtubeVideo.youtubeId}/hqdefault.jpg`, alt: `${creator.name} hraje How to Fish` };
  }

  return null;
}

/**
 * "Avatar" úroveň — profilový obrázek/logo, ne konkrétní video. Zatím
 * jediný existující zdroj je ručně nahrané Kick logo u `creator.videos`
 * (viz creator-videos.ts komentář "logo nahrané ručně přes UCA admin") —
 * žádné nové pole v datovém modelu.
 */
function getAvatarImage(creator: CreatorProfile): { src: string; alt: string } | null {
  const withImage = creator.videos.find((v) => v.image);
  if (withImage?.image) {
    return { src: withImage.image, alt: `Profilový obrázek streamera ${creator.name}` };
  }
  return null;
}

/**
 * Celý fallback řetězec (ne jen první shoda) — UI podle něj při chybě
 * načtení (onError) bezpečně sestoupí o úroveň níž. Poslední položka je
 * vždy `"initial"` (bez `src`, žádný network request, nikdy nechybuje),
 * takže řetězec má garantovaný konec — žádná nekonečná fallback smyčka.
 */
export function getCreatorImageChain(creator: CreatorProfile): CreatorImageCandidate[] {
  const chain: CreatorImageCandidate[] = [];

  const video = getVideoThumbnail(creator);
  if (video) chain.push({ type: "video", ...video });

  const avatar = getAvatarImage(creator);
  if (avatar) chain.push({ type: "avatar", ...avatar });

  // "localImage" úroveň ze zadání: v projektu zatím není žádný lokálně
  // uložený per-tvůrce obrázek, takže se tu záměrně nic nepřidává —
  // až nějaký přibude, patří sem, mezi avatar a generický fallback.

  chain.push({ type: "fallback", src: GENERIC_FALLBACK_IMAGE, alt: `${creator.name} a How to Fish` });
  chain.push({ type: "initial" });

  return chain;
}
