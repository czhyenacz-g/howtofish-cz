// Syrové tvary odpovědí Universal Content API (server-only) — nikdy
// neprotékají do UI, mapují se na CommunityCatch v catches.ts.

export type UcaMedia = {
  id: number;
  record_id: number | null;
  public_url: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type UcaRecordStatus = "pending" | "approved" | "rejected";

export type UcaRecord = {
  id: number;
  collection?: string;
  status: UcaRecordStatus;
  data: Record<string, unknown>;
  media: UcaMedia[];
  created_at: string;
  updated_at: string;
};

export type UcaPaginatedResponse<T> = {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

// Payload uložený do records.data pro collection "catches" — viz
// docs/API.md v universal-content-api a CLAUDE.md poznámka o historickém
// smyslu ukládání steam_id/nickname/caught_at.
export type CatchRecordData = {
  fish_slug: string;
  steam_id: string;
  nickname: string;
  caught_at: string;
  note?: string;
  rights_confirmed: true;
};

// HowToFish typ pro UI — jediné místo, kudy komunitní úlovek "vteče"
// do komponent. Nikdy nepředávej UcaRecord/UcaMedia dál do UI.
export type CommunityCatch = {
  id: number;
  fishSlug: string;
  steamId: string;
  nickname: string;
  caughtAt: string;
  note?: string;
  image: {
    id: number;
    url: string;
    width?: number;
    height?: number;
  };
  createdAt: string;
};
