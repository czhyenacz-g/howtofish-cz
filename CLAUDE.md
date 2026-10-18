# howtofish.cz — instrukce pro Claude

**HowToFish.cz = rybaření ve hrách.** Web vznikl jako česká komunitní
encyklopedie hry **How to Fish** a v září 2026 se rozšířil na obecný hub o
rybaření ve hrách: katalog 50 her, vlastní detaily her, ručně schvalovaná
YouTube videa a původní How to Fish obsah nad tím vším.

**Od 18. 10. 2026 je projekt v režimu minimální údržby** (viz sekce
„Režim minimální údržby“ níž): nepřidávej funkce bez výslovného zadání,
komunitní funkce a multiplayer jsou vypnuté přepínači a web má běžet bez
pravidelných zásahů. Jediný monetizační kanál je decentní affiliate
(Dognet) + interní kampaň „první skutečné rybaření“.

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
  layout.tsx              # Root layout (html/body, fonty, Analytics, PageViewTracker) — žádné overlaye
  page.tsx                # Homepage: hero → hry → banner „první rybaření“ → původní How to Fish → videa → streameři
  robots.ts, sitemap.ts   # SEO; lastModified jen tam, kde data nesou skutečné datum
  config/site.ts          # Název (HowToFish.cz), popis, doména, NAV_LINKS (encyklopedie), Steam URL
  config/features.ts      # Přepínače režimu údržby (komunita, multiplayer, Steam login)
  components/             # Sdílené UI — Header/Footer, GameCard, GameCover, GameVideoCard,
                          # RealFishingPromo (+Link, real-fishing-promo.ts), StarterKitAffiliateLink, …
  (sections)/             # Route group se společným Header/Footer layoutem
    hry-s-rybarenim/      # Veřejný katalog TOP 50 her
    games/[slug]/         # Univerzální detail hry — jen pro hry s `hasDetail` (+ volitelný plný průvodce)
    prvni-rybareni/       # SEO průvodce prvním skutečným rybařením v ČR + startovací set (affiliate)
    o-hre/ predmety/ bossove/ lokace/ navody/ achievementy/ multiplayer/ …
  ryby/                   # Původní encyklopedie How to Fish + /ryby/[slug]
  stream/, streameri/     # Živé streamy (agregátor) a katalog tvůrců
  hra/                    # Krabí invaze (vlastní minihra) + /hra/rybareni
  api/og, api/events, api/game-videos/revalidate
data/                     # fish.ts, items/bosses/locations/guides, games.ts, game-details.ts,
                          # creator-videos.ts, creators.ts, how-to-fish-videos.ts, setup-videos.ts,
                          # first-fishing.ts (metadata/FAQ/zdroje /prvni-rybareni), starter-kits.ts
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
| `/` | Homepage: hero „Rybaření ve hrách“, sekce Hry (12 detailů), banner „první rybaření“, Původní How to Fish, Videa (+1 AdSlot), Streameři a živé vysílání |
| `/hry-s-rybarenim` | Katalog TOP 50 her s rybařením (klikací jsou jen hry s vlastní stránkou, štítek „Máme obsah“) |
| `/games/[slug]` | Detail hry — hero, „Rybaření v této hře“, volitelný plný průvodce + FAQ (Minecraft), „Co hledat“, videa, banner „první rybaření“ |
| `/prvni-rybareni` | Průvodce prvním skutečným rybařením (lístek, povolenka, revíry, výbava) + startovací set přes Dognet |
| `/streameri`, `/streameri/[slug]` | Katalog tvůrců a jejich profily |
| `/stream` | Agregátor živých streamů (Twitch 60 s, YouTube 30 min; Kick bez credentials se přeskakuje) |
| `/ryby`, `/ryby/[slug]`, `/predmety`, `/bossove`, `/lokace`, `/navody`, `/achievementy`, `/o-hre` | Původní How to Fish obsah (encyklopedie + o hře) |
| `/hra`, `/hra/rybareni` | Krabí invaze (žebříček vyžaduje Steam login) a minihra; v menu ne, jen v patičce |
| `/multiplayer` | Pozastaveno (`MULTIPLAYER_ENABLED=false`) — informační stránka, noindex, mimo sitemap |
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
- **Veřejný štítek** se odvozuje z `isGameAvailable()` (`hasDetail` + `detailHref`)
  → „Máme obsah“. Interní `status` (`available`/`preparing`/`planned`) se
  veřejně NEzobrazuje — žádné „Brzy“/„Připravujeme“.
