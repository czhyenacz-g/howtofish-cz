import { fishEntries } from "../../../data/fish.ts";
import type { CatchRecordData } from "../../../lib/universal-content-api/types.ts";

// Čistá, snadno testovatelná validace uploadu — bez next/headers, bez
// síťových volání. uploadCatchAction (Server Action) jen dodá
// aktuálního uživatele ze session a zavolá tohle.
export type CurrentUserLike = { steamId: string; nickname: string; isBlocked: boolean } | null;

export type EvaluationResult =
  | { ok: true; payload: CatchRecordData; file: File }
  | { ok: false; message: string };

export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
export const NOTE_MAX_LENGTH = 300;
export const GENERIC_ERROR = "Úlovek se momentálně nepodařilo odeslat. Zkus to prosím znovu.";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const OFFSET_PATTERN = /^[+-]\d{2}:\d{2}$/;

export function evaluateCatchUpload(user: CurrentUserLike, formData: FormData): EvaluationResult {
  if (!user) {
    return { ok: false, message: "Pro nahrání úlovku se přihlas přes Steam." };
  }
  if (user.isBlocked) {
    return { ok: false, message: "Tento účet momentálně nemůže nahrávat obsah." };
  }

  const fishSlug = String(formData.get("fishSlug") ?? "");
  const fish = fishEntries.find((f) => f.slug === fishSlug);
  if (!fish) {
    return { ok: false, message: GENERIC_ERROR };
  }

  const file = formData.get("screenshot");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Vyber prosím screenshot úlovku." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, message: "Screenshot je moc velký (limit 8 MB)." };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, message: "Podporované formáty: JPG, PNG nebo WebP." };
  }

  const date = String(formData.get("caughtDate") ?? "");
  const time = String(formData.get("caughtTime") ?? "");
  const offset = String(formData.get("utcOffset") ?? "");
  if (!DATE_PATTERN.test(date) || !TIME_PATTERN.test(time) || !OFFSET_PATTERN.test(offset)) {
    return { ok: false, message: "Zadej platné datum a čas chycení." };
  }

  const caughtAt = `${date}T${time}:00${offset}`;
  if (Number.isNaN(new Date(caughtAt).getTime())) {
    return { ok: false, message: "Zadej platné datum a čas chycení." };
  }

  const noteRaw = formData.get("note");
  const note = typeof noteRaw === "string" ? noteRaw.trim() : "";
  if (note.length > NOTE_MAX_LENGTH) {
    return { ok: false, message: `Poznámka může mít nejvýš ${NOTE_MAX_LENGTH} znaků.` };
  }

  if (formData.get("rightsConfirmed") !== "on") {
    return { ok: false, message: "Potvrď prosím, že smíš screenshot zveřejnit." };
  }

  return {
    ok: true,
    file,
    payload: {
      fish_slug: fish.slug,
      steam_id: user.steamId,
      nickname: user.nickname,
      caught_at: caughtAt,
      ...(note ? { note } : {}),
      rights_confirmed: true,
    },
  };
}
