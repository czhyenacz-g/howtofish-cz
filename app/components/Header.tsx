"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LIVE_LINK,
  O_HRE_LINK,
  WORLD_GROUP,
  buildLinks,
  buildMobileLinks,
  isActive,
  isEntryActive,
  isNavGroup,
  type NavEntry,
} from "./nav-config.ts";
import HeaderLogo from "./HeaderLogo";
import SteamIcon from "./SteamIcon";
import {
  AchievementIcon,
  BossIcon,
  CrabIcon,
  FishIcon,
  GuideIcon,
  InfoIcon,
  ItemIcon,
  LiveIcon,
  LocationIcon,
  MultiplayerIcon,
  StreamerIcon,
  UpdateIcon,
  type IconProps,
} from "./icons";

const ICON_BY_HREF: Record<string, (props: IconProps) => React.ReactElement> = {
  "/streameri": StreamerIcon,
  "/stream": LiveIcon,
  "/ryby": FishIcon,
  "/navody": GuideIcon,
  "/predmety": ItemIcon,
  "/bossove": BossIcon,
  "/lokace": LocationIcon,
  "/achievementy": AchievementIcon,
  "/aktualizace": UpdateIcon,
  "/hra": CrabIcon,
  "/o-hre": InfoIcon,
  "/multiplayer": MultiplayerIcon,
};

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

// Jednoduchý přístupný dropdown pro "Svět" (Lokace + Bossové) — hover na
// myš, klik/Enter/Space na klávesnici (nativní chování <button>), zavírá
// se při změně routy (`open` prop řízený z Header, ne lokální state, aby
// šel resetovat spolu s mobilním panelem).
function WorldDropdown({
  basePath,
  pathname,
  open,
  onOpenChange,
}: {
  basePath: string;
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const active = isEntryActive(pathname, basePath, WORLD_GROUP);

  return (
    <li className="relative" onMouseEnter={() => onOpenChange(true)} onMouseLeave={() => onOpenChange(false)}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className={tabClass(active)}
      >
        <LocationIcon className="h-4 w-4 shrink-0" />
        {WORLD_GROUP.label}
        <span aria-hidden="true" className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && (
        <ul
          role="menu"
          aria-label={WORLD_GROUP.label}
          className="absolute left-0 top-full z-20 mt-1 min-w-[10rem] rounded-md border border-white/15 bg-[#0e3347] py-1 shadow-xl"
        >
          {WORLD_GROUP.children.map((child) => {
            const href = `${basePath}${child.href}`;
            const childActive = isActive(pathname, href);
            const Icon = ICON_BY_HREF[child.href];
            return (
              <li key={href} role="none">
                <Link
                  href={href}
                  role="menuitem"
                  aria-current={childActive ? "page" : undefined}
                  onFocus={() => onOpenChange(true)}
                  className={`flex items-center gap-2 px-3 py-2 font-serif text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                    childActive ? "text-amber-300" : "text-[#f4ead9]/90 hover:bg-white/5 hover:text-amber-200"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
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
  const [worldOpen, setWorldOpen] = useState(false);
  const [mobileWorldOpen, setMobileWorldOpen] = useState(false);
  const links = buildLinks(basePath);
  const mobileLinks = buildMobileLinks(links);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setOpen(false);
    setWorldOpen(false);
    setMobileWorldOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setWorldOpen(false);
      }
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

  function renderMobileEntry(entry: NavEntry) {
    if (isNavGroup(entry)) {
      const active = isEntryActive(pathname, basePath, entry);
      return (
        <li key={entry.label}>
          <button
            type="button"
            aria-expanded={mobileWorldOpen}
            aria-controls="mobile-world-group"
            onClick={() => setMobileWorldOpen((v) => !v)}
            className={`flex min-h-[44px] w-full items-center justify-between gap-2.5 rounded-md border px-4 py-3 text-left font-serif text-base transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 motion-reduce:transition-none ${
              active
                ? "border-amber-300 bg-gradient-to-b from-[#f3dfb0] to-[#e8cfa0] text-[#0a2438]"
                : "border-white/10 bg-white/5 text-[#f4ead9] hover:border-amber-300/50 hover:bg-white/10"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <LocationIcon className="h-5 w-5 shrink-0" />
              {entry.label}
            </span>
            <span aria-hidden="true" className={`text-xs transition-transform ${mobileWorldOpen ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
          {mobileWorldOpen && (
            <ul id="mobile-world-group" className="mt-1.5 flex flex-col gap-1.5 pl-4">
              {entry.children.map((child) => {
                const href = `${basePath}${child.href}`;
                const childActive = isActive(pathname, href);
                const Icon = ICON_BY_HREF[child.href];
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={childActive ? "page" : undefined}
                      className={`flex min-h-[44px] items-center gap-2.5 rounded-md border px-4 py-3 transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 motion-reduce:transition-none ${
                        childActive
                          ? "border-amber-300 bg-gradient-to-b from-[#f3dfb0] to-[#e8cfa0] text-[#0a2438]"
                          : "border-white/10 bg-white/5 text-[#f4ead9] hover:border-amber-300/50 hover:bg-white/10"
                      }`}
                    >
                      {Icon && <Icon className="h-5 w-5 shrink-0" />}
                      {child.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    const href = `${basePath}${entry.href}`;
    const active = isActive(pathname, href);
    const isLive = entry.href === LIVE_LINK.href;
    const Icon = ICON_BY_HREF[entry.href];

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
            {entry.label}
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
          {entry.label}
        </Link>
      </li>
    );
  }

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
            {links.map((entry) => {
              if (isNavGroup(entry)) {
                return (
                  <WorldDropdown
                    key={entry.label}
                    basePath={basePath}
                    pathname={pathname}
                    open={worldOpen}
                    onOpenChange={setWorldOpen}
                  />
                );
              }

              const href = `${basePath}${entry.href}`;
              const active = isActive(pathname, href);
              const isLive = entry.href === LIVE_LINK.href;
              const Icon = ICON_BY_HREF[entry.href];
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
                    {entry.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* "O hře" jako méně výrazný sekundární odkaz (obyčejný podtržený
            text, ne pill) — viz nav-config.ts, proč není v hlavní navigaci. */}
        <Link
          href={`${basePath}${O_HRE_LINK.href}`}
          aria-current={isActive(pathname, `${basePath}${O_HRE_LINK.href}`) ? "page" : undefined}
          className={`hidden font-serif text-sm underline-offset-2 transition hover:text-amber-300 hover:underline xl:inline ${
            isActive(pathname, `${basePath}${O_HRE_LINK.href}`) ? "text-amber-300 underline" : "text-[#f4ead9]/70"
          }`}
        >
          {O_HRE_LINK.label}
        </Link>

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
              {mobileLinks.map((entry) => renderMobileEntry(entry))}
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
