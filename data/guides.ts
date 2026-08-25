// Kurátorované návody pro /navody — redakční text HowToFish.cz shrnující
// fakta už ověřená a citovaná v data/fish.ts a data/bosses.ts. Žádný
// nový herní fakt, jen sepsaný postup z existujících zdrojů.

export type CuratedSource = { label: string; url: string };

export type CuratedGuide = {
  slug: string;
  title: string;
  category?: string;
  summary: string;
  content: string;
  sources: CuratedSource[];
};

export const guides: CuratedGuide[] = [
  {
    slug: "jak-porazit-spider-crab",
    title: "Jak porazit Spider Crab",
    category: "Bossové",
    summary: "Postup na prvního hlavního bosse hry na Ostrově 1 (Maják) — od přivolání po samotný souboj.",
    content:
      "Spider Crab je první hlavní boss hry a čeká tě hned na startovním ostrově.\n\n" +
      "Příprava: v obchodě si kup pivo a odnes ho strážci majáku — vyprázdní ti plechovku, kterou pak nasadíš jako speciální návnadu na prut. Než se pustíš do souboje, kup a nabruš boxerské klouby na maximum, bez toho souboj zbytečně dlouho trvá.\n\n" +
      "Přivolání: po zahození návnady se krab sám objeví a chytíš ho jako běžnou rybu, čímž se spustí souboj.\n\n" +
      "Souboj: nalákej kraba na výpad, uhni stranou a udeř ho zezadu během krátkého omráčení, které po výpadu následuje. Neutíkej příliš daleko — na delší vzdálenost přechází z výpadů na skoky a přijdeš tak o rytmus omráčení. Pod jeho životy je bílý časovač — když doběhne, krab uteče a celé přivolání musíš nastavit znovu.\n\n" +
      "Po vítězství krab upustí krunýř, který odnes strážci majáku výměnou za klíče od lodi a postup na další ostrov.",
    sources: [
      { label: "Nerdschalk – Spider Crab Fight: Requirements, Tips, and Boat Keys", url: "https://nerdschalk.com/how-to-fish-spider-crab-boss/" },
      { label: "The Gamer – How To Defeat The Spider Crab In How To Fish", url: "https://www.thegamer.com/how-to-fish-spider-crab-beer-defeat/" },
    ],
  },
  {
    slug: "jak-porazit-giant-piranha",
    title: "Jak porazit Giant Piranha",
    category: "Bossové",
    summary: "Druhý hlavní boss na Ostrově 2 (Les) — mnohem větší varianta běžné piraně.",
    content:
      "Giant Piranha čeká na 2. ostrově (Les) a je mnohem větší a nebezpečnější variantou běžné piraně.\n\n" +
      "Příprava: nachytej tři pijavice a odnes je lesní paní — výměnou dostaneš upravenou návnadu, kterou nasadíš na prut a přivoláš jí bosse. Vezmi si s sebou uvařené jídlo na doplnění zdraví a brokovnici (nebo boxerské klouby na menší přivolané piraně).\n\n" +
      "Souboj: piraňa se na rozdíl od jiných bossů neomráčí, takže se musíš neustále pohybovat a udržovat odstup. Uteč za strom a obíhej ho kolem — AI bosse to dost mate a můžeš ho takhle bezpečně postřelovat zezadu. Menší piraně, které boss v průběhu boje přivolává, buď zabij boxerskými klouby, nebo je sněz — doplní ti to zdraví.\n\n" +
      "Po vítězství musíš sebrat upuštěnou kostru a donést ji lesní paní zpátky, což odemyká souřadnice dalšího ostrova.",
    sources: [
      { label: "Mobalytics – How to Beat the Giant Piranha in How to Fish", url: "https://mobalytics.gg/gamebase/guides/how-to-fish-giant-piranha-boss-guide" },
      { label: "Nerdschalk – How to Fish Piranha Boss: Loadout, Fight Steps, and Skeleton Return", url: "https://nerdschalk.com/how-to-fish-piranha-boss/" },
    ],
  },
  {
    slug: "jak-porazit-pufferfish",
    title: "Jak porazit Pufferfish",
    category: "Bossové",
    summary: "Třetí hlavní boss na Ostrově 3 — jeden z nejtěžších soubojů v úvodní části hry.",
    content:
      "Pufferfish na 3. ostrově se nafukuje do ostnaté koule, která se snaží rozdrtit tebe i tvoji loď — patří k nejtěžším soubojům v úvodní části hry.\n\n" +
      "Příprava: vezmi si SMG nebo útočnou pušku — obyčejná pistole na něj podle komunitních zpráv nestačí. Carrot bait získáš výměnou za ohroženou rybu u NPC na 3. ostrově.\n\n" +
      "Souboj: jakmile máš carrot bait v inventáři, souboj se spustí sám. Bojuj v okolí stromů nebo skalnatého terénu — boss se hůř převaluje přes prudší terén, takže ti poskytne kryt. V multiplayeru je dobré určit jednoho hráče jako návnadu, zatímco ostatní soustředí palbu.\n\n" +
      "Po vítězství nenech trofej (ocas) ukrást racky — bez ní bys musel celý souboj opakovat od začátku. Trofej odemyká souřadnice dalšího ostrova.",
    sources: [
      { label: "Steam – oficiální screenshoty hry How to Fish", url: "https://store.steampowered.com/app/4001890/How_to_Fish/" },
      { label: "Nerdschalk – How to Fish Lures and Baits: Full List, Fish Pools, and Boss Catches", url: "https://nerdschalk.com/how-to-fish-every-lure-bait-catch/" },
    ],
  },
];
