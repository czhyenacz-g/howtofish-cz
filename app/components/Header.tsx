"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "../config/site";
import HeaderLogo from "./HeaderLogo";
import SteamIcon from "./SteamIcon";
import {
  AchievementIcon,
  BossIcon,
  FishIcon,
  GameIcon,
  GuideIcon,
  ItemIcon,
  LiveIcon,
  LocationIcon,
  UpdateIcon,
  type IconProps,
} from "./icons";

const ICON_BY_HREF: Record<string, (props: IconProps) => React.ReactElement> = {
  "/stream": LiveIcon,
  "/ryby": FishIcon,
  "/navody": GuideIcon,
  "/predmety": ItemIcon,
  "/bossove": BossIcon,
  "/lokace": LocationIcon,
  "/achievementy": AchievementIcon,
  "/aktualizace": UpdateIcon,
  "/hra": GameIcon,
};

const LIVE_LINK = { href: "/stream", label: "Živě" } as const;
const HRA_LINK = { href: "/hra", label: "Hra" } as const;

// /stream je jedna z nejdůležitějších dynamických funkcí webu, takže
// "Živě" chceme hned za logem — i když v NAV_LINKS (a v patičce, kde
// pořadí měnit nechceme) má Ryby jiné pořadové místo. "Hra" se pro
// stejný důvod přidává na konec.
function buildLinks(basePath: string) {
  if (basePath !== "") return NAV_LINKS;
  const ryby = NAV_LINKS.find((link) => link.href === "/ryby");
  const rest = NAV_LINKS.filter((link) => link.href !== "/ryby");
  return ryby ? [LIVE_LINK, ryby, ...rest, HRA_LINK] : [LIVE_LINK, ...NAV_LINKS, HRA_LINK];
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function tabClass(active: boolean) {
  const base =
    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-serif text-sm transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0";
  if (active) {
    return `${base} translate-y-0.5 border-amber-300 bg-gradient-to-b from-[#f3dfb0] to-[#e8cfa0] text-[#0a2438] shadow-[0_2px_0_0_rgba(0,0,0,0.3)]`;
  }
  return `${base} border-white/15 bg-gradient-to-b from-white/10 to-white/[0.03] text-[#f4ead9]/90 shadow-sm hover:border-amber-300/60 hover:text-amber-100`;
}

// "Živě" zůstává vždy v teplé korálové rodině barev (nikdy nepřepíná
// na pískovou kartu jako ostatní položky) — na /stream je jen
// výraznější verze téhož, ne jiná paleta.
function liveTabClass(active: boolean) {
  const base =
    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-serif text-sm transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0";
  if (active) {
    return `${base} translate-y-0.5 border-[#ffb199] bg-gradient-to-b from-[#e8583f] to-[#b8402c] text-[#fff3ec] shadow-[0_0_10px_1px_rgba(255,107,82,0.45)]`;
  }
  return `${base} border-[#ff6b52]/50 bg-gradient-to-b from-[#5c2318] to-[#3a140d] text-[#f7ded3] shadow-sm hover:border-[#ff8a75]/80 hover:from-[#6b2a1c] hover:to-[#45180f]`;
}

function liveMobileClass(active: boolean) {
  const base =
    "flex min-h-[44px] items-center gap-2.5 rounded-md border px-4 py-3 font-serif text-base transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200 motion-reduce:transition-none";
  if (active) {
    return `${base} border-[#ffb199] bg-gradient-to-b from-[#e8583f] to-[#b8402c] text-[#fff3ec] shadow-[0_0_10px_1px_rgba(255,107,82,0.4)]`;
  }
  return `${base} border-[#ff6b52]/50 bg-gradient-to-b from-[#5c2318] to-[#3a140d] text-[#f7ded3]`;
}

function LivePulseDot() {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-current opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}

type HeaderUser = { nickname: string; avatarUrl: string | null } | null;

function SteamAuthControl({ user, pathname }: { user: HeaderUser; pathname: string }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-gradient-to-b from-white/10 to-white/[0.03] px-2.5 py-1.5 font-serif text-sm text-[#f4ead9]/90 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-amber-300/60 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

  if (user) {
    return (
      <form action="/api/auth/logout" method="POST" className="flex items-center gap-2">
        <input type="hidden" name="returnTo" value={pathname} />
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="h-6 w-6 shrink-0 rounded-full border border-white/20" />
        ) : null}
        <span className="max-w-[7rem] truncate font-serif text-sm text-[#f4ead9]/90">{user.nickname}</span>
        <button type="submit" className={base}>
          Odhlásit
        </button>
      </form>
    );
  }

  return (
    <Link href={`/api/auth/steam/login?returnTo=${encodeURIComponent(pathname)}`} className={base}>
      <SteamIcon className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">Přihlásit přes Steam</span>
      <span className="sm:hidden">Přihlásit</span>
    </Link>
  );
}

