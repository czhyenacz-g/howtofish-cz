// Bezpečná validace cílové cesty pro přesměrování po přihlášení/odhlášení
// — musí to být relativní cesta v rámci webu, nikdy cizí URL (ochrana
// proti open-redirectu).
export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//")) return "/";
  if (value.includes("\\")) return "/";
  return value;
}
