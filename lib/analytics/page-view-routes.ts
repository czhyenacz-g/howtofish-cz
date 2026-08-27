// Page view se loguje jen pro hlavní veřejné stránky (viz zadání) —
// žádné API routes, auth callbacky, admin, submission utility stránky,
// statické assety, robots/sitemap. Stejný vzor jako isCharacterCalloutRoute
// v resolve-callout.ts (exact routes + regex pro dynamické detaily), ale
// samostatný seznam — tenhle se nemá měnit spolu s callout pravidly.
const EXACT_ROUTES = new Set([
  "/",
  "/ryby",
  "/predmety",
  "/bossove",
  "/lokace",
  "/navody",
  "/achievementy",
  "/stream",
  "/hra",
  "/multiplayer",
  "/o-hre",
]);

// /ryby/navrhnout a /navody/navrhnout jsou formulářové submission
// stránky, ne obsahové detaily — vyloučené (negative lookahead), viz zadání.
const FISH_DETAIL_PATTERN = /^\/ryby\/(?!navrhnout$)[^/]+$/;
const GUIDE_DETAIL_PATTERN = /^\/navody\/(?!navrhnout$)[^/]+$/;

export function isPageViewRoute(pathname: string): boolean {
  return EXACT_ROUTES.has(pathname) || FISH_DETAIL_PATTERN.test(pathname) || GUIDE_DETAIL_PATTERN.test(pathname);
}
