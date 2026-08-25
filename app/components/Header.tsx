"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE_NAME } from "../config/site";
import FishSilhouette from "./FishSilhouette";
import SteamIcon from "./SteamIcon";

// "Hra" a "Živě" jsou od začátku na finálních top-level URL (/hra,
// /stream), takže patří do navigace jen tam, kde Header běží bez
// basePath (skutečné stránky), ne pod /demo (kde by ukazovaly na
// neexistující /demo/hra nebo /demo/stream).
const LIVE_LINK = { href: "/stream", label: "Živě" } as const;
const HRA_LINK = { href: "/hra", label: "Hra" } as const;

// /stream je jedna z nejdůležitějších dynamických funkcí webu, takže
// "Živě" chceme hned za logem — i když v NAV_LINKS (a v patičce, kde
// pořadí měnit nechceme) má Ryby jiné pořadové místo.
function buildLinks(basePath: string) {
  if (basePath !== "") return NAV_LINKS;
  const ryby = NAV_LINKS.find((link) => link.href === "/ryby");
  const rest = NAV_LINKS.filter((link) => link.href !== "/ryby");
  return ryby ? [LIVE_LINK, ryby, ...rest, HRA_LINK] : [LIVE_LINK, ...NAV_LINKS, HRA_LINK];
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function tabClass(active: boolean, tilt: string) {
  const base =
    "inline-block rounded border px-3 py-1.5 transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0";
  if (active) {
    return `${base} translate-y-0.5 rotate-0 border-amber-300 bg-[#e8cfa0] text-[#0a2438] shadow-[0_2px_0_0_rgba(0,0,0,0.3)]`;
  }
  return `${base} ${tilt} border-white/10 bg-white/5 text-[#f4ead9]/90 hover:border-amber-300/50 hover:bg-white/10 hover:text-amber-200`;
}

function liveTabClass(active: boolean) {
  const base =
    "inline-flex items-center gap-1.5 rounded border px-3 py-1.5 font-serif transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0";
  if (active) {
    return `${base} translate-y-0.5 rotate-0 border-red-400 bg-[#e8cfa0] text-[#0a2438] shadow-[0_2px_0_0_rgba(0,0,0,0.3)]`;
  }
  return `${base} -rotate-1 border-red-400/70 bg-red-500/10 text-red-200 hover:border-red-300 hover:bg-red-500/20 hover:text-red-100`;
}

function liveMobileClass(active: boolean) {
  const base =
    "flex min-h-[44px] items-center gap-2 rounded border px-4 py-3 font-serif text-base transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 motion-reduce:transition-none";
  if (active) {
    return `${base} border-red-400 bg-[#e8cfa0] text-[#0a2438]`;
  }
  return `${base} border-red-400/70 bg-red-500/10 text-red-200 hover:border-red-300 hover:bg-red-500/20`;
}

function LiveDot({ active }: { active: boolean }) {
  const color = active ? "bg-[#0a2438]" : "bg-red-400";
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
      <span className={`absolute inline-flex h-full w-full animate-live-pulse rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

type HeaderUser = { nickname: string; avatarUrl: string | null } | null;

function SteamAuthControl({ user, pathname }: { user: HeaderUser; pathname: string }) {
  if (user) {
    return (
      <form action="/api/auth/logout" method="POST" className="flex items-center gap-2">
        <input type="hidden" name="returnTo" value={pathname} />
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
        ) : null}
        <span className="max-w-[8rem] truncate font-serif text-sm text-[#f4ead9]/90">{user.nickname}</span>
        <button
          type="submit"
          className="rounded border border-white/10 bg-white/5 px-2.5 py-1 font-serif text-sm text-[#f4ead9]/90 transition hover:border-amber-300/50 hover:bg-white/10 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          Odhlásit
        </button>
      </form>
    );
  }

  return (
    <Link
      href={`/api/auth/steam/login?returnTo=${encodeURIComponent(pathname)}`}
      className="flex flex-col items-center gap-0.5 rounded border border-white/10 bg-white/5 px-2.5 py-1 font-serif text-sm leading-tight text-[#f4ead9]/90 transition hover:border-amber-300/50 hover:bg-white/10 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
    >
      <span>Přihlásit přes</span>
      <span className="inline-flex items-center gap-1 font-semibold">
        <SteamIcon className="h-3.5 w-3.5" />
        Steam
      </span>
    </Link>
  );
}

export default function Header({ basePath = "", user = null }: { basePath?: string; user?: HeaderUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = buildLinks(basePath);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-[#0a2438] via-[#0e3347] to-[#0a2438] shadow-sm shadow-black/20">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href={basePath || "/"}
          className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <FishSilhouette className="h-6 w-6 shrink-0 text-amber-400" />
          <span className="font-serif text-lg text-[#f4ead9]">{SITE_NAME}</span>
        </Link>

        <nav aria-label="Hlavní navigace" className="hidden md:block">
          <ul className="flex flex-wrap items-center gap-1.5 font-serif text-sm">
            {links.map((link, i) => {
              const href = `${basePath}${link.href}`;
              const active = isActive(pathname, href);
              const isLive = link.href === LIVE_LINK.href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    title={isLive ? "Sleduj, kdo právě hraje How to Fish" : undefined}
                    aria-label={isLive ? "Živě – sleduj, kdo právě hraje How to Fish" : undefined}
                    className={isLive ? liveTabClass(active) : tabClass(active, i % 2 === 0 ? "-rotate-1" : "rotate-1")}
                  >
                    {isLive && <LiveDot active={active} />}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden md:block">
          <SteamAuthControl user={user} pathname={pathname} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="flex min-h-[44px] items-center gap-2 rounded border border-white/15 px-3 py-2 font-serif text-sm text-[#f4ead9] transition hover:border-amber-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 md:hidden"
        >
          <span aria-hidden="true" className="flex flex-col gap-[3px]">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </span>
          Menu
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobilní navigace"
          className="border-t border-white/10 bg-[#0a2438] px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-2 font-serif text-base">
            {links.map((link) => {
              const href = `${basePath}${link.href}`;
              const active = isActive(pathname, href);
              const isLive = link.href === LIVE_LINK.href;
              if (isLive) {
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      title="Sleduj, kdo právě hraje How to Fish"
                      aria-label="Živě – sleduj, kdo právě hraje How to Fish"
                      className={liveMobileClass(active)}
                    >
                      <LiveDot active={active} />
                      {link.label}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`block min-h-[44px] rounded border px-4 py-3 transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 motion-reduce:transition-none ${
                      active
                        ? "border-amber-300 bg-[#e8cfa0] text-[#0a2438]"
                        : "border-white/10 bg-white/5 text-[#f4ead9] hover:border-amber-300/50 hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 border-t border-white/10 pt-3">
            <SteamAuthControl user={user} pathname={pathname} />
          </div>
        </nav>
      )}

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 24"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2 w-full text-[#e8cfa0]/25 sm:h-3"
      >
        <polygon
          points="0,12 120,18 240,8 360,16 480,10 600,18 720,8 840,16 960,10 1080,18 1200,8 1320,14 1440,10 1440,24 0,24"
          fill="currentColor"
        />
      </svg>
    </header>
  );
}
