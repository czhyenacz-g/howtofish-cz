// Čisté funkce pro výběr promotion podle route — použité jak server-side
// (banner, přes AdSlot) tak client-side (seller/CharacterCallout, kde je
// pathname dostupný až po mountu přes usePathname()). Žádný server-only
// import, ať jde bezpečně použít z "use client" komponenty.
//
// Priorita: exact page_pattern > wildcard ("/x/*") > global ("*").
// Uvnitř nejkonkrétnější neprázdné skupiny se vybírá weighted-random
// podle `weight` (viz PagePattern na UCA straně pro validaci TVARU
// page_pattern — párování samotné žije jen tady).
export type RouteMatchSpecificity = "exact" | "wildcard" | "global";

const SPECIFICITY_RANK: Record<RouteMatchSpecificity, number> = {
  exact: 3,
  wildcard: 2,
  global: 1,
};

export function matchSpecificity(pattern: string, pathname: string): RouteMatchSpecificity | null {
  if (pattern === "*") {
    return pathname.startsWith("/") ? "global" : null;
  }

  if (pattern === pathname) {
    return "exact";
  }

  if (pattern.endsWith("/*")) {
    const base = pattern.slice(0, -2);
    if (base === "") {
      return pathname.startsWith("/") ? "wildcard" : null;
    }
    if (pathname === base || pathname.startsWith(`${base}/`)) {
      return "wildcard";
    }
  }

  return null;
}

export function pickPromotion<T extends { pagePattern: string; weight: number }>(
  candidates: T[],
  pathname: string
): T | null {
  let bestRank = 0;
  let bestGroup: T[] = [];

  for (const candidate of candidates) {
    const specificity = matchSpecificity(candidate.pagePattern, pathname);
    if (!specificity) continue;

    const rank = SPECIFICITY_RANK[specificity];
    if (rank > bestRank) {
      bestRank = rank;
      bestGroup = [candidate];
    } else if (rank === bestRank) {
      bestGroup.push(candidate);
    }
  }

  if (bestGroup.length === 0) return null;
  if (bestGroup.length === 1) return bestGroup[0];

  return weightedRandom(bestGroup);
}

/** http(s):// = odkaz mimo HowToFish (sponsored/external rel), "/..." = interní. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + Math.max(1, item.weight), 0);
  let roll = Math.random() * totalWeight;

  for (const item of items) {
    roll -= Math.max(1, item.weight);
    if (roll <= 0) return item;
  }

  return items[items.length - 1];
}
