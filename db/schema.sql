-- HowToFish CZ — uživatelé (Steam login).
-- Jediná tabulka, záměrně minimální — viz app/config/site.ts a lib/auth/*.
-- Aplikuje se jednorázově přes scripts/apply-schema.mjs (žádný migration
-- framework, jen "CREATE TABLE IF NOT EXISTS" — bezpečně opakovatelné).

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  steam_id TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Návrhy her z veřejného formuláře "Chybí tu tvoje hra?" na
-- /hry-s-rybarenim (viz lib/community/game-suggestions.ts). Záměrně
-- minimální a BEZ vazby na Steam účet — návrh může poslat kdokoliv.
-- `status` drží 'pending' | 'approved' | 'rejected' (schvaluje se ručně,
-- žádné admin UI k tomu zatím není).
CREATE TABLE IF NOT EXISTS game_suggestions (
  id SERIAL PRIMARY KEY,
  game_name TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rate limit formuláře počítá návrhy za poslední hodinu (viz
-- checkGameSuggestionRateLimit) — index drží ten dotaz levný.
CREATE INDEX IF NOT EXISTS game_suggestions_created_at_idx ON game_suggestions (created_at DESC);
