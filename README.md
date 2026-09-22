# HowToFish.cz

Český web o **rybaření ve hrách** — katalog 50 her, vlastní detaily her,
ručně vybíraná YouTube videa a nad tím původní obsah o hře **How to Fish**
(encyklopedie úlovků, návody, streamers).

Produkce: <https://howtofish.cz> · Deploy: Vercel (auto z `main`)

---

## Rychlý start

```bash
npm install
cp .env.example .env.local     # a doplň hodnoty (viz níže)
npm run dev                    # http://localhost:3000
```

Produkční build:

```bash
npm run build && npm run start
```

## Kontroly

```bash
npm run lint          # ESLint
npx tsc --noEmit      # typecheck (vlastní skript nemáme)
npm test              # node:test, test/*.test.ts
npm run build         # produkční build
```

## Databáze

Schéma je v `db/schema.sql` (`users`, `game_suggestions`, `game_videos`) a
aplikuje se idempotentně:

```bash
node --env-file=.env.local scripts/apply-schema.mjs
```

Lokální `.env.local` se nejlépe získá přes `vercel env pull .env.local`.

## Env proměnné

Všechny jsou volitelné — web i build fungují bez nich, jednotlivé funkce se
jen přeskočí (viz komentáře v `.env.example`):

| Proměnná | K čemu |
|---|---|
| `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` | živé streamy na `/stream` |
| `YOUTUBE_API_KEY` | živé streamy + discovery herních videí |
| `KICK_CLIENT_ID`, `KICK_CLIENT_SECRET` | živé streamy na `/stream` |
| `STEAM_API_KEY`, `SESSION_SECRET`, `SITE_URL` | přihlášení přes Steam |
| `POSTGRES_URL` / `DATABASE_URL` | Vercel Postgres (doplní Neon integrace) |
| `UNIVERSAL_CONTENT_API_URL`, `UNIVERSAL_CONTENT_API_TOKEN` | komunitní obsah a analytika |
| `GAME_REVALIDATE_SECRET` | interní revalidace herních detailů (produkční secret!) |

Secrety nikdy necommituj — `.env.local` je v `.gitignore`.

## Herní videa (YouTube pipeline)

Ruční, kontrolovaný workflow (žádný crawler ani autoapproval):

```bash
npm run game-videos:discover                      # discovery pro hry s dotazy
npm run game-videos:discover -- --dry-run         # jen report
npm run game-videos:discover -- --games=dredge
npm run game-videos:list [-- --game=<slug>] [-- --strong-only]
npm run game-videos:approve -- <id>
npm run game-videos:reject -- <id>
```

Veřejně se zobrazí jen videa se `is_approved = true AND is_active = true`
(max 6 na detailu). **Pozor na kvótu**: `search.list` má vlastní denní limit
(„Search Queries per day“) — prakticky 2–4 nové hry denně.

## Dokumentace

- [`CLAUDE.md`](./CLAUDE.md) — kompletní dokumentace projektu: struktura,
  katalog her, detaily, YouTube pipeline, kvóta, revalidace, jak přidat hru,
  backlog a konvence.
