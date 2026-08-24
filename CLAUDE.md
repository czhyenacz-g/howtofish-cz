# howtofish.cz — instrukce pro Claude

Neoficiální český komunitní web pro hru **How to Fish** — návody, ryby,
předměty, bossové, lokace, achievementy a přehled aktualizací. Založeno ze
starter šablony (`czhyenacz-g/starter`) s vlastní, čistou historií.

Web není spojen s vývojáři hry How to Fish a nepoužívá jejich oficiální
logo — viz disclaimer v `app/config/site.ts` (`DISCLAIMER`), zobrazený v
patičce na každé stránce.

---

## Stack

- **Next.js 15** (App Router), **React 19**, **TypeScript**, **Tailwind CSS**
- **Vercel Analytics** (`@vercel/analytics`), volitelně **GoatCounter**
  (`app/config/analytics.ts`)
- Deploy: **Vercel** (auto-deploy z GitHubu na push do `main`)
- Zatím žádná databáze, backend ani CMS — obsah se plánuje v
  Markdown/MDX/JSON přímo v repozitáři.

---

## Struktura projektu

Veřejná homepage (`/`) je teď jednoduchá **coming soon** stránka (spuštění
1. 9. 2026, CTA na Steam). Celý dřívější rozpracovaný web (nav, sekce,
karty) žije pod `/demo` — dostupný jen na přímou URL, `noindex,nofollow`,
mimo sitemap. Až bude `/demo` hotové, přesune se zpět na `/` (viz níže).

```
app/
  layout.tsx             # Root layout, jen html/body/Analytics — bez Header/Footer
  page.tsx                # Coming soon homepage (veřejná)
  robots.ts, sitemap.ts   # SEO — /demo je disallow a mimo sitemap
  icon.tsx                 # Dynamicky generovaný favicon
  config/
    site.ts                # Název, popis, doména, navigace, disclaimer, Steam URL
    analytics.ts            # GoatCounter kód
  components/
    Header.tsx, Footer.tsx  # Přijímají `basePath` prop (route-independent)
    SectionPlaceholder.tsx
  demo/
    layout.tsx              # Header/Footer chrome + noindex,nofollow pro celý /demo strom
    page.tsx                 # Bývalá homepage (karty sekcí)
    navody/ ryby/ predmety/ bossove/ lokace/ achievementy/ aktualizace/
      page.tsx                # Placeholder stránky sekcí (zatím bez reálných dat)
  api/og/route.tsx          # Dynamický OG image endpoint

content/
  guides/                # Budoucí MDX/Markdown návody
  updates/                # Budoucí přehledy aktualizací hry

data/
  fish/ items/ bosses/ locations/   # Budoucí JSON data pro jednotlivé sekce
```

`content/` a `data/` zatím obsahují jen `.gitkeep` — struktura je
připravená, aby zavedení skutečného obsahu nevyžadovalo refactoring.

**Budoucí přesun `/demo` → `/`:** smaž `app/page.tsx` (coming soon),
přesuň `app/demo/*` o úroveň výš (uprav relativní importy zpět), smaž
`app/demo/layout.tsx` (jeho Header/Footer/noindex nahraď v root layoutu),
a v `app/demo/page.tsx` smaž konstantu `BASE = "/demo"`. `NAV_LINKS`
v `config/site.ts` ani `Header`/`Footer` component se měnit nemusí — cesty
se skládají přes `basePath` prop, který při přesunu prostě přestaneš
předávat.

---

## Konvence

- **Tmavý theme**: `bg-gray-900 text-white` na body (`app/layout.tsx`)
- **Barvy**: amber pro akcenty (`text-amber-400`)
- **Jazyk**: česky
- **Komponenty**: interaktivní části do `app/components/` s `"use client"`
- **Sdílení**: OG image přes `/api/og?title=...&sub=...`
- Nová sekce v navigaci = přidat do `NAV_LINKS` v `app/config/site.ts`
  (Header, Footer i sitemap ho automaticky vezmou)

---

## Povolení: konverze obrázků do WebP

Nástroj `cwebp` (a obdobné čistě lokální konverzní nástroje) smí Claude
používat bez ptaní na povolení — včetně kopírování/přesouvání zdrojových i
výstupních souborů obrázků v rámci `public/`.

---

## DNS

Doména `howtofish.cz` je registrovaná přes VEDOS a spravuje se nástrojem
`vedos-dns` (`/srv/projects/vedos-dns-cli`) — vždy nejdřív dry-run, `--apply`
jen na záznamy patřící této doméně.

---

## Checklist pro nasazení

- [x] `npm install` proběhl
- [x] lint / typecheck / build prošly
- [x] Git repo vytvořeno a pushnuté (`czhyenacz-g/howtofish-cz`)
- [x] Vercel projekt `howtofish-cz` nasadil
- [ ] Doména `howtofish.cz` – DNS přepnuto na Vercel (viz report z prvního
      nasazení / poslední commit)
- [ ] `www.howtofish.cz` přesměrováno na `howtofish.cz`
- [ ] Skutečný obsah (návody, ryby, předměty, bossové, lokace, achievementy,
      aktualizace) doplněn
- [ ] E-mail přesměrování přes Zoho Mail nastaveno (viz starter CLAUDE.md)
- [ ] Google Search Console připojeno
