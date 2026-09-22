# howtofish.cz — instrukce pro Claude

**HowToFish.cz = rybaření ve hrách.** Web vznikl jako česká komunitní
encyklopedie hry **How to Fish** a v září 2026 se rozšířil na obecný hub o
rybaření ve hrách: katalog 50 her, vlastní detaily her, ručně schvalovaná
YouTube videa a původní How to Fish obsah nad tím vším.

Web není spojen s vývojáři hry How to Fish ani s žádnou další hrou a
nepoužívá jejich oficiální artwork — viz disclaimer v `app/config/site.ts`
(`DISCLAIMER`), zobrazený v patičce na každé stránce.

---

## Stack

- **Next.js 15** (App Router), **React 19**, **TypeScript**, **Tailwind CSS**
- **Vercel** (deploy auto z GitHubu na push do `main`), **Vercel Postgres**
  (`@vercel/postgres`) pro `users` / `game_suggestions` / `game_videos`
- **Universal Content API (UCA)** pro komunitní obsah a analytiku
- **Vercel Analytics** + volitelně GoatCounter (`app/config/analytics.ts`)

---

## Struktura projektu

```
app/
  layout.tsx              # Root layout (html/body, fonty, Analytics, globální overlaye)
  page.tsx                # Homepage = rozcestník: hry → videa → streameři → How to Fish → minihry
  robots.ts, sitemap.ts   # SEO; sitemap generuje i herní detaily (jen ty s vlastní stránkou)
  config/site.ts          # Název, popis, doména, NAV_LINKS (encyklopedické sekce), Steam URL
  components/             # Sdílené UI — Header/Footer, GameCard, GameCover, GameVideoCard,
                          # GameVideosSection, CreatorCard, RotatingQuote, OceanWaves, …
  (sections)/             # Route group se společným Header/Footer layoutem
    hry-s-rybarenim/      # Veřejný katalog TOP 50 her (+ formulář „Chybí tu hra?“)
    games/[slug]/         # Univerzální detail hry — jen pro hry s `hasDetail`
    o-hre/ predmety/ bossove/ lokace/ navody/ achievementy/ multiplayer/ …
  ryby/                   # Původní encyklopedie How to Fish + /ryby/[slug]
  stream/, streameri/     # Živé streamy (agregátor) a katalog tvůrců
  hra/                    # Krabí invaze (vlastní minihra) + /hra/rybareni
  api/og, api/events, api/game-videos/revalidate
data/                     # fish.ts, items/bosses/locations/guides, games.ts, game-details.ts,
                          # creator-videos.ts, creators.ts, how-to-fish-videos.ts, setup-videos.ts
lib/                      # streams/, games/, youtube/, creators/, universal-content-api/, analytics/
scripts/                  # game-videos-discover.ts, game-videos-review.ts, apply-schema.mjs
db/schema.sql             # users, game_suggestions, game_videos
```

Architektura je **route-independent** (`basePath` prop v Header/Footer) —
pochází z doby, kdy web běžel pod `/demo`. Žádné `/demo` ani `SITE_LAUNCHED`
už v projektu není.

---

## A) Veřejné sekce

| Routa | Co to je |
|---|---|
| `/` | Homepage: hero „Rybaření ve hrách.“, rotující herní citáty, sekce Hry / Videa / Streameři, blok „Původní How to Fish“ a vedlejší „Zahraj si“ |
| `/hry-s-rybarenim` | Katalog TOP 50 her s rybařením (karty jen vizuálně; klikací jsou jen hry s vlastní stránkou) |
| `/games/[slug]` | Detail hry — hero s coverem a badge, „Rybaření v této hře“, „Co hledat“, „Další hry ze série“, videa |
| `/streameri`, `/streameri/[slug]` | Katalog tvůrců a jejich profily |
| `/stream` | Agregátor živých streamů (Twitch + YouTube + Kick providery) |
| `/ryby`, `/ryby/[slug]`, `/predmety`, `/bossove`, `/lokace`, `/navody`, `/achievementy`, `/o-hre` | Původní How to Fish obsah (encyklopedie + o hře) |
| `/multiplayer`, `/hra`, `/hra/rybareni` | Multiplayer ostrov a vlastní minihry |
| `/videa/[slug]` | Detaily How to Fish videí (veřejný index `/videa` neexistuje) |

---

## B) Katalog her (`data/games.ts`)

- `gameEntries` — 50 her, každá s `name`, `slug`, `series`, `platforms`,
  `tags`, `fishingImportance` (`core`/`major`/`minor`/`minigame`),
  `audienceType` (`current`/`evergreen`/`nostalgia`/`fishing-core`),
  `monitoringPriority` (`high`/`medium`/`low`), `status`
  (`available`/`preparing`/`planned`), `hasDetail`, `detailHref`, `image?`,
  `isFeatured` a volitelně `aliases`, `searchKeywords`, `relatedGames`, `quotes`.
- **Max 1 veřejná karta na herní sérii** (např. Pokémon, Final Fantasy, The
  Elder Scrolls) — další díly patří do `relatedGames`, dokud nedostanou
  vlastní detail. Hlídá to `test/games-catalog.test.ts`.
