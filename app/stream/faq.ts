// Sdílený zdroj pro viditelný FAQ text i FAQPage JSON-LD (viz page.tsx)
// — jeden zápis, ať si obě reprezentace nikdy neodrostou. Google
// vyžaduje, aby structured data text odpovídal viditelnému obsahu
// stránky, takže žádná duplicitní kopie textu na dvou místech.
export type FaqEntry = { question: string; answer: string };

export const STREAM_FAQ: FaqEntry[] = [
  {
    question: "Jak často se seznam streamů aktualizuje?",
    answer:
      "Přibližně jednou za minutu — přesný čas poslední aktualizace vidíš přímo nad seznamem streamů.",
  },
  {
    question: "Proč tu zrovna nikdo nestreamuje?",
    answer:
      "How to Fish je menší indie hra, takže živé přenosy neběží nonstop. Zkus se vrátit později — mezitím si můžeš projít encyklopedii úlovků nebo zahrát minihru Krabí invaze.",
  },
  {
    question: "Z jakých platforem streamy sbíráte?",
    answer:
      "Twitch, YouTube a Kick — hledáme podle názvu hry na dané platformě, žádný ruční výběr streamerů.",
  },
];
