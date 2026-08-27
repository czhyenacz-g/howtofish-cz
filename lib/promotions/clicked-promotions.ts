// 7denní vyřazení SKUTEČNĚ prokliknuté promotion (banner i seller) —
// čistě lokální preference v prohlížeči, žádná analytika/tracking. Klíč
// = stabilní UCA promotion ID (viz PromotionEntry.id v
// universal-content-api/types.ts, tvar "community-{record.id}"), hodnota
// = timestamp posledního kliknutí. Nikdy URL/title/partner/route/Steam
// ID — jen "tuhle konkrétní promotion mi 7 dní neopakuj".
//
// `globalThis.localStorage` (ne `window.`), aby šlo v testech nahradit
// jednoduchým in-memory fake bez DOM/jsdom — stejný vzor jako
// professor-state.ts/seller-state.ts. Na rozdíl od nich je tohle
// záměrně localStorage (ne sessionStorage): vyřazení má přežít zavření
// prohlížeče/tabu po dobu 7 dní, ne jen jednu session.
const STORAGE_KEY = "howtofish:clicked-promotions";
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

type ClickedMap = Record<string, number>;

function readRaw(): ClickedMap {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};

    const result: ClickedMap = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "number" && Number.isFinite(value)) {
        result[id] = value;
      }
    }
    return result;
  } catch {
    // Poškozený JSON, localStorage nedostupné (private mode) apod. —
    // reklamy se mají chovat, jako by nic vyřazeného nebylo.
    return {};
  }
}

function writeRaw(map: ClickedMap): void {
  try {
    if (Object.keys(map).length === 0) {
      globalThis.localStorage?.removeItem(STORAGE_KEY);
      return;
    }
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Zápis selhal (quota, private mode, zakázaný storage) — navigace na
    // affiliate odkaz tím nesmí být nijak ovlivněná (viz markPromotionClicked).
  }
}

function withoutExpired(map: ClickedMap, now: number): ClickedMap {
  const result: ClickedMap = {};
  for (const [id, clickedAt] of Object.entries(map)) {
    if (now - clickedAt < RETENTION_MS) {
      result[id] = clickedAt;
    }
  }
  return result;
}

/** Všechny (ještě platné, ne expirované) prokliknuté promotion ID -> timestamp. */
export function getClickedPromotionIds(now: number = Date.now()): ClickedMap {
  return withoutExpired(readRaw(), now);
}

export function isPromotionRecentlyClicked(id: string, now: number = Date.now()): boolean {
  return id in getClickedPromotionIds(now);
}

/**
 * Vyřadí ze seznamu kandidátů promotions prokliknuté v posledních 7
 * dnech — společný filtr pro seller (CharacterCallout) i banner
 * (AffiliateBannerSlot) výběr, ať se logika nekopíruje na obou místech.
 */
export function excludeRecentlyClicked<T extends { id: string }>(
  candidates: readonly T[],
  now: number = Date.now()
): T[] {
  const clicked = getClickedPromotionIds(now);
  return candidates.filter((candidate) => !(candidate.id in clicked));
}

/**
 * Zavolat SYNCHRONNĚ těsně před navigací na affiliate odkaz (žádný
 * await, žádný redirect) — viz zadání. Nový klik na stejné ID přepíše
 * timestamp na aktuální čas, 7denní okno se tím počítá znovu.
 */
export function markPromotionClicked(id: string, now: number = Date.now()): void {
  const cleaned = withoutExpired(readRaw(), now);
  cleaned[id] = now;
  writeRaw(cleaned);
}

/** Voláno jen když je potřeba explicitní úklid mimo běžné čtení (viz zadání, není podmínkou). */
export function cleanupExpiredPromotionClicks(now: number = Date.now()): void {
  writeRaw(withoutExpired(readRaw(), now));
}
