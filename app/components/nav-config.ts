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

// Streameři jsou teď hlavní obsahová osa webu (viz zadání
// "restrukturalizace na streamery") — první položka hned za logem.
export const STREAMERI_LINK: SimpleNavLink = { href: "/streameri", label: "Streameři" };
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

// "Svět How to Fish" sloučí VŠECHNY dřívější samostatné encyklopedické
// hlavní položky (Ryby, Předměty, Návody, Lokace, Achievementy, Bossové)
// do jednoho dropdownu (viz zadání "hlavní menu má být výrazně
// jednodušší") — postaveno přímo nad NAV_LINKS, ať existuje jediný zdroj
// pravdy pro "jaké encyklopedické sekce web má" (stejné pořadí i v patičce).
export const WORLD_GROUP: NavGroup = {
  label: "Svět How to Fish",
  children: [...NAV_LINKS],
};

// Streameři/Živě/Svět/Krabí invaze/Multiplayer — 5 top-level položek
// místo dřívějších 8 (viz zadání "výrazně jednodušší menu"). "O hře"
// zůstává mimo hlavní pill-navigaci (viz O_HRE_LINK výš).
export function buildLinks(basePath: string): NavEntry[] {
  if (basePath !== "") return [...NAV_LINKS];
  return [STREAMERI_LINK, LIVE_LINK, WORLD_GROUP, MULTIPLAYER_LINK, HRA_LINK];
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
