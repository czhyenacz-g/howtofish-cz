"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "htf_ambient_sound_enabled";
const VOLUME = 0.25;

function readStoredPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeStoredPreference(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // localStorage nedostupné (private mode apod.) — preference se prostě neuloží.
  }
}

// Malé samostatné ovládání volitelného ambientního zvuku moře na
// homepage. Bez zvuku při načtení stránky — přehrávání vždy spouští
// jen uživatel kliknutím (nebo se zkusí legitimně obnovit po návratu,
// viz useEffect níže; prohlížeč to bez interakce stejně obvykle
// zablokuje, což je v pořádku).
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
        // Autoplay policy prohlížeče přehrání zablokovala — necháme vypnuto,
        // uživatel si zvuk znovu zapne tlačítkem.
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
        className="fixed bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-lg text-cyan-100 backdrop-blur-sm transition hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      >
        <span aria-hidden="true">{enabled ? "🔇" : "🔊"}</span>
      </button>
    </>
  );
}