- Pomocné funkce: `getOrderedGames()` (hry s detailem první, pak podle `status`),
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
  „Co hledat“ zobrazuje jen ručně psané `whatToLookFor` (žádný fallback na
  interní `searchKeywords`).
- **Plný průvodce** (zatím jen Minecraft): volitelná pole `h1`, `guide`
  (sekce s odstavci, odrážkami, tabulkami a poznámkou), `faq` (vykreslí se i
  jako FAQPage JSON-LD — text musí sedět), `sources` a `lastReviewed`
  (= sitemap lastModified). Fakta ověřuj na minecraft.wiki, rozlišuj Java ×
  Bedrock a nevymýšlej čísla. Komponenta nesmí obsahovat názvy konkrétních
  her (hlídá `test/game-detail-page.test.ts`).
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
  (`status: "not-configured"`), žádný client polling. Cache: Twitch 60 s,
  **YouTube live 1800 s** (`LIVE_REVALIDATE_SECONDS` v `lib/streams/youtube.ts`
  — `search.list` sdílí denní limit s video pipeline, max 48 volání/den).
- **Typografie:** fonty jen v `app/layout.tsx` (`next/font/google` — Bree
  Serif jako `--font-heading`/`font-serif`, Inter jako `--font-body`/`font-sans`).

---

## I) Režim minimální údržby (od 18. 10. 2026)

- `app/config/features.ts`: `COMMUNITY_CONTRIBUTIONS_ENABLED = false`
  (formuláře „Navrhnout…“ → 307 na sekci, „Navrhnout opravu“, upload úlovků,
  „Chybí tu hra?“, anonymní FeedbackCallout), `MULTIPLAYER_ENABLED = false`
  (`/multiplayer` = „pozastaveno“, noindex). Kód, server actions i data
  zůstávají — zapnutí je jen změna přepínače.
- Steam login je v hlavičce jen na `/hra*` (`isSteamLoginRelevant`), protože
  ho potřebuje žebříček Krabí invaze; přihlášený má odhlášení všude.
- Root layout nerenderuje CharacterCallout (Profesor/Prodavač),
  MultiplayerIslandTab ani AmbientAudioToggle (komponenty v repu zůstávají).
- Menu: **Hry · How to Fish ▾ (NAV_LINKS + O hře) · Streameři · Živě**.
- Žádné veřejné sliby („brzy“, „připravujeme“, „postupně doplníme“) —
  hlídá `test/maintenance-mode.test.ts`.
- Neplánuj nové funkce, cron, placené služby ani nové API závislosti bez
  výslovného zadání. Vyhodnocení monetizace: **18. 4. 2027** (cíl ≥ 100 Kč/měs.
  nad provozní náklady, ambiciózně 1 000 Kč; provozní rozpočet navíc max.
  50 Kč/měs.).

**Backlog (NIC z toho neimplementuj bez zadání):** discovery pro DREDGE a
No Man's Sky · další YouTube hry · Kick credentials · další startovací sety
(max. 3, jen plně ověřené — kandidát: DELPHIN Yakuza kaprařský set).

---

## J) Affiliate, reklamy a kampaň „první rybaření“

- **Dognet**: jediná konfigurace v `lib/affiliate/dognet.ts` (`chid=rKROKhrd`,
  `d1=htf`). URL stav přes `buildDognetAffiliateUrl(destination, d2)` —
  nikdy ručně, `chid` nikdy neměň bez potvrzení vlastníka. Konvence `d2`:
  `first-fishing` (průvodce `/prvni-rybareni`), `legacy-banner` (náhrada
  starých bannerů), `gear-{creator}-{product}` (technika streamerů).
- **Startovací sety**: `data/starter-kits.ts` (max. `MAX_STARTER_KITS = 3`),
  každý s ověřenou produktovou URL, obsahem balení, „pro koho / na co ne“ a
  `verifiedAt`. **Nikdy** cenu ani skladovost (mění se, web je neaktualizuje).
  Odkaz: `StarterKitAffiliateLink` (`rel="sponsored noopener noreferrer"`,
  nová karta). Na stránce vždy affiliate upozornění (`AFFILIATE_DISCLOSURE`).
- **RealFishingPromo**: interní banner (ne affiliate) → `/prvni-rybareni`.
  Je na homepage, na `/games/[slug]` (dole) a pod návody `/navody/[slug]`.
  Max. 1 na stránku, nikdy v layoutu, na `/prvni-rybareni`, právních
  stránkách ani 404 (hlídá `test/first-fishing.test.ts`).
