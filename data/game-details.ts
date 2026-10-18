import type { GameEntry } from "./games.ts";

// Editorský obsah k detailům her (`/games/[slug]`) — schválně ODDĚLENÝ od
// data/games.ts, aby katalog zůstal přehledný (viz zadání bod 7: metadata
// hry patří do games.ts, delší texty sem).
//
// Všechno tady je psané ručně a jen k věcem, které jsou obecně známé nebo
// doložené v datech projektu — žádné AI lorem ipsum, žádné vymyšlené
// mechaniky. Když hra nemá vlastní `/games/[slug]` stránku, obsah tu
// nemusí být vůbec.

export type GameDetailContent = {
  slug: string;
  /** Proč je rybaření v této hře zajímavé — 1–2 věty do hero. */
  tagline: string;
  /** Odstavce sekce „Rybaření v této hře“. */
  fishing: string[];
  /** Uživatelsky přívětivé „co hledat“ (fallback: game.searchKeywords). */
  whatToLookFor?: string[];
  /** SEO title; fallback je „{hra} – rybaření a tipy | HowToFish.cz“. */
  seoTitle?: string;
  /** SEO description; fallback je obecná věta z dat hry. */
  metaDescription?: string;
  /** Vlastní H1 (fallback: název hry). */
  h1?: string;
  /** Datum poslední skutečné změny obsahu (YYYY-MM-DD) — sitemap lastModified. */
  lastReviewed?: string;
  /**
   * Volitelný plný průvodce (zatím jen Minecraft) — strukturované sekce,
   * které stránka vykreslí pod „Rybaření v této hře“. Každé věcné tvrzení
   * má oporu v `sources`.
   */
  guide?: GameGuideSection[];
  /** Časté otázky (vykreslí se i jako FAQPage JSON-LD — musí odpovídat textu). */
  faq?: { question: string; answer: string }[];
  /** Zdroje, ze kterých průvodce vychází. */
  sources?: { label: string; url: string }[];
};

export type GameGuideTable = { caption: string; head: string[]; rows: string[][] };

export type GameGuideSection = {
  /** Kotva pro obsah stránky. */
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  tables?: GameGuideTable[];
  /** Zvýrazněná poznámka (např. rozdíl Java/Bedrock). */
  note?: string;
};