export default function Header({ basePath = "", user = null }: { basePath?: string; user?: HeaderUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = buildLinks(basePath);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);

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

  // Body scroll lock + jednoduchý focus trap, dokud je mobilní panel otevřený.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    panel?.addEventListener("keydown", onKeyDown);
    const openButton = openButtonRef.current;

    return () => {
      document.body.style.overflow = previousOverflow;
      panel?.removeEventListener("keydown", onKeyDown);
      openButton?.focus();
    };
  }, [open]);

  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-[#0e3347] via-[#0a2438] to-[#081c2c] shadow-sm shadow-black/20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8cfa0]/25 to-transparent"
      />
      <div inert={open} className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
        <HeaderLogo basePath={basePath} />

        <nav aria-label="Hlavní navigace" className="hidden xl:block">
          <ul className="flex items-center gap-1 font-serif text-sm">
            {links.map((link) => {
              const href = `${basePath}${link.href}`;
              const active = isActive(pathname, href);
              const isLive = link.href === LIVE_LINK.href;
              const Icon = ICON_BY_HREF[link.href];
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    title={isLive ? "Sleduj, kdo právě hraje How to Fish" : undefined}
                    aria-label={isLive ? "Živě – sleduj, kdo právě hraje How to Fish" : undefined}
                    className={isLive ? liveTabClass(active) : tabClass(active)}
                  >
                    {isLive && <LivePulseDot />}
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden xl:block">
          <SteamAuthControl user={user} pathname={pathname} />
        </div>

        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="flex min-h-[44px] items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 font-serif text-sm text-[#f4ead9] transition hover:border-amber-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 xl:hidden"
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
        <>
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 xl:hidden"
          />
          <nav
            id="mobile-nav"
            ref={panelRef}
            aria-label="Mobilní navigace"
            className="fixed inset-x-0 top-0 z-40 max-h-screen overflow-y-auto border-b border-white/10 bg-gradient-to-b from-[#0e3347] to-[#081c2c] px-4 pb-4 pt-3 shadow-xl xl:hidden"
          >
            <div className="flex items-center justify-between gap-3 pb-3">
              <HeaderLogo basePath={basePath} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zavřít menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/5 text-[#f4ead9] transition hover:border-amber-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  ✕
                </span>
              </button>
            </div>

            <ul className="flex flex-col gap-2 font-serif text-base">
              {links.map((link) => {
                const href = `${basePath}${link.href}`;
                const active = isActive(pathname, href);
                const isLive = link.href === LIVE_LINK.href;
                const Icon = ICON_BY_HREF[link.href];
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
                        <LivePulseDot />
                        {Icon && <Icon className="h-5 w-5 shrink-0" />}
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
                      className={`flex min-h-[44px] items-center gap-2.5 rounded-md border px-4 py-3 transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 motion-reduce:transition-none ${
                        active
                          ? "border-amber-300 bg-gradient-to-b from-[#f3dfb0] to-[#e8cfa0] text-[#0a2438]"
                          : "border-white/10 bg-white/5 text-[#f4ead9] hover:border-amber-300/50 hover:bg-white/10"
                      }`}
                    >
                      {Icon && <Icon className="h-5 w-5 shrink-0" />}
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
        </>
      )}

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 24"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2 w-full text-[#1c8a95]/30 sm:h-3"
      >
        <polygon
          points="0,14 90,10 180,16 270,9 360,15 450,8 540,14 630,10 720,16 810,9 900,15 990,8 1080,14 1170,10 1260,16 1350,9 1440,14 1440,24 0,24"
          fill="currentColor"
        />
      </svg>
    </header>
  );
}
