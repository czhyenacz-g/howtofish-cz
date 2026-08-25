import type { LeaderboardEntry } from "../../lib/universal-content-api/types";

export default function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <section className="mt-10">
      <h2 className="text-center font-serif text-xl text-amber-300">Nejlepší lovci krabů</h2>

      {entries.length === 0 ? (
        <p className="mt-3 text-center text-sm text-cyan-100/50">
          Zatím tu nikdo neskóroval. Buď první, kdo se dostane do žebříčku!
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-cyan-100/50">
              <tr>
                <th className="px-3 py-2 font-normal">#</th>
                <th className="px-3 py-2 font-normal">Rybář</th>
                <th className="px-3 py-2 text-right font-normal">Body</th>
                <th className="px-3 py-2 text-right font-normal">Kolo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {entries.map((entry, i) => (
                <tr key={entry.steamId} className={i === 0 ? "bg-amber-400/10" : undefined}>
                  <td className="px-3 py-2 font-serif text-amber-300">{i + 1}</td>
                  <td className="max-w-[10rem] truncate px-3 py-2" title={entry.nickname}>
                    {entry.nickname}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-white">
                    {entry.score.toLocaleString("cs-CZ")}
                  </td>
                  <td className="px-3 py-2 text-right text-cyan-100/70">{entry.round}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
