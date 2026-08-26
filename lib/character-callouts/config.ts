// Statické, ručně psané texty pro CharacterCallout — žádné AI generování
// za běhu. `"/ryby/[slug]"` je speciální klíč pro dynamickou detail
// stránku ryby (viz resolve-callout.ts), ne skutečná URL.
export type CharacterMessage = {
  message: string;
  // href/linkLabel jsou teď výhradně pro sellera (reklamní CTA) — profesor
  // je nikdy nevyplňuje, viz PROFESSOR_MESSAGES níž a CharacterCallout.tsx,
  // kde je CTA rendering strukturálně omezený na character === "seller".
  // Duplicitní by bylo vůči navigaci a obsahu stránky (viz zadání).
  href?: string;
  linkLabel?: string;
};

export const PROFESSOR_MESSAGES: Record<string, CharacterMessage> = {
  "/ryby": {
    message: "V encyklopedii už máme první úlovky, ale pořád nám spousta ryb chybí. Pomůžeš mi ji doplnit?",
  },
  "/ryby/[slug]": {
    message: "Každý úlovek má svůj příběh. Máš vlastní screenshot téhle ryby? Pomoz mi doplnit její záznam.",
  },
  "/predmety": {
    message: "Výbavu ještě nemám zmapovanou úplně celou. Narazil jsi na předmět, který tu chybí?",
  },
  "/bossove": {
    message: "Bossové skrývají spoustu tajemství. Pokud víš, jak některého vyvolat nebo porazit, pomoz mi to zapsat.",
  },
  "/lokace": {
    message: "Ostrovy ještě nejsou celé prozkoumané. Znáš místo, které nám v mapování chybí?",
  },
  "/navody": {
    message: "Některé věci hra nevysvětlí. Jestli znáš dobrý trik, pomoz mi ho přidat do návodů.",
  },
  "/achievementy": {
    message: "Achievementy umí být záludné. Pokud znáš postup k některému z nich, dej nám vědět.",
  },
  "/stream": {
    message: "Tady sleduju, kdo právě hraje How to Fish. Pokud ti tu nějaký stream chybí, dej mi vědět.",
  },
  "/hra": {
    message: "Výzkum je důležitý, ale občas je potřeba si taky zahrát.",
  },
  // Úvodní představení na informační stránce O hře — na rozdíl od
  // ostatních routes se tu profesor zobrazuje vždy a hned (viz
  // CharacterCallout.tsx), ne jako náhodný event. Hlavní myšlenky ze
  // zadání zachované beze změny: jmenuje se Profesor, není profesor Oak
  // (lehký vtip), taky tu uvízl, katalogizuje ryby/předměty/bossy/lokace/
  // návody, a chce k tomu pomoc hráče.
  // \n\n odděluje dva odstavce (max 2-3 věty za sebou, viz zadání) —
  // CharacterCallout.tsx renderuje plain-text zprávy s whitespace-pre-line.
  "/o-hre": {
    message:
      "Říkej mi Profesore. Ne, nejsem profesor Oak — to je z úplně jiné hry (a jiného rybníka). Taky jsem tu uvízl, na těchhle ostrovech, a snažím se dát dohromady katalog všeho, co tu najdeme — ryby, předměty, bossy, lokace i návody.\n\nS tím ale potřebuju tvoji pomoc. Čím víc toho spolu zapíšeme, tím větší šanci budou mít další hráči, co sem teprve dorazí.",
  },
};

// Jeden obecný text pro demo verzi (viz zadání) — až budou reálné
// affiliate produkty, rozšíří se na Record<string, CharacterMessage>
// stejně jako PROFESSOR_MESSAGES. Záměrně bez href/linkLabel: bez
// reálného odkazu má být jen hláška, ne fake/placeholder URL.
export const SELLER_MESSAGE: CharacterMessage = {
  message: "Hej! Mám něco zajímavého, co by se ti mohlo hodit při hraní.",
};