- **Bannery (AdSlot)**: UCA collection `promotions` (`placement`
  banner/seller, `page_pattern`, `weight`, `href`, `active`, médium = obrázek).
  Max. 1 slot na stránku, až pod hlavním obsahem, bez placeholderu, ne na
  právních stránkách. Seller promotions se dnes nikde nezobrazují (Prodavač
  je vypnutý).
- **Úpravy UCA promotions**: `PATCH …/collections/promotions/records/{id}`
  **nahrazuje celé `data`** — vždy načti záznam, ulož zálohu a pošli kompletní
  `data` jen se změněným polem. Deaktivace = `active: false`, nikdy mazání.
- Audit odkazů: HTTP 403/429 (Allegro, Dognet anti-bot) není důvod k odstranění
  → stav UNVERIFIED, ruční kontrola v prohlížeči.
- **Měření** (first-party, `lib/analytics/events-shared.ts` → UCA
  `analytics_events`): `real_fishing_banner_click` (`placement`, zdrojová
  stránka v `path`), `starter_kit_affiliate_click` (`product_id`,
  `placement`), `page_view` i pro `/prvni-rybareni`. Provize se vyhodnocují v
  Dognet administraci, organika v GSC.

---

## Konvence

- **Tmavý theme**: `bg-gray-900 text-white` na body (`app/layout.tsx`)
- **Barvy**: amber pro akcenty (`text-amber-400`), teal/dark-blue pro vodní motivy
- **Jazyk**: česky
- **Komponenty**: interaktivní části do `app/components/` s `"use client"`
- **Sdílení**: OG image přes `/api/og?title=...&sub=...`
- Menu = `app/components/nav-config.ts` (`buildLinks`, 4 položky);
  encyklopedická sekce do `NAV_LINKS` v `app/config/site.ts` (dropdown
  „How to Fish“ i patička ji berou automaticky; sitemap má vlastní seznam).
  **Nevytvářej routu jen kvůli navbaru.**
- Titulky: šablona `%s | HowToFish.cz`; stránka s vlastním `| HowToFish.cz`
  v textu musí použít `title: { absolute: … }` (jinak dvojitý suffix).
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
- [x] Google Search Console připojeno (property spravuje vlastník)

## Final Report → Content API (povinné po každém úkolu)

Po dokončení každého úkolu (implementace, oprava, analýza) ulož výslednou
zprávu (Final Report) i do Content API a uživateli vrať její veřejný
odkaz — uživatel ho vkládá přímo do ChatGPT. Příklad výsledku:
https://content-api.darbujan.com/r/UccMohrIRCtAW2lKcncviP8y

**Jak na to:**

1. Token je na tomhle stroji v `~/.config/claude-code/content-api-token`
   (chmod 600). **Nikdy** ho nezapisuj do repozitáře, reportu ani logu.
   Když soubor chybí (jiný stroj), zeptej se uživatele — token
   nehádej a nevytvářej nový.
2. Napiš report v Markdownu v této struktuře: **Summary / Changed files /
   Implementation / Validation / Git / Issues / Recommended next step**.
3. Odešli ho `POST https://content-api.darbujan.com/api/reports`:

   ```bash
   # report.json = {"source":"claude-code","project":"<slug-projektu>",
   #   "title":"<krátký titulek>","status":"completed|partial|failed",
   #   "report":"<Markdown>","branch":"<větev>","commit_hash":"<hash, pokud je>"}
   CONTENT_API_TOKEN=$(cat ~/.config/claude-code/content-api-token) \
     sh /srv/projects/universal-content-api/scripts/publish-report.sh report.json
   ```

   Bez helper skriptu stejně funguje přímý `curl -X POST … -H
   "Authorization: Bearer $CONTENT_API_TOKEN" -H "Content-Type:
   application/json" -d @report.json`. JSON sestav přes `python3`/`jq`
   (kvůli escapování Markdownu), ne ručně. Soubor dej do scratchpadu,
   ne do repozitáře.
4. Odpověď `201` obsahuje `url` (veřejná HTML stránka `/r/{token}`)
   a `api_url` (JSON). Finální odpověď uživateli **ukonči holou `url`
   na samostatném řádku** — nic dalšího na tom řádku.
5. Když endpoint neodpovídá nebo chybí token, výslovně to napiš — ale
   kvůli tomu neblokuj dokončení a shrnutí samotného úkolu.

Podrobnosti API: `docs/claude-reports.md` v repozitáři
`universal-content-api`.
