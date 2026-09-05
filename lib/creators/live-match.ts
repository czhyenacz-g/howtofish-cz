// Napojení evidovaných tvůrců (data/creators.ts) na živé streamy
// (lib/streams/get-live-streams.ts). Providery (Twitch/YouTube/Kick)
// NEMAJÍ žádný pevný seznam sledovaných kanálů — objevují streamy podle
// herní kategorie/klíčových slov (viz lib/streams/*.ts), takže jediný
// dostupný způsob, jak zjistit "je tenhle NÁŠ tvůrce zrovna live", je
// porovnat zobrazované jméno kanálu se jménem v datech. Je to nutně
// heuristika (skutečné jméno kanálu na dané platformě se nemusí přesně
// shodovat s tím, jak tvůrce jmenujeme my) — proto porovnání ignoruje
// velikost písmen, diakritiku a okrajové mezery, ale nic víc si
// nevymýšlí.
import type { LiveStream } from "../streams/types.ts";

function normalizeName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Najde živý stream odpovídající jménu tvůrce, nebo `undefined`, pokud právě nikdo takový nestreamuje. */
export function findLiveStreamForCreator(creatorName: string, streams: readonly LiveStream[]): LiveStream | undefined {
  const target = normalizeName(creatorName);
  return streams.find((stream) => normalizeName(stream.channelName) === target);
}
