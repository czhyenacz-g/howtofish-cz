"use client";

import { useEffect, useRef, useState } from "react";
import { SpeakerIcon, SpeakerMuteIcon } from "./icons";

const STORAGE_KEY = "howtofish-audio-enabled";
const VOLUME = 0.18;

// Bez uložené preference (první návštěva) zkoušíme přehrát rovnou —
// "autoplay", ale legitimní: prohlížeč ho bez předchozí interakce s
// doménou stejně obvykle zablokuje (viz mount efekt níže), takže se
// nikdy neobchází autoplay policy, jen se nečeká zbytečně na klik, když
// to prohlížeč už dovolí (typicky po první návštěvě/interakci).
function readStoredPreference(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return true;
    return stored === "true";
  } catch {
    return true;
  }
}

function writeStoredPreference(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // localStorage nedostupné (private mode apod.) — preference se prostě neuloží.
  }
}

// Globální ovládání ambientního zvuku moře — žije v root layoutu
// (app/layout.tsx), takže <audio> element nikdy neremountuje při
// klientské navigaci mezi stránkami a přehrávání/stav toggle zůstává
// konzistentní napříč celým webem.
export default function AmbientAudioToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !readStoredPreference()) return;
    audio.volume = VOLUME;
    audio
      .play()
      .then(() => setEnabled(true))
      .catch(() => {
        // Autoplay policy prohlížeče přehrání zablokovala — necháme UI
        // vypnuté, uživatel si zvuk zapne jedním kliknutím na tlačítko.
      });
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled) {
      audio.pause();
      setEnabled(false);
      writeStoredPreference(false);
      return;
    }

    audio.volume = VOLUME;
    audio
      .play()
      .then(() => {
        setEnabled(true);
        writeStoredPreference(true);
      })
      .catch(() => {
        // Přehrání se nepovedlo (chybějící/neplatný soubor apod.) — necháme vypnuto.
      });
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/ocean-ambient.mp3" loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        aria-label={enabled ? "Vypnout zvuk moře" : "Zapnout zvuk moře"}
        title={enabled ? "Vypnout zvuk moře" : "Zapnout zvuk moře"}
        className="fixed bottom-4 right-4 z-40 flex h-11 min-w-11 items-center gap-1.5 rounded-full border border-[#e8cfa0]/30 bg-[#0a2438]/90 px-2.5 text-[#f4ead9] shadow-lg shadow-black/30 backdrop-blur-sm transition duration-150 hover:border-amber-300/60 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 motion-reduce:transition-none"
      >
        {enabled ? (
          <SpeakerIcon className="h-5 w-5 shrink-0 text-cyan-300" />
        ) : (
          <SpeakerMuteIcon className="h-5 w-5 shrink-0" />
        )}
      </button>
    </>
  );
}
