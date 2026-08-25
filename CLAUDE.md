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

Veřejná homepage (`/`) je jednoduchá **coming soon** stránka (nové hlavní
logo, spuštění 1. 9. 2026, CTA na Steam). Celý dřívější rozpracovaný web
(nav, sekce, karty) žije pod `/demo` — dostupný jen na přímou URL,
`noindex,nofollow`, mimo sitemap. Až bude `/demo` hotové, přesune se zpět
na `/` (viz níže).

`/ryby` a `/ryby/[slug]` jsou ale výjimka — první opravdový obsah
(encyklopedie úlovků) rovnou na finální URL, mimo `/demo`. Do spuštění
webu (1. 9. 2026) jsou řízené přes `SITE_LAUNCHED` v `app/config/site.ts`:
dokud je `false`, `app/ryby/layout.tsx` nastavuje `noindex,nofollow` pro
celý strom a `app/sitemap.ts`/`app/robots.ts` je vynechávají/disallow-ují.
**Spuštění 1. 9.:** přepni `SITE_LAUNCHED` na `true` — noindex zmizí a
`/ryby` i všechny záznamy se objeví v sitemap automaticky. Zbývá už jen
smazat coming-soon homepage a začít z ní na `/ryby` odkazovat.

```
app/
  layout.tsx             # Root layout, jen html/body/Analytics — bez Header/Footer
  page.tsx                # Coming soon homepage (veřejná), logo v public/images/
  robots.ts, sitemap.ts   # SEO — /demo trvale, /ryby dočasně (SITE_LAUNCHED) disallow/mimo sitemap
  icon.tsx                 # Dynamicky generovaný favicon
  config/
    site.ts                # Název, popis, doména, navigace, disclaimer, Steam URL, SITE_LAUNCHED
    analytics.ts            # GoatCounter kód
  components/
    Header.tsx, Footer.tsx  # Přijímají `basePath` prop (route-independent)
    SectionPlaceholder.tsx
    FishCard.tsx, FishImage.tsx  # Karta úlovku + placeholder/obrázek
  demo/
    layout.tsx              # Header/Footer chrome + noindex,nofollow pro celý /demo strom
    page.tsx                 # Bývalá homepage (karty sekcí)
    navody/ predmety/ bossove/ lokace/ achievementy/ aktualizace/ ryby/
      page.tsx                # Placeholder stránky sekcí (zatím bez reálných dat)
  ryby/
    layout.tsx               # Header/Footer + podmíněný noindex (SITE_LAUNCHED)
    page.tsx                  # Přehled — FishBrowser (vyhledávání + filtr)
    FishBrowser.tsx            # "use client" — hledání podle name/czechName, filtr kategorie
    [slug]/page.tsx            # Detail úlovku, generateStaticParams z data/fish.ts
  api/og/route.tsx          # Dynamický OG image endpoint

data/
  fish.ts                     # Jeden zdroj dat pro /ryby i /ryby/[slug] — typ FishEntry
  items.ts bosses.ts locations.ts guides.ts  # Kurátorovaný základ pro /predmety,
                               # /bossove, /lokace, /navody — viz "Komunitní content
                               # pattern" níže.

content/
  updates/                # Budoucí přehledy aktualizací hry

public/images/
  howtofish-main-logo.png  # Produkční kopie loga (originál v temp/, gitignored)
```

**Budoucí přesun `/demo` → `/`:** smaž `app/page.tsx` (coming soon),
přesuň `app/demo/*` o úroveň výš (uprav relativní importy zpět), smaž
`app/demo/layout.tsx` (jeho Header/Footer/noindex nahraď v root layoutu),
a v `app/demo/page.tsx` smaž konstantu `BASE = "/demo"`. `NAV_LINKS`
v `config/site.ts` ani `Header`/`Footer` component se měnit nemusí — cesty
se skládají přes `basePath` prop, který při přesunu prostě přestaneš
předávat. `/ryby` se tímto přesunem vůbec nezabývá — je už na finální URL.

