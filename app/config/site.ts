export const SITE_NAME = "HowToFish.cz";
export const SITE_TAGLINE = "How to Fish česky";
export const SITE_DOMAIN = "howtofish.cz";
export const SITE_URL = `https://${SITE_DOMAIN}`;

export const SITE_TITLE = "HowToFish.cz – rybaření ve hrách";

export const SITE_DESCRIPTION =
  "Web o hrách, ve kterých se dá rybařit, a česká encyklopedie hry How to Fish — ryby, návody, bossové a lokace.";

export const DISCLAIMER =
  "Neoficiální český komunitní web pro hru How to Fish. Tento web není provozován ani podporován vývojáři hry.";

export const STEAM_URL = "https://store.steampowered.com/app/4001890/How_to_Fish/";

// Encyklopedické sekce How to Fish — zdroj pro dropdown v hlavičce
// (nav-config.ts) i patičku.
export const NAV_LINKS = [
  { href: "/ryby", label: "Ryby" },
  { href: "/navody", label: "Návody" },
  { href: "/predmety", label: "Předměty" },
  { href: "/bossove", label: "Bossové" },
  { href: "/lokace", label: "Lokace" },
  { href: "/achievementy", label: "Achievementy" },
] as const;
