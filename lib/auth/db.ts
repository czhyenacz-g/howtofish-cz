import { sql } from "@vercel/postgres";

export type DbUser = {
  id: number;
  steamId: string;
  nickname: string;
  avatarUrl: string | null;
  isBlocked: boolean;
};

function mapRow(row: {
  id: number;
  steam_id: string;
  nickname: string;
  avatar_url: string | null;
  is_blocked: boolean;
}): DbUser {
  return {
    id: row.id,
    steamId: row.steam_id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    isBlocked: row.is_blocked,
  };
}

// Vytvoří uživatele při prvním přihlášení, jinak jen aktualizuje
// nickname/avatar. is_blocked se v UPDATE větvi záměrně nenastavuje —
// nesmí se resetovat žádným přihlášením ani aktualizací profilu.
export async function upsertSteamUser(params: {
  steamId: string;
  nickname: string;
  avatarUrl: string | null;
}): Promise<DbUser> {
  const { rows } = await sql<{
    id: number;
    steam_id: string;
    nickname: string;
    avatar_url: string | null;
    is_blocked: boolean;
  }>`
    INSERT INTO users (steam_id, nickname, avatar_url)
    VALUES (${params.steamId}, ${params.nickname}, ${params.avatarUrl})
    ON CONFLICT (steam_id) DO UPDATE
      SET nickname = EXCLUDED.nickname,
          avatar_url = EXCLUDED.avatar_url,
          updated_at = now()
    RETURNING id, steam_id, nickname, avatar_url, is_blocked
  `;
  return mapRow(rows[0]);
}

/**
 * Steam ID všech blokovaných uživatelů — jeden dávkový dotaz (ne
 * per-uživatel lookup), použito při čtení veřejně zobrazovaných seznamů
 * (např. multiplayer presence), aby blokovaný uživatel nikdy nebyl
 * vidět, i kdyby ho zablokovali až po jeho posledním heartbeatu.
 */
export async function getBlockedSteamIds(): Promise<Set<string>> {
  const { rows } = await sql<{ steam_id: string }>`
    SELECT steam_id FROM users WHERE is_blocked = true
  `;
  return new Set(rows.map((row) => row.steam_id));
}

export async function getUserBySteamId(steamId: string): Promise<DbUser | null> {
  const { rows } = await sql<{
    id: number;
    steam_id: string;
    nickname: string;
    avatar_url: string | null;
    is_blocked: boolean;
  }>`
    SELECT id, steam_id, nickname, avatar_url, is_blocked
    FROM users
    WHERE steam_id = ${steamId}
    LIMIT 1
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}
