export const SITE_NAME = "How to Fish CZ";
export const SITE_TAGLINE = "How to Fish česky";
export const SITE_DOMAIN = "howtofish.cz";
export const SITE_URL = `https://${SITE_DOMAIN}`;

export const SITE_TITLE = "How to Fish CZ Wiki – ryby, návody, bossové a lokace";

export const SITE_DESCRIPTION =
  "Česká encyklopedie hry How to Fish. Ryby, úlovky, lokace, návody a tipy.";

export const DISCLAIMER =
  "Neoficiální český komunitní web pro hru How to Fish. Tento web není provozován ani podporován vývojáři hry.";

export const STEAM_URL = "https://store.steampowered.com/app/4001890/How_to_Fish/";

// "Aktualizace" tu záměrně chybí — /aktualizace je zatím jen
// placeholder (žádný reálný obsah), takže je noindex a mimo hlavní
// navigaci, dokud nebude mít co ukázat. Route zůstává dostupná přímo
// na URL, viz app/(sections)/aktualizace/page.tsx.
export const NAV_LINKS = [
  { href: "/navody", label: "Návody" },
  { href: "/ryby", label: "Ryby" },
  { href: "/predmety", label: "Předměty" },
  { href: "/bossove", label: "Bossové" },
  { href: "/lokace", label: "Lokace" },
  { href: "/achievementy", label: "Achievementy" },
] as const;
