"use client";

import { useEffect, useState } from "react";
import { CHARACTER_CALLOUT_OPEN_SELECTOR, computeCalloutOpen } from "../../lib/character-callouts/callout-open-state";

/**
 * True, pokud je právě teď na obrazovce vysunutý profesor/prodejce
 * (CharacterCallout ve fázi entering/open/closing). Event-driven přes
 * MutationObserver (žádný polling) — CharacterCallout mění DOM strukturu
 * (mount/unmount) i atribut podle fáze, takže childList+attributes
 * pokrývá obojí. Používá MultiplayerIslandTab, aby se dočasně zasunul a
 * nepřekrýval postavu (viz zadání) — bez nového globálního state
 * managementu, stejný princip jako useBannerVisible.ts.
 */
export function useCharacterCalloutOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function check() {
      setOpen(computeCalloutOpen(document.querySelectorAll(CHARACTER_CALLOUT_OPEN_SELECTOR).length));
    }

    check();

    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-character-callout-open"],
    });

    return () => observer.disconnect();
  }, []);

  return open;
}
