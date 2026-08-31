// Čistá (bez "use client") navigační konfigurace + helpery, oddělené od
// Header.tsx. Header.tsx je "use client" a používá React hooky přímo,
// takže ho nejde importovat pod --conditions=react-server (viz
// test/header-nav.test.ts) — tenhle modul jde importovat a testovat
// napřímo.
import { NAV_LINKS } from "../config/site.ts";

export type SimpleNavLink = { href: string; label: string };
export type NavGroup = { label: string; children: SimpleNavLink[] };
export type NavEntry = SimpleNavLink | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

export const LIVE_LINK: SimpleNavLink = { href: "/stream", label: "Živě" };
// Krabí invaze je konkrétní minihra (dřív jen obecný label "Hra") —
// odlišená vlastním jménem a krabí ikonou místo gamepadu.
export const HRA_LINK: SimpleNavLink = { href: "/hra", label: "Krabí invaze" };
// "O hře" je informační stránka o samotné hře, ne o minihře — v hlavním
// pill menu by přidala další položku a riskovala přetečení/dvouřádkový
// header, proto je v desktop headeru jen jako menší sekundární odkaz a
// v mobilním panelu vložená do hlavního seznamu.
export const O_HRE_LINK: SimpleNavLink = { href: "/o-hre", label: "O hře" };
export const MULTIPLAYER_LINK: SimpleNavLink = { href: "/multiplayer", label: "Multiplayer ostrov" };

// "Svět" sloučí dřívější dvě samostatné hlavní položky (Lokace, Bossové)
// do jednoho dropdownu — uvolní přesně jeden slot v pill-navigaci, který
// zabere Multiplayer ostrov, takže celkový počet top-level položek
// zůstává stejný jako dřív (viz komentář ve Footer.tsx o 9 položkách bez
// flex-wrap).
export const WORLD_GROUP: NavGroup = {
  label: "Svět",
  children: [
    { href: "/lokace", label: "Lokace" },
    { href: "/bossove", label: "Bossové" },
  ],
};

function findLink(href: string): SimpleNavLink {
  const link = NAV_LINKS.find((l) => l.href === href);
  if (!link) throw new Error(`nav-config: NAV_LINKS neobsahuje ${href}`);
  return link;
}

// /stream je jedna z nejdůležitějších dynamických funkcí webu, takže
// "Živě" chceme hned za logem — i když v NAV_LINKS (a v patičce, kde
// pořadí měnit nechceme) má Ryby jiné pořadové místo. "Krabí invaze" a
// "Multiplayer ostrov" se pro stejný důvod přidávají na konec.
export function buildLinks(basePath: string): NavEntry[] {
  if (basePath !== "") return [...NAV_LINKS];
  return [
    LIVE_LINK,
    findLink("/ryby"),
    findLink("/navody"),
    findLink("/predmety"),
    WORLD_GROUP,
    findLink("/achievementy"),
    MULTIPLAYER_LINK,
    HRA_LINK,
  ];
}

// Jen pro mobilní panel — "O hře" vložené před poslední položku (Krabí
// invaze), preferované pořadí ze zadání.
export function buildMobileLinks(links: NavEntry[]): NavEntry[] {
  return [...links.slice(0, -1), O_HRE_LINK, links[links.length - 1]];
}

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isEntryActive(pathname: string, basePath: string, entry: NavEntry): boolean {
  if (isNavGroup(entry)) {
    return entry.children.some((child) => isActive(pathname, `${basePath}${child.href}`));
  }
  return isActive(pathname, `${basePath}${entry.href}`);
}