- Pomocné funkce: `getOrderedGames()` (available → preparing → planned),
  `getGamesWithDetail()`, `getGameBySlug()`, `getGamesWithGameDetailPage()`,
  `hasGameDetailPage()`, `getGameQuotes()`, `PILOT_GAME_SLUGS`/`getPilotGames()`.
- **Obrázky**: `image` má jen How to Fish (vlastní asset projektu). Ostatní
  karty vykreslují stylový placeholder (`GameCover`, barevné varianty podle
  slugu). **Nikdy nevkládej cizí artwork** (Steam CDN, IGDB, wiki, Google) —
  lepší jednotný placeholder než licenční problém.

---

## C) Detail hry (`data/game-details.ts`)

- Vlastní `/games/[slug]` stránku má jen hra s `hasDetail: true` **a**
  `detailHref === "/games/<slug>"` (`getGamesWithGameDetailPage()`), takže
  karty bez detailu nikdy nevedou na 404. **How to Fish je výjimka** —
  `detailHref: "/ryby"` a vlastní `/games` stránku záměrně nemá.
- `app/(sections)/games/[slug]/page.tsx` je statický (`dynamicParams = false`,
  `generateStaticParams` z dat) → neznámý slug vrací 404. Sitemap se plní
  automaticky ze `getGamesWithGameDetailPage()`.
- Editorský obsah (tagline, odstavce „Rybaření v této hře“, `whatToLookFor`,
  `seoTitle`, `metaDescription`) žije v `data/game-details.ts`, ne v komponentě.
- Sekce „Další hry ze série“ vykresluje `relatedGames` jako **text** (žádné
  fake routy). Sekce se streamery se nevykreslí, dokud pro hru nemáme data.

---

## D) YouTube pipeline

Ruční, kontrolovaný workflow — **žádný crawler, cron ani autoapproval**.

```bash
npm run game-videos:discover                          # všechny hry s kurátorovanými dotazy
npm run game-videos:discover -- --dry-run             # jen report, nic neukládat
npm run game-videos:discover -- --games=no-mans-sky,dredge
npm run game-videos:list [-- --game=<slug>] [-- --strong-only]
npm run game-videos:approve -- <id>
npm run game-videos:reject -- <id>
```

- Zdroj: oficiální **YouTube Data API v3** přes `lib/youtube/client.ts`
  (jediné místo, kde se čte `YOUTUBE_API_KEY`; používá ho i live provider
  `lib/streams/youtube.ts`). Scraping YouTube HTML se nepoužívá.
- Dotazy: `lib/games/video-queries.ts` (`CURATED_QUERIES`, max 5 na hru,
  u druhé vlny 3 kvůli kvótě) — kurátorované, ne generované z aliases × keywords.
- Relevance: `lib/games/video-relevance.ts` — deterministické skóre 0–100
  (hra v titulku +35, rybaření v titulku +30, specifický herní termín +15,
  shoda s dotazem +10, jen v popisu +5, Shorts/kompilace −10) s **tvrdým
  vyřazením** (nikde rybaření / nikde hra / v titulku jiná hra z katalogu) a
  kontextovými negativy pro IRL/merch obsah (výjimka: herní termíny jako
  Minecraftí „Lure“). Per-game negativa jen tam, kde je audit skutečně našel.
- **`reviewThreshold = 60`** (pod tím se kandidát vůbec neukládá) a
  **`publishThreshold = 70`** (`isStrongCandidate` = jen odznak pro ruční
  kontrolu, **NIKDY autoapproval**).
- Uložení: tabulka `game_videos` (`UNIQUE (platform, external_id)` → dedupe,
  výchozí `is_approved = false`), upsert přebírá nejnovější skóre.
- Veřejně se zobrazuje **jen `is_approved = true AND is_active = true`**,
  max **6 videí** na detailu (řazení relevance → datum); homepage bere 6
  videí s diverzitou max 1 na hru (`getHomepageGameVideos()`).
  `reject` = `is_active = false` (video zůstává v DB kvůli deduplikaci).
- Karty videí: thumbnail + title + kanál + datum + délka + zhlédnutí + externí
  odkaz na YouTube. **Žádný iframe ani autoplay.**

---

## E) YouTube kvóta (důležité!)

Hlavní omezení **není** jen 10 000 kvótních jednotek denně — `search.list` má
**vlastní metriku „Search Queries per day“**:

- `search.list` = 100 jednotek, `videos.list` = 1 jednotka.
- Praktická zkušenost: po **~50 `search.list` voláních za den** začne API
  vracet `429 RESOURCE_EXHAUSTED` (i když je kvótních jednotek ještě dost).
- Doporučení: **2–4 nové hry denně**, 3 dotazy na hru, při 429 okamžitě
  zastavit (CLI to dělá samo — `quotaExceeded` + BLOCKER a `exit 1`).
- Limit se **neobchází** paralelními klíči ani jinými účty.

---

## F) Revalidace po approve/reject

