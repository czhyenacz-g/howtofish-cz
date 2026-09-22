import type { GameVideoRecord } from "../../lib/games/game-videos.ts";
import GameVideoCard from "./GameVideoCard";

/**
 * „Rybářská videa z této hry“ na detailu hry.
 *
 * Data dodává výhradně `getApprovedGameVideos()` (lib/games/game-videos.ts)
 * — tedy jen videa s `is_approved = true AND is_active = true`. Žádný
 * crawler, žádné YouTube volání při renderu: discovery běží ručně přes
 * CLI a výsledky jsou uložené v DB. Když schválená videa nejsou, sekce se
 * vůbec nevykreslí (žádný prázdný blok).
 *
 * Karta je sdílená s homepage (GameVideoCard) — jen thumbnail + odkaz na
 * YouTube, žádný embed.
 */
export default function GameVideosSection({ videos }: { videos: GameVideoRecord[] }) {
  if (videos.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="game-videos">
      <h2 id="game-videos" className="font-serif text-xl sm:text-2xl">
        Rybářská videa z této hry
      </h2>
      <p className="mt-2 text-sm text-cyan-100/70">
        Videa od tvůrců na YouTube — otevírají se na YouTube, nehrajeme je tady.
      </p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <li key={video.externalId}>
            <GameVideoCard video={video} />
          </li>
        ))}
      </ul>
    </section>
  );
}
