// Čisté (testovatelné) sessionStorage helpery pro minimalizovaný stav
// profesora — klíčováno podle route (pathname), takže zavření na jedné
// stránce neovlivní jiné. `globalThis.sessionStorage` (ne `window.`),
// aby šlo v testech nahradit jednoduchým in-memory fake bez DOM/jsdom.
const STORAGE_PREFIX = "howtofish-professor-callout:";

export function professorStorageKey(pathname: string): string {
  return `${STORAGE_PREFIX}${pathname}`;
}

// Jen pohodlí, nikdy nesmí shodit komponentu (private mode apod. může
// přístup k sessionStorage zahodit) — bezpečný fallback na `false`.
export function isProfessorMinimizedForRoute(pathname: string): boolean {
  try {
    return globalThis.sessionStorage?.getItem(professorStorageKey(pathname)) === "minimized";
  } catch {
    return false;
  }
}

export function rememberProfessorMinimized(pathname: string): void {
  try {
    globalThis.sessionStorage?.setItem(professorStorageKey(pathname), "minimized");
  } catch {
    // no-op — bez persistence se profesor příště jen znovu nabídne po delay
  }
}