export const gameDetails: GameDetailContent[] = [
  {
    slug: "minecraft",
    h1: "Jak rybařit v Minecraftu",
    seoTitle: "Rybaření v Minecraftu – prut, ryby, poklady a očarování | HowToFish.cz",
    metaDescription:
      "Jak rybařit v Minecraftu: výroba prutu, poznání záběru, ryby, poklady a junk, očarování Luck of the Sea, Lure, Unbreaking a Mending, déšť, otevřená voda a AFK farmy v Java i Bedrock Edition.",
    lastReviewed: "2026-10-18",
    tagline:
      "Rybaření je v Minecraftu nenápadná mechanika, ze které se stala vlastní disciplína — od prvního prutu až po očarované knihy a sedla vytažená z vody.",
    fishing: [
      "Prut vyrobíš ze tří klacků a dvou provázků a chytat se dá v jakékoli vodě. Kromě ryb můžeš vytáhnout i nepotřebné předměty (junk) a poklady — očarované knihy, luky, jmenovky nebo sedla.",
      "Níže najdeš celý postup: jak poznat záběr, co se dá chytit, která očarování se vyplatí, jak na rybaření působí déšť a otevřená voda a proč staré návody na AFK farmy už nefungují. Kde se Java a Bedrock Edition liší, je to výslovně uvedené.",
    ],
    guide: [
      {
        id: "jak-zacit",
        heading: "Jak začít rybařit",
        bullets: [
          "Rybářský prut vyrobíš na pracovním stole ze 3 klacků a 2 provázků: klacky šikmo přes mřížku, provázky svisle pod horním koncem prutu.",
          "Prut můžeš i najít nebo získat jinak — vytáhnout ho z vody, najít v truhlách (např. ve zříceninách pod mořem) nebo koupit od vesničana rybáře.",
          "Nahoď prut do vody (použití prutu, na PC pravé tlačítko myši). Velikost ani hloubka vody nerozhoduje, chytat se dá i v malé louži.",
          "Po nahození běží náhodné čekání 5–30 sekund. Během něj se kolem splávku občas objeví drobné šplouchnutí.",
          "Záběr poznáš tak, že se ke splávku začne vlnit stopa částic (bublinek) a za 1–4 sekundy splávek zajede pod hladinu.",
          "V tu chvíli prut znovu použij a úlovek přitáhneš. Na reakci máš v Java Edition 1–2 sekundy, v Bedrock Edition jen asi půl sekundy. Když to nestihneš, čekání začne znovu.",
          "Za každý úlovek dostaneš i 1–6 bodů zkušeností.",
          "Prut se opotřebovává: v Java Edition vydrží 64 použití, v Bedrock Edition 385. Úlovek ubere 1 bod výdrže, vytažení splávku zaseknutého v bloku 2, přitažení předmětu 3 a moba 5; prázdné vytažení nic.",
        ],
      },
      {
        id: "druhy-ulovku",
        heading: "Druhy úlovků: ryby, poklady a junk",
        paragraphs: [
          "Každý úlovek patří do jedné ze tří kategorií. Bez očarování je rozdělení v Java i Bedrock Edition stejné: 85 % ryby, 10 % junk a 5 % poklady. V každé kategorii pak rozhoduje další los.",
        ],
        tables: [
          {
            caption: "Ryby (mimo džungli, obě edice)",
            head: ["Úlovek", "Šance v kategorii"],
            rows: [
              ["syrová treska (Raw Cod)", "60 %"],
              ["syrový losos (Raw Salmon)", "25 %"],
              ["čtverzubec (Pufferfish)", "13 %"],
              ["tropická ryba (Tropical Fish)", "2 %"],
            ],
          },
          {
            caption: "Poklady (treasure)",
            head: ["Úlovek", "Java Edition", "Bedrock Edition"],
            rows: [
              ["očarovaná kniha", "1/6 (16,67 %)", "6/31 (19,35 %)"],
              ["luk (očarovaný, poškozený)", "1/6 (16,67 %)", "5/31 (16,13 %)"],
              ["rybářský prut (očarovaný, poškozený)", "1/6 (16,67 %)", "5/31 (16,13 %)"],
              ["jmenovka (Name Tag)", "1/6 (16,67 %)", "5/31 (16,13 %)"],
              ["ulita nautila (Nautilus Shell)", "1/6 (16,67 %)", "5/31 (16,13 %)"],
              ["sedlo (Saddle)", "1/6 (16,67 %)", "5/31 (16,13 %)"],
            ],
          },
        ],
        bullets: [
          "Junk (nepotřebné předměty): leknín, kost, miska, kůže, kožené boty, shnilé maso, háček na nástražný drát, lahev vody, klacek, provázek, rybářský prut a inkoustový váček. Nejčastější je leknín (v Java Edition 17 % v rámci kategorie).",
          "Luk a prut z pokladů jsou vždy očarované (jako na úrovni 22–30) a hodně poškozené. Prut a kožené boty z junku očarované nejsou.",
          "V džungli přibude do junku bambus (v Bedrock Edition i kakaové boby) a v Bedrock Edition se tam trochu změní poměr ryb.",
        ],
      },
      {
        id: "ocarovani",
        heading: "Očarování prutu",
        bullets: [
          "Luck of the Sea (I–III): zvyšuje šanci na poklad a snižuje šanci na junk. Pořadí předmětů uvnitř kategorie nemění.",
          "Lure (I–III): každá úroveň zkrátí čekání na záběr o 5 sekund (z obou konců rozsahu 5–30 s). Na to, co chytíš, vliv nemá.",
          "Unbreaking (I–III): dává šanci, že se při použití prut neopotřebuje, takže vydrží déle.",
          "Mending (I): opravuje prut zkušenostmi, které sbíráš s prutem v ruce — 2 body výdrže za každý bod zkušeností. Na očarovacím stole ho nedostaneš; získáš ho jako očarovanou knihu (obchod s knihovníkem, truhly, rybaření) a na prut ho dáš na kovadlině.",
        ],
        tables: [
          {
            caption: "Luck of the Sea: šance na kategorii úlovku",
            head: ["Úroveň", "Ryby", "Poklady", "Junk"],
            rows: [
              ["bez očarování", "85 %", "5 %", "10 %"],
              ["I", "84,85 %", "7,07 %", "8,08 %"],
              ["II", "84,69 %", "9,18 %", "6,12 %"],
              ["III", "84,54 %", "11,34 %", "4,12 %"],
            ],
          },
        ],
        note:
          "Doporučená kombinace pro běžné rybaření: Luck of the Sea III + Lure III + Unbreaking III + Mending. Lure zrychlí záběry, Luck of the Sea zvýší podíl pokladů a Mending s Unbreaking udrží prut v provozu díky zkušenostem z úlovků.",
      },
      {
        id: "podminky",
        heading: "Podmínky rybaření: voda, déšť a poklady",
        bullets: [
          "Chytat se dá v jakékoli vodě — rozhoduje jen to, že splávek leží ve vodě.",
          "Když na splávek prší, čekání se zkrátí přibližně o 20 %. Musí pršet přímo nad ním a nad splávkem nesmí být blok, který déšť zastaví.",
          "Když splávek nemá nad sebou volnou oblohu (střecha, led, listí), čekání se zhruba zdvojnásobí. Pod střechou a zároveň v dešti je čekání asi o třetinu delší.",
          "Java Edition: poklady chytíš jen v otevřené vodě. Kolem splávku musí být oblast 5 × 5 bloků do šířky a 4 bloky do výšky, ve které každá vrstva obsahuje buď jen vzduch (případně lekníny), nebo jen vodní zdroje — bez tekoucí vody a bez bloků. Jinak padají jen ryby a junk.",
          "Když se od splávku vzdálíš víc než na 32 bloků nebo přestaneš držet prut, vlasec se přetrhne (bez ztráty výdrže).",
          "Tresku a lososa můžeš upéct a sníst; čtverzubec je jedovatý. Ryby se hodí i na obchod s vesničanem rybářem.",
        ],
        note:
          "Rozdíl Java × Bedrock: pravidlo otevřené vody pro poklady je popsané pro Java Edition (zavedeno ve verzi 1.16, snapshot 20w12a). Pro Bedrock Edition ho Minecraft Wiki neuvádí. Bedrock má také kratší okno na zaseknutí (asi 0,5 s místo 1–2 s), vyšší výdrž prutu a o něco vyšší šanci na očarovanou knihu mezi poklady.",
      },
      {
        id: "afk-rybareni",
        heading: "AFK rybaření a rybářské farmy",
        paragraphs: [
          "AFK farma je konstrukce, u které hráč stojí s prutem a hra „rybaří sama“ — typicky se drží použití prutu namířeného na železné dveře s nástražným drátem a úlovky odvádí násypka do truhly.",
          "Ve verzi 1.16 (snapshot 20w12a) Java Edition zavedla pravidlo otevřené vody pro poklady, a tím rozbila všechny staré AFK návrhy — pokud jde o poklady. Jednoduché farmy dál chytají ryby, junk a sbírají zkušenosti, ale poklady z nich nepadají. Novější návrhy proto používají otevřenou vodu, časovače a redstone nebo sculk senzory, které zaznamenají záběr.",
          "V Bedrock Edition podle Minecraft Wiki nefunguje žádný z popsaných návrhů kvůli odlišnému chování dveří a nástražného drátu. Většina bedrockových AFK farem stojí na chybách, které se v dalších aktualizacích opravují.",
        ],
        note:
          "Starší video návody (zejména z doby před verzí 1.16) proto ber s rezervou a farmu si nejdřív vyzkoušej v testovacím světě. Na serverech navíc platí pravidla serveru — některé AFK farmy zakazují.",
      },
    ],
    faq: [
      {
        question: "Jak se vyrábí prut v Minecraftu?",
        answer:
          "Na pracovním stole ze 3 klacků a 2 provázků: klacky šikmo přes mřížku, provázky svisle pod horním koncem prutu.",
      },
      {
        question: "Jak získat poklady?",
        answer:
          "Rybař s prutem s Luck of the Sea (na úrovni III je šance na poklad 11,34 % místo 5 %) a v Java Edition v otevřené vodě: kolem splávku oblast 5 × 5 bloků a 4 bloky do výšky bez pevných bloků a tekoucí vody.",
      },
      {
        question: "Jaké očarování je nejlepší?",
        answer:
          "Luck of the Sea III + Lure III + Unbreaking III + Mending. Lure zrychlí záběry, Luck of the Sea přidá poklady a Mending s Unbreaking drží prut naživu.",
      },
      {
        question: "Funguje rybaření v malém jezírku?",
        answer:
          "Ano, ryby a junk chytíš i v malé vodě. V Java Edition ale z malého jezírka nevytáhneš poklady, protože nesplní podmínku otevřené vody.",
      },
      {
        question: "Pomáhá déšť?",
        answer:
          "Ano. Když na splávek prší, čekání na záběr se zkrátí přibližně o 20 %. Pod střechou naopak čekání zhruba zdvojnásobí.",
      },
      {
        question: "Fungují AFK farmy?",
        answer:
          "V Java Edition jednoduché AFK farmy dál chytají ryby, junk a zkušenosti, poklady ale jen v otevřené vodě, takže staré návody (před verzí 1.16) na poklady nefungují. V Bedrock Edition podle Minecraft Wiki popsané návrhy nefungují.",
      },
    ],
    sources: [
      { label: "Minecraft Wiki: Fishing", url: "https://minecraft.wiki/w/Fishing" },
      { label: "Minecraft Wiki: Fishing Rod", url: "https://minecraft.wiki/w/Fishing_Rod" },
      { label: "Minecraft Wiki: Tutorial – Fish farming", url: "https://minecraft.wiki/w/Tutorial:Fish_farming" },
      { label: "Minecraft Wiki: Lure", url: "https://minecraft.wiki/w/Lure" },
      { label: "Minecraft Wiki: Mending", url: "https://minecraft.wiki/w/Mending" },
    ],
    whatToLookFor: ["Fishing rod", "Luck of the Sea", "Lure", "Treasure fishing", "AFK fishing"],
  },
  {
    slug: "stardew-valley",
    tagline:
      "Ve Stardew Valley je rybaření plnohodnotná dovednost s vlastní mini-hrou, úrovněmi a legendárními rybami.",
    fishing: [
      "Chytání je mini-hra: držíš rybu v zeleném poli a zároveň jí nesmíš dát utéct. Lepší prut a návnada znamenají, že toho vytáhneš víc.",
      "Rybaření má vlastní úroveň i profese a postupně odemyká lepší vybavení a recepty. Je to jedna z mála činností, kterou můžeš dělat skoro kdykoliv a kdekoliv.",
      "Největší výzvou jsou legendární ryby — každá se loví na konkrétním místě za konkrétních podmínek (roční období, počasí, čas). Na farmě pak můžeš stavět fish pondy, ve kterých ryby produkují suroviny každý den.",
    ],
    whatToLookFor: ["Legendary fish", "Fishing guide", "Fishing level", "Fish pond", "Best fishing spot", "Fishing challenge"],
    metaDescription:
      "Rybaření ve Stardew Valley: mini-hra, úrovně a profese, legendární ryby, fish pondy a místa, kde se vyplatí lovit.",
  },
  {
    slug: "pokemon-brilliant-diamond-shining-pearl",
    tagline: "Rybaření je v Pokémonech od první generace — tři pruty, trpělivost a hromada Magikarpů.",
    fishing: [
      "Na vodu hodíš prut a spustíš tím souboj s vodním Pokémonem. Kvalita prutu (Old Rod, Good Rod, Super Rod) určuje, jak vzácné druhy na daném místě vůbec potkáš.",
      "Je to jedna z nejstarších „encounter“ mechanik série — a zároveň způsob, jak sehnat vodní Pokémony, kteří se v trávě neobjeví.",
      "V Brilliant Diamond / Shining Pearl je tahle klasika po ruce včetně Super Rodu. Řada hráčů u rybaření skončila déle, než původně plánovala.",
    ],
    whatToLookFor: ["Old Rod", "Good Rod", "Super Rod", "Magikarp", "Fishing Pokémon", "Fishing challenge"],
    metaDescription:
      "Rybaření v Pokémonech: Old Rod, Good Rod a Super Rod, Magikarp a vodní Pokémoni — a jak tahle klasika funguje v Brilliant Diamond / Shining Pearl.",
  },
  {
    slug: "sea-of-thieves",
    tagline: "V Sea of Thieves je rybaření samostatná frakce — Hunter's Call — a ryby se chytají jen s prutem a trpělivostí.",
    fishing: [
      "Prut a návnada stačí. Různé druhy ryb žijí na různých místech, v různém počasí a v různou denní dobu, takže lov je hlavně o tom vědět, kde a kdy.",
      "Vedle běžných ryb existují rare a trophy varianty, které mají větší cenu. Vše se prodává Hunter's Callu, takže z rybaření je vedlejší zdroj zlata i reputace.",
      "Rybařit se dá i ve více lidech na jedné lodi — je to ideální klidná činnost mezi souboji a plavbou za pokladem.",
    ],
    whatToLookFor: ["Hunter's Call", "Rare fish", "Trophy fish", "Fishing guide", "Fishing challenge"],
    metaDescription:
      "Rybaření v Sea of Thieves: prut a návnady, Hunter's Call, vzácné a trophy ryby a tipy, kde a kdy se vyplatí lovit.",
  },
  {
    slug: "terraria",
    seoTitle: "Terraria – rybaření, Angler a tipy | HowToFish.cz",
    tagline:
      "V Terrarii je rybaření vlastní systém — Angler a jeho questy, fishing power a výbava, která se neobejde bez správného biotopu.",
    fishing: [
      "Rybaření tu není jen doplněk: má vlastní výbavu (pruty, návnady, doplňky), vlastní stat „fishing power“ i vlastní odměny. Lepší výbava a vhodnější místo znamenají lepší úlovky.",
      "Angler rozdává rybářské questy — každý den chce konkrétní rybu z konkrétního biotopu. Za splněné questy dává odměny, které jinde neseženeš.",
      "Vyplatí se stavět si vlastní rybářská jezera: voda musí mít správnou velikost a nesmí být „kontaminovaná“ jiným biotopem, jinak chytíš něco jiného, než potřebuješ.",
    ],
    whatToLookFor: ["Angler quests", "Fishing power", "Bait", "Biome fishing pool", "Fishing guide"],
    metaDescription:
      "Rybaření v Terrarii: Angler questy, fishing power, návnady a biotopy — plus tipy, kde a jak lovit.",
  },
  {
    slug: "final-fantasy-xiv",
    seoTitle: "Final Fantasy XIV – rybaření a Fisher | HowToFish.cz",
    tagline: "Ve FFXIV je Fisher samostatný gathering job s vlastními úrovněmi, úlovky a dokonce vlastní lodí.",
    fishing: [
      "Fisher je jeden ze tří gathering jobů — má vlastní úrovně, dovednosti i sbírku úlovků. Rybařit se dá skoro všude, kde je voda.",
      "Samostatnou kapitolou je Ocean Fishing: výprava lodí Endeavor, kde se boduje podle toho, co a jak chytíš. Právě tam se dají získat vzácné úlovky i mount.",
      "Vedle běžných ryb existují collectables a vzácné „big fish“, které se loví za konkrétních podmínek — podle času, počasí a návnady.",
    ],
    whatToLookFor: ["Fisher job", "Ocean Fishing", "Big Fish", "Collectables", "Fisher guide"],
    metaDescription:
      "Rybaření ve Final Fantasy XIV: Fisher job, Ocean Fishing, vzácné úlovky a tipy, jak levelovat a co chytat.",
  },
  {
    slug: "world-of-warcraft",
    seoTitle: "World of Warcraft – rybaření a profese | HowToFish.cz",
    tagline: "Rybaření je ve WoW jedna z nejstarších profesí — klidná, výnosná a plná sezónních akcí.",
    fishing: [
      "Fishing je samostatná profese s vlastními úrovněmi. Dá se dělat kdekoliv, kde je voda — v Classicu i v současném retailu.",
      "Z rybaření je i slušný zdroj zlata: vzácné ryby se prodávají, z některých se vaří jídlo a jiné se používají v alchymii.",
      "K rybaření patří i komunitní akce, třeba Stranglethorn Fishing Extravaganza, kde se soutěží o vzácné úlovky.",
    ],
    whatToLookFor: ["Fishing profession", "Angler", "Rare fish", "Fishing for gold", "Stranglethorn Extravaganza"],
    metaDescription:
      "Rybaření ve World of Warcraft: profese, vzácné ryby, zlato z rybaření a sezónní akce — plus tipy a videa.",
  },
  {
    slug: "old-school-runescape",
    seoTitle: "Old School RuneScape – rybaření a trénink 1–99 | HowToFish.cz",
    tagline: "V OSRS je rybaření klasická dovednost: trénink 1–99, AFK metody a slušný zdroj zlata.",
    fishing: [
      "Rybaření se tréninkuje jako každá jiná dovednost — od prvních úlovků až po 99. Některé metody jsou záměrně AFK, jiné výnosnější.",
      "Vyšší úrovně odemykají lepší ryby i lokality, ale taky metody, které jsou pomalejší na zkušenosti a bohatší na zlato.",
      "Rybaření se pojí i s dalšími dovednostmi (vaření) a u ironman účtů bývá vlastní úlovek často jediná cesta k jídlu.",
    ],
    whatToLookFor: ["1–99 fishing", "AFK fishing", "Money making", "Anglerfish", "Fishing guide"],
    metaDescription: "Rybaření v Old School RuneScape: trénink 1–99, AFK metody, výdělek a tipy pro ironmany.",
  },
  {
    slug: "warframe",
    seoTitle: "Warframe – spear fishing a tipy | HowToFish.cz",
    tagline: "Ve Warframe se rybaří oštěpem v otevřených zónách — z úlovků se vyrábí výbava i reputace.",
    fishing: [
      "Rybaření funguje jen v otevřených lokacích (Plains of Eidolon, Orb Vallis, Cambion Drift). Loví se oštěpem a každá zóna má vlastní druhy.",
      "Úlovky se používají na výrobu, jako potrava pro zvířata nebo na reputaci u místních frakcí — vyplatí se vědět, co kde žije.",
      "Různé oštěpy a návnady ovlivňují, co vůbec můžeš chytit; roli hraje i denní doba a místo, kde se postavíš.",
    ],
    whatToLookFor: ["Spear fishing", "Plains of Eidolon", "Orb Vallis", "Cambion Drift", "Fishing guide"],
    metaDescription: "Rybaření ve Warframe: spear fishing v Plains of Eidolon, Orb Vallis a Cambion Drift — druhy, oštěpy a tipy.",
  },
  {
    slug: "palia",
    seoTitle: "Palia – rybaření a vzácné ryby | HowToFish.cz",
    tagline: "V Palii je rybaření jedna ze základních dovedností — klidná, odměňující a s vlastními vzácnými úlovky.",
    fishing: [
      "Rybaření má vlastní úroveň a postupně odemyká lepší pruty a návnady. Chytat se dá v řekách, jezerech i v moři.",
      "Různé druhy ryb se objevují podle místa, denní doby a počasí — vzácné úlovky často chtějí konkrétní kombinaci.",
      "Z úlovků je jídlo, dárky pro postavy i materiál pro výrobu, takže se rybaření vyplatí i mimo samotný lov.",
    ],
    whatToLookFor: ["Fishing level", "Rare fish", "Fishing locations", "Fishing guide"],
    metaDescription: "Rybaření v Palii: úrovně a pruty, vzácné ryby podle místa a času a tipy, jak na ně.",
  },
  {
    slug: "fallout-76",
    seoTitle: "Fallout 76 – rybaření a Gone Fission | HowToFish.cz",
    tagline: "Rybaření přišlo do Falloutu 76 s aktualizací Gone Fission — prut, přes 30 druhů ryb a vlastní výzvy.",
    fishing: [
      "Rybaření přidala aktualizace Gone Fission (červen 2025): prut, návnady a přes 30 druhů ryb v apalačských vodách.",
      "Prut se dá vylepšovat (Mark 1 až Mark 4) a postupně odemyká lepší úlovky. K tomu patří denní a týdenní rybářské výzvy.",
      "Ryby se dají jíst, použít do receptů nebo vystavit — a část rybaření se prolíná s dalšími aktivitami ve hře.",
    ],
    whatToLookFor: ["Gone Fission", "Fishing rod", "Fish challenge", "Fishing guide"],
    metaDescription: "Rybaření ve Falloutu 76: aktualizace Gone Fission, prut Mark 1–4, druhy ryb a rybářské výzvy.",
  },
  {
    slug: "fishing-planet",
    seoTitle: "Fishing Planet – rybaření a tipy | HowToFish.cz",
    tagline: "Fishing Planet je rybaření jako hlavní náplň — realistické revíry, náčiní a chování ryb.",
    fishing: [
      "Celá hra stojí na rybaření: vybíráš pruty, navijáky, vlasce a návnady a lovíš na skutečných lokalitách po celém světě.",
      "Důraz je na realistickém chování ryb — druh, počasí, denní doba i hloubka rozhodují, co zabere.",
      "Postupně odemykáš nové revíry i vybavení. Hra je free to play a dá se hrát i na konzolích a mobilu.",
    ],
    whatToLookFor: ["Beginner tips", "Power levelling", "Best spots", "Fishing guide"],
    metaDescription: "Fishing Planet: realistický rybářský simulátor — začátečnické tipy, levelování, revíry a návody.",
  },
];

export function getGameDetailContent(slug: string): GameDetailContent | undefined {
  return gameDetails.find((detail) => detail.slug === slug);
}

// --- Připraveno pro další fázi (monitoring) -----------------------------
// Datová vrstva pro sekci „Streameři, kteří tuhle hru hrají“. Zatím vrací
// PRÁZDNÝ seznam — žádný crawler, žádné API (viz zadání). Komponenta se
// při prázdném seznamu vůbec nevykreslí.
//
// Sekce s videi už reálná data má: čte je z tabulky `game_videos` přes
// lib/games/game-videos.ts (schválená videa), viz /games/[slug].

export type GameStreamerRef = { name: string; slug?: string; url?: string };

export function getGameStreamers(_game: GameEntry): GameStreamerRef[] {
  return [];
}
