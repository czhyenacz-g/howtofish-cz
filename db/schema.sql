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