**Přidání nové ryby/tvora:** stačí přidat záznam do `fishEntries` v
`data/fish.ts` (typ `FishEntry`) — `/ryby` i statické stránky
`/ryby/[slug]` se dogenerují samy při dalším buildu. Necituj bez ověření
ze dvou nezávislých zdrojů, viz pole `sources`/`verification` (úrovně
`game-confirmed` > `official` > `community` > `unverified`) u každého
záznamu a poznámka v hlavičce souboru. Nikdy nepoužívej jako zdroj
`howtofishgame.wiki` ani jinou wiki, jejíž obsah se neshoduje s ostatními
nezávislými zdroji (typický vzorec pro automaticky generovaný obsah).

**Typografie:** globální font se nastavuje jen v `app/layout.tsx`
(`next/font/google` — Bree Serif jako `--font-heading` / `font-serif` pro
nadpisy, navigaci, tlačítka a karty; Inter jako `--font-body` / `font-sans`
pro delší texty). Nepřidávej fonty ručně do jednotlivých komponent — obě
proměnné jsou dostupné globálně přes `tailwind.config.ts`.

**`/stream` — agregátor živých streamů:** `lib/streams/` obsahuje
nezávislé providery (`twitch.ts`, `youtube.ts`, `kick.ts`) normalizující
data do sdíleného typu `LiveStream`, a `get-live-streams.ts`, který je
volá přes `Promise.allSettled` (chyba jednoho providera nesráží ostatní),
slučuje a řadí podle `viewerCount`. Každý provider bez nastavených env
proměnných se tiše přeskočí (`status: "not-configured"`), API požadavky
jsou cachované přes `fetch(..., { next: { revalidate: 60 } })` +
`export const revalidate = 60` na stránce — nikdy client-side polling.
Přidání dalšího providera (např. Trovo) = nový soubor v `lib/streams/`
se stejným návratovým typem `ProviderResult`, zapsat do pole volaného
v `get-live-streams.ts`. Potřebné env proměnné viz `.env.example`.

**Komunitní content pattern (`/predmety`, `/bossove`, `/lokace`,
`/navody`):** jeden reusable základ nad Universal Content API (UCA),
`lib/universal-content-api/community.ts` — create record, media upload,
čtení `status=approved` (cache ~60s) a vlastních `status=pending` (server-side
`filter[steam_id]`, bez cache). Nad tím čtyři tenké doménové moduly
(`lib/universal-content-api/items.ts` / `bosses.ts` / `locations.ts` /
`guides.ts`) — každý mapuje syrový `UcaRecord` na svůj vlastní jednoduchý
typ (`ItemEntry`, `BossEntry`, ...; společný základ `CommunityContentBase`
v `lib/universal-content-api/types.ts`) a skládá kurátorovaná data
(`data/{items,bosses,locations,guides}.ts`, autor `HowToFish.cz`) s
komunitními `approved` záznamy (autor = Steam nickname). UI je složené z
`app/components/community/` (`CommunityDataTable` — tabulka na desktopu,
karty na mobilu; `CommunityThumbnail` s lightboxem; `AuthorBadge`;
`CorrectionForm` pro "Navrhnout opravu"). Sdílená validace formulářů žije
v `lib/community/validation.ts` (rights checkbox, screenshot, duplicate
check přes `isDuplicateTitle` — porovnává curated + approved + vlastní
pending). Nová sekce podle tohoto vzoru = nový `data/x.ts` + nový
`lib/universal-content-api/x.ts` + nová UCA collection `x_suggestions`
(jen DB řádek přes tinker, ne kód) + `app/(sections)/x/` s `page.tsx`,
`XBrowser.tsx` a `navrhnout/` (evaluate + actions + formulář).

**Content workflow (kurátorovaný vs. komunitní):**
- Kurátorovaný obsah: 1) research, 2) ověření (2+ nezávislé zdroje, viz
  `sources`/`verification` v `data/fish.ts`), 3) přidání do `data/*.ts`,
  4) `npm test` + `tsc --noEmit`, 5) commit.
- Komunitní obsah: 1) přihlášený Steam uživatel odešle návrh, 2) UCA ho
  uloží jako `pending` (server-side vynucené, nikdy z formData), 3) admin
  (případně později AI-assisted review) ho ve Filamentu schválí/zamítne,
  4) `approved` záznam je z UCA rovnou veřejný — **žádné ruční přepisování
  do Gitu**, to je hlavní výhoda tohoto patternu oproti kurátorovanému
  obsahu.

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
