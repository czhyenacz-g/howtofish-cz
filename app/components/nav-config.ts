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

export const STREAMERI_LINK: SimpleNavLink = { href: "/streameri", label: "Streameři" };
export const LIVE_LINK: SimpleNavLink = { href: "/stream", label: "Živě" };
export const O_HRE_LINK: SimpleNavLink = { href: "/o-hre", label: "O hře" };
// Katalog her, ve kterých se rybaří — první položka menu.
export const HRY_LINK: SimpleNavLink = { href: "/hry-s-rybarenim", label: "Hry" };

// Původní How to Fish obsah v jednom dropdownu — encyklopedické sekce
// (NAV_LINKS, stejné pořadí jako v patičce) + informační stránka O hře.
export const WORLD_GROUP: NavGroup = {
  label: "How to Fish",
  children: [...NAV_LINKS, O_HRE_LINK],
};

// Hlavní menu v režimu minimální údržby (říjen 2026): jen čtyři položky.
// Krabí invaze je v patičce, Multiplayer ostrov je pozastavený (viz
// app/config/features.ts) a "Videa" tu nejsou, protože veřejný index
// /videa neexistuje.
export function buildLinks(basePath: string): NavEntry[] {
  if (basePath !== "") return [...NAV_LINKS];
  return [HRY_LINK, WORLD_GROUP, STREAMERI_LINK, LIVE_LINK];
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
