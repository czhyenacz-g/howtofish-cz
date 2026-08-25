# /stream — stav a co zbývá (Kick)

Stav k 2026-08-25.

## Hotovo

- **Twitch** ✅ nastaveno a funguje naostro (`TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`
  jsou ve Vercelu ve všech prostředích — Production/Preview/Development).
- **YouTube** ✅ nastaveno a funguje naostro (`YOUTUBE_API_KEY` ve Vercelu).
  Klíč je funkční i v momentech, kdy YouTube provider vrací 0 výsledků —
  to je normální stav (zrovna nikdo na YouTube hru nestreamuje), ne chyba.
- Aggregator (`lib/streams/get-live-streams.ts`) obě platformy správně
  slučuje, řadí a stránka `/stream` je v produkci vidět.

## Co chybí — Kick

Kick momentálně (podle Hynka) má výpadek, takže založení developer
aplikace nešlo dokončit. Provider `lib/streams/kick.ts` je už napsaný a
otestovaný proti oficiální dokumentaci (docs.kick.com) — jen čeká na
credentials. Do té doby se tiše přeskakuje (`status: "not-configured"`),
zbytek stránky funguje normálně.

### Krok 1 — založit Kick developer app (až bude Kick zase v pořádku)

1. **Zapnout 2FA** na Kick účtu (Account Settings) — bez toho není
   Developer sekce vůbec přístupná.
2. Jít na **kick.com/settings/developer** (Account Settings → Developer).
3. Vytvořit novou aplikaci ("Create App").
4. Jako **redirect URL** dát `https://howtofish.cz` — používáme
   `client_credentials` flow (app token, bez loginu uživatele), takže se
   redirect URL fakticky nikdy nezavolá, ale formulář ho vyžaduje.
5. Zkopírovat vygenerované **Client ID** a **Client Secret**.

### Krok 2 — přidat credentials do Vercelu

Až budou k dispozici `KICK_CLIENT_ID` a `KICK_CLIENT_SECRET`, přidat je do
všech tří prostředí (stejně jako u Twitche/YouTube):

```bash
cd /srv/projects/howtofish-cz
for env in production preview development; do
  printf '%s' "<KICK_CLIENT_ID hodnota>" | vercel env add KICK_CLIENT_ID "$env"
done
for env in production preview development; do
  printf '%s' "<KICK_CLIENT_SECRET hodnota>" | vercel env add KICK_CLIENT_SECRET "$env"
done
```

### Krok 3 — redeploy a ověření

```bash
vercel --prod
```

Pak zkontrolovat produkci:

```bash
curl -s https://howtofish-cz.vercel.app/stream | grep -oE 'Kick data se momentálně nepodařilo obnovit|>Kick<'
```

- Pokud se objeví řádek s platformou Kick a žádná chybová hláška →
  funguje.
- Pokud se objeví "Kick data se momentálně nepodařilo obnovit" →
  credentials jsou špatně nebo Kick API pořád nedostupné — zkontrolovat
  přímo `POST https://id.kick.com/oauth/token` (grant_type=client_credentials)
  a `GET https://api.kick.com/public/v2/categories?name=How%20to%20Fish`.

## Po dokončení

Smazat tento soubor (`stream-todo.md`) — je to jen pracovní poznámka, ne
trvalá dokumentace projektu.
