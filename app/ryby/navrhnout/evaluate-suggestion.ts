import { fishEntries } from "../../../data/fish.ts";
import type { FishSuggestionData, FishSuggestionType } from "../../../lib/universal-content-api/types.ts";

// Čistá validace — Server Action (submit-suggestion-action.ts) dodá
// aktuálního uživatele ze session a seznam vlastních pending návrhů
// (kvůli kontrole duplicit) a zavolá tohle. Žádné síťové volání tady.
export type CurrentUserLike = { steamId: string; nickname: string; isBlocked: boolean } | null;

export const SUGGESTION_TYPES: readonly FishSuggestionType[] = ["fish", "creature", "boss", "other"];

export const SUGGESTION_TYPE_LABELS: Record<FishSuggestionType, string> = {
  fish: "Ryba",
  creature: "Tvor",
  boss: "Boss",
  other: "Jiné",
};

export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
export const NAME_MAX_LENGTH = 80;
export const LOCATION_MAX_LENGTH = 120;
export const NOTE_MAX_LENGTH = 300;

export const GENERIC_ERROR = "Návrh se momentálně nepodařilo odeslat. Zkus to prosím znovu.";
export const DUPLICATE_ERROR = "Tento úlovek už v encyklopedii nebo mezi tvými návrhy máme.";

export function normalizeFishName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export type SuggestionEvaluation =
  | { ok: true; payload: FishSuggestionData; file: File }
  | { ok: false; message: string };

function isDuplicateName(name: string, existingPendingNames: string[]): boolean {
  const normalized = normalizeFishName(name);
  const staticNames = fishEntries.map((f) => normalizeFishName(f.name));
  const pendingNames = existingPendingNames.map(normalizeFishName);
  return staticNames.includes(normalized) || pendingNames.includes(normalized);
}

export function evaluateSuggestion(
  user: CurrentUserLike,
  formData: FormData,
  existingPendingNames: string[]
): SuggestionEvaluation {
  if (!user) {
    return { ok: false, message: "Pro návrh nové ryby se přihlas přes Steam." };
  }
  if (user.isBlocked) {
    return { ok: false, message: "Tento účet momentálně nemůže navrhovat obsah." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > NAME_MAX_LENGTH) {
    return { ok: false, message: "Zadej název ve hře." };
  }

  const type = String(formData.get("type") ?? "");
  if (!SUGGESTION_TYPES.includes(type as FishSuggestionType)) {
    return { ok: false, message: "Vyber platný typ." };
  }

  const location = String(formData.get("location") ?? "").trim();
  if (!location || location.length > LOCATION_MAX_LENGTH) {
    return { ok: false, message: "Zadej, kde jsi ho našel." };
  }

  const file = formData.get("screenshot");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Vyber prosím screenshot." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, message: "Screenshot je moc velký (limit 8 MB)." };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, message: "Podporované formáty: JPG, PNG nebo WebP." };
  }

  const noteRaw = formData.get("note");
  const note = typeof noteRaw === "string" ? noteRaw.trim() : "";
  if (note.length > NOTE_MAX_LENGTH) {
    return { ok: false, message: `Poznámka může mít nejvýš ${NOTE_MAX_LENGTH} znaků.` };
  }

  if (formData.get("rightsConfirmed") !== "on") {
    return { ok: false, message: "Potvrď prosím, že smíš screenshot zveřejnit." };
  }

  if (isDuplicateName(name, existingPendingNames)) {
    return { ok: false, message: DUPLICATE_ERROR };
  }

  return {
    ok: true,
    file,
    payload: {
      name,
      type: type as FishSuggestionType,
      location,
      steam_id: user.steamId,
      nickname: user.nickname,
      ...(note ? { note } : {}),
      rights_confirmed: true,
    },
  };
}

