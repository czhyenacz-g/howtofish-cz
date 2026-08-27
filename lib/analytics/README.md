# First-party event tracking

Malá, first-party event/analytics vrstva nad UCA collection `analytics_events`
(`records:create`, žádná nová DB). Cílem je vidět, které funkce webu se
reálně používají — ne marketingové sledování, ne fingerprinting, žádné
externí nástroje (Google Analytics, Meta Pixel apod.).

## Whitelist eventů

Přesně 11 eventů, viz `ANALYTICS_EVENTS` v `events-shared.ts`:
`steam_login`, `page_view`, `fish_upload`, `suggestion_created`,
`game_started`, `game_score`, `multiplayer_join`, `multiplayer_leave`,
`wave_sent`, `affiliate_click`, `feedback_click`.

Cokoliv mimo tento seznam `trackEvent`/`POST /api/events` tiše zahodí.

## Identita

- `steam_id` — jen pokud je uživatel přihlášený, vždy dopočítané server-side
  ze session (nikdy z klientského payloadu).
- `anonymous_id` — náhodné UUID v `localStorage` (`getOrCreateAnonymousId`),
  bez vazby na IP/UA/fingerprint. Posílá se i u přihlášených uživatelů, takže
  page_view stream jde spárovat před/po loginu bez nutnosti cokoliv
  protahovat přes Steam OpenID redirect.
- Nikdy neukládáme IP adresu, user-agent, e-mail, texty poznámek, názvy
  souborů, URL uploadů/affiliate cílů ani query parametry.

## Zápis

Server-side (preferované, pro většinu eventů): `trackEvent()` v `events.ts`,
přímo přes `createCommunityRecord("analytics_events", data)`. Vždy
fail-open — chyba se jen zaloguje do konzole, primární akce (login, upload,
uložení skóre, ...) nikdy nespadne kvůli analytics.

Client-side (jen `page_view`, `affiliate_click`, `feedback_click`,
`game_started` — viz `CLIENT_TRACKABLE_EVENTS`): `trackClientEvent()` postuje
na interní `POST /api/events`, který teprve server-side zavolá `trackEvent`.
Prohlížeč nikdy nedostane UCA token. Endpoint je rate-limitovaný (~60/min na
anonymous_id/IP, in-memory, best-effort — bez Redisu, nesdílené mezi
instancemi).

## Retence dat

Eventy v `analytics_events` si necháváme **přibližně 12 měsíců** od vzniku.
Není to (zatím) vynucené cronem/UCA-side TTL — je to dokumentovaná politika,
kterou je potřeba ručně dodržet, pokud/až bude potřeba starší data mazat
(např. přes UCA admin nebo API). Když přibude potřeba to skutečně
automatizovat, patří to jako periodická úloha na stranu UCA (má přístup ke
všem projektům), ne do HowToFish kódu.

Zmíněno i na `/ochrana-soukromi` (sekce "Statistiky návštěvnosti").
