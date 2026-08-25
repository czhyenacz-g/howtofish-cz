// Statické, ručně psané texty pro CharacterCallout — žádné AI generování
// za běhu. `"/ryby/[slug]"` je speciální klíč pro dynamickou detail
// stránku ryby (viz resolve-callout.ts), ne skutečná URL.
export type CharacterMessage = {
  message: string;
  href?: string;
  linkLabel?: string;
};

export const PROFESSOR_MESSAGES: Record<string, CharacterMessage> = {
  "/ryby": {
    message: "V encyklopedii už máme první úlovky, ale pořád nám spousta ryb chybí. Pomůžeš mi ji doplnit?",
    href: "/ryby/navrhnout",
    linkLabel: "Přidat nový úlovek",
  },
  "/ryby/[slug]": {
    message: "Každý úlovek má svůj příběh. Máš vlastní screenshot téhle ryby? Pomoz mi doplnit její záznam.",
  },
  "/predmety": {
    message: "Výbavu ještě nemám zmapovanou úplně celou. Narazil jsi na předmět, který tu chybí?",
    href: "/predmety/navrhnout",
    linkLabel: "Přidat předmět",
  },
  "/bossove": {
    message: "Bossové skrývají spoustu tajemství. Pokud víš, jak některého vyvolat nebo porazit, pomoz mi to zapsat.",
    href: "/bossove/navrhnout",
    linkLabel: "Přidat bosse",
  },
  "/lokace": {
    message: "Ostrovy ještě nejsou celé prozkoumané. Znáš místo, které nám v mapování chybí?",
    href: "/lokace/navrhnout",
    linkLabel: "Přidat lokaci",
  },
  "/navody": {
    message: "Některé věci hra nevysvětlí. Jestli znáš dobrý trik, pomoz mi ho přidat do návodů.",
    href: "/navody/navrhnout",
    linkLabel: "Přidat návod",
  },
  "/achievementy": {
    message: "Achievementy umí být záludné. Pokud znáš postup k některému z nich, dej nám vědět.",
  },
  "/stream": {
    message: "Tady sleduju, kdo právě hraje How to Fish. Pokud ti tu nějaký stream chybí, dej mi vědět.",
  },
  "/hra": {
    message: "Výzkum je důležitý, ale občas je potřeba si taky zahrát.",
    href: "/ryby",
    linkLabel: "Prozkoumat ryby",
  },
};

// Jeden obecný text pro demo verzi (viz zadání) — až budou reálné
// affiliate produkty, rozšíří se na Record<string, CharacterMessage>
// stejně jako PROFESSOR_MESSAGES. Záměrně bez href/linkLabel: bez
// reálného odkazu má být jen hláška, ne fake/placeholder URL.
export const SELLER_MESSAGE: CharacterMessage = {
  message: "Hej! Mám něco zajímavého, co by se ti mohlo hodit při hraní.",
};