- Env: **`GAME_REVALIDATE_SECRET`** (Vercel Production + Preview, lokálně
  `.env.local`) — bez něj endpoint vždy vrací 401 (fail-closed).
  `GAME_REVALIDATE_URL` je volitelné; default je `SITE_URL`.
- Flow: `approve`/`reject` v CLI → `POST /api/game-videos/revalidate`
  s hlavičkou `x-revalidate-secret` → `revalidatePath("/games/<slug>")`.
- Endpoint je interní: constant-time porovnání secretu a validace slugu proti
  katalogu (jinak 400). Bez secretu se **nikdy veřejně neotevře**.
- Stránky detailů mají navíc ISR `revalidate = 600`.

---

## G) Jak přidat novou hru

1. `data/games.ts` — záznam (`game(...)`, max 1 na sérii) + `aliases`.
2. `searchKeywords` — herní rybářská terminologie (např. „Gone Fission“,
   „Aquarius“, „Angler quests“); může sloužit i jako specifický termín.
3. `lib/games/video-queries.ts` — 3–5 kurátorovaných dotazů.
4. `npm run game-videos:discover -- --games=<slug>` (hlídej kvótu!).
5. `npm run game-videos:list -- --game=<slug>` → ručně `approve`/`reject`.
6. `data/game-details.ts` — tagline, „Rybaření v této hře“, `whatToLookFor`,
   `seoTitle`, `metaDescription` (jen když má hra dost schválených videí).
7. `hasDetail: true` + `detailHref: "/games/<slug>"`.
8. `npm test` + `npx tsc --noEmit` + `npm run build`.

---

## H) Původní How to Fish obsah

- `data/fish.ts` (`FishEntry`, pole `sources`/`verification` — úrovně
  `game-confirmed` > `official` > `community` > `unverified`) — `/ryby` i
  `/ryby/[slug]` se generují samy. Necituj bez ověření ze dvou nezávislých
  zdrojů a nikdy nepoužívej `howtofishgame.wiki` ani jinou wiki, jejíž obsah
  se neshoduje s ostatními zdroji.
- **Komunitní content pattern** (`/predmety`, `/bossove`, `/lokace`,
  `/navody`): jeden základ nad UCA (`lib/universal-content-api/community.ts` —
  create, media upload, `status=approved` s cache ~60 s, vlastní `pending`),
  nad tím tenké doménové moduly (`items.ts`/`bosses.ts`/`locations.ts`/
  `guides.ts`) a UI v `app/components/community/`. Sdílená validace je
  v `lib/community/validation.ts`. Nová sekce = nový `data/x.ts` + `lib/
  universal-content-api/x.ts` + UCA collection (řádek přes tinker, ne kód) +
  `app/(sections)/x/`.
- **`/stream` — agregátor:** `lib/streams/` obsahuje nezávislé providery
  (`twitch.ts`, `youtube.ts`, `kick.ts`) normalizující data do `LiveStream`,
  a `get-live-streams.ts`, který je volá přes `Promise.allSettled` (chyba
  jednoho nesráží ostatní). Provider bez env se tiše přeskočí
  (`status: "not-configured"`), cache `revalidate: 60`, žádný client polling.
- **Typografie:** fonty jen v `app/layout.tsx` (`next/font/google` — Bree
  Serif jako `--font-heading`/`font-serif`, Inter jako `--font-body`/`font-sans`).

---

## I) Backlog (NIC z toho neimplementuj bez zadání)

**NEXT** (až se k projektu vrátíme): dokončit discovery pro DREDGE a No Man's
Sky → případně jejich detaily · dalších 5–10 YouTube her · Twitch live
discovery · Kick live discovery · rozšířit streamery mimo CZ/SK.

**LATER:** reálné rybaření · propojení herních a skutečných ryb · fishing gear
· affiliate · shop.

---

## Konvence

- **Tmavý theme**: `bg-gray-900 text-white` na body (`app/layout.tsx`)
- **Barvy**: amber pro akcenty (`text-amber-400`), teal/dark-blue pro vodní motivy
- **Jazyk**: česky
- **Komponenty**: interaktivní části do `app/components/` s `"use client"`
- **Sdílení**: OG image přes `/api/og?title=...&sub=...`
- Nová položka hlavního menu = `app/components/nav-config.ts` (`buildLinks`),
  encyklopedická sekce navíc do `NAV_LINKS` v `app/config/site.ts` (Footer
  i sitemap ho berou automaticky). **Nevytvářej routu jen kvůli navbaru.**
- **Nikdy necommituj** `.env.local` ani jiné secrety; produkční secrety patří
  do Vercelu (`vercel env add … <environment>`).

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
- [x] lint / typecheck / testy / build prošly
- [x] Git repo `czhyenacz-g/howtofish-cz`, deploy auto z `main`
- [x] Vercel projekt `howtofish-cz` nasazen
- [x] Doména `howtofish.cz` + `www` přesměrování na Vercel
- [x] Katalog her, herní detaily a YouTube pipeline nasazené
- [x] `GAME_REVALIDATE_SECRET` v Production + Preview
- [ ] E-mail přesměrování přes Zoho Mail nastaveno (viz starter CLAUDE.md)
- [ ] Google Search Console připojeno
