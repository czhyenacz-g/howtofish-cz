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

-- Kandidátní YouTube videa k hrám (/games/[slug], POC discovery — viz
-- lib/games/*). Jedna řádka = jedno video; UNIQUE (platform, external_id)
-- zajišťuje, že opakovaný discovery run nic nezduplikuje.
-- Nic se nepublikuje automaticky: `is_approved` je výchozně FALSE a mění
-- se ručně přes scripts/game-videos-review.ts. `is_active = false` je
-- odmítnuté video (zůstává kvůli deduplikaci, ale nezobrazuje se).
CREATE TABLE IF NOT EXISTS game_videos (
  id SERIAL PRIMARY KEY,
  game_slug TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'youtube',
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  channel_title TEXT NOT NULL,
  thumbnail_url TEXT,
  published_at TIMESTAMPTZ,
  relevance_score INTEGER NOT NULL DEFAULT 0,
  search_query TEXT,
  view_count BIGINT,
  duration_seconds INTEGER,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (platform, external_id)
);

-- Veřejné čtení (schválená + aktivní videa jedné hry) i seznam kandidátů.
CREATE INDEX IF NOT EXISTS game_videos_public_idx ON game_videos (game_slug, is_approved, is_active);
