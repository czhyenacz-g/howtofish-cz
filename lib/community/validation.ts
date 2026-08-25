// Sdílené, čisté (žádné síťové volání) validační kousky pro komunitní
// formuláře napříč /predmety, /bossove, /lokace, /navody — stejný vzor
// jako u dřívějších evaluate-*.ts (fish suggestions, catches): žádný
// jeden obří "evaluate cokoliv" — každá doména si skládá vlastní
// evaluate funkci z těchhle stavebních kamenů + svých specifických polí.

export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
export const NOTE_MAX_LENGTH = 300;

export const GENERIC_ERROR = "Návrh se momentálně nepodařilo odeslat. Zkus to prosím znovu.";
export const DUPLICATE_ERROR = "Tento záznam už máme nebo čeká na schválení.";
export const NOT_LOGGED_IN_ERROR = "Pro přidání návrhu se přihlas přes Steam.";
export const BLOCKED_ERROR = "Tento účet momentálně nemůže navrhovat obsah.";
export const RIGHTS_ERROR = "Potvrď prosím, že smíš screenshot zveřejnit.";

export type CurrentUserLike = { steamId: string; nickname: string; isBlocked: boolean } | null;

export function normalizeTitle(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isDuplicateTitle(title: string, ...knownTitleLists: string[][]): boolean {
  const normalized = normalizeTitle(title);
  return knownTitleLists.some((list) => list.map(normalizeTitle).includes(normalized));
}

export type FieldResult<T> = { ok: true; value: T } | { ok: false; message: string };

export function requireText(formData: FormData, field: string, label: string, maxLength: number): FieldResult<string> {
  const value = String(formData.get(field) ?? "").trim();
  if (!value) return { ok: false, message: `Vyplň prosím pole „${label}“.` };
  if (value.length > maxLength) return { ok: false, message: `Pole „${label}“ může mít nejvýš ${maxLength} znaků.` };
  return { ok: true, value };
}

export function optionalText(formData: FormData, field: string, maxLength: number): FieldResult<string | undefined> {
  const raw = formData.get(field);
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return { ok: true, value: undefined };
  if (value.length > maxLength) return { ok: false, message: `Pole je moc dlouhé (limit ${maxLength} znaků).` };
  return { ok: true, value };
}

export function validateScreenshot(formData: FormData, { required }: { required: boolean }): FieldResult<File | undefined> {
  const file = formData.get("screenshot");

  if (!(file instanceof File) || file.size === 0) {
    if (required) return { ok: false, message: "Vyber prosím screenshot." };
    return { ok: true, value: undefined };
  }

  if (file.size > MAX_FILE_BYTES) return { ok: false, message: "Screenshot je moc velký (limit 8 MB)." };
  if (!ALLOWED_MIME.has(file.type)) return { ok: false, message: "Podporované formáty: JPG, PNG nebo WebP." };
  return { ok: true, value: file };
}

export function validateRightsConfirmed(formData: FormData): boolean {
  return formData.get("rightsConfirmed") === "on";
}

// ---------------------------------------------------------------------
// "Navrhnout opravu" — stejná struktura pro všechny 4 domény (item,
// boss, location, guide), proto jde napsat jednou. Screenshot je vždy
// nepovinný (oprava nemusí mít nový obrázek), rights checkbox je vždy
// povinný, ať potvrzuje aspoň to, že navrhovaný text smí zveřejnit.
export const TARGET_MAX_LENGTH = 120;
export const PROPOSED_CHANGES_MAX_LENGTH = 500;

export type CorrectionPayload = {
  kind: "correction";
  target: string;
  proposed_changes: string;
  steam_id: string;
  nickname: string;
  note?: string;
  rights_confirmed: true;
};

export type CorrectionEvaluation = { ok: true; payload: CorrectionPayload; file?: File } | { ok: false; message: string };

export function evaluateCorrection(user: CurrentUserLike, formData: FormData): CorrectionEvaluation {
  if (!user) return { ok: false, message: NOT_LOGGED_IN_ERROR };
  if (user.isBlocked) return { ok: false, message: BLOCKED_ERROR };

  const target = requireText(formData, "target", "Opravovaný záznam", TARGET_MAX_LENGTH);
  if (!target.ok) return target;

  const changes = requireText(formData, "proposedChanges", "Co se má opravit", PROPOSED_CHANGES_MAX_LENGTH);
  if (!changes.ok) return changes;

  const note = optionalText(formData, "note", NOTE_MAX_LENGTH);
  if (!note.ok) return note;

  const screenshot = validateScreenshot(formData, { required: false });
  if (!screenshot.ok) return screenshot;

  if (!validateRightsConfirmed(formData)) return { ok: false, message: RIGHTS_ERROR };

  return {
    ok: true,
    file: screenshot.value,
    payload: {
      kind: "correction",
      target: target.value,
      proposed_changes: changes.value,
      steam_id: user.steamId,
      nickname: user.nickname,
      ...(note.value ? { note: note.value } : {}),
      rights_confirmed: true,
    },
  };
}
