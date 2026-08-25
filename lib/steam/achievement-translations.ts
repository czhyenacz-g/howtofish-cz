// Ruční český překlad názvů/popisů achievementů How to Fish, klíčováno
// podle Steam `apiName` (viz lib/steam/achievements.ts). Steam sám
// češtinu pro tuhle hru nemá, takže se overlay aplikuje lokálně po
// natažení schématu — žádný další request. Chybějící/nový apiName
// jednoduše nemá překlad a zobrazí se jen anglický originál (viz
// AchievementCard.tsx) — nikdy pád, jen chybějící řádek navíc.
export type AchievementTranslation = {
  name: string;
  description?: string;
};

export const ACHIEVEMENT_TRANSLATIONS: Record<string, AchievementTranslation> = {
  A01_FirstCreature: { name: "Začínáme", description: "Zabij svého prvního tvora." },
  A02_Seagull: { name: "Pusť mě!", description: "Nech se unést racky." },
  A03_Boss1: { name: "Kdo mi ukradl pivo", description: "Najdi a zabij viníka a přines ho strážci majáku." },
  A04_Noob: { name: "Nooby", description: "Zabij bez killscore multiplikátoru." },
  A05_DripCreature: { name: "Drip", description: "Zabij drip tvora." },
  A06_FlyingBoat: { name: "Teď jsem já pták", description: "Rozlétni se s lodí." },
  A07_BoatUpgrade: { name: "Vylepšení", description: "Vylepši motor lodi." },
  A08_Boss2: { name: "Čas na večeři", description: "Ulov večeři pro paní z lesa." },
  A09_BurntCreature: { name: "Mňam, do bříška", description: "Sněz spáleného tvora." },
  A10_EatMiniBoss: { name: "Soutěžní jedení", description: "Sněz mini-bosse." },
  A11_KillscoreMultiplier: { name: "Impozantní", description: "Získej 5× killscore multiplikátor." },
  A12_360Noscope: { name: "360 no scope", description: "Zabij tvora se 360° otočkou bez zaměřovače." },
  A13_Boss3: { name: "Dovolená", description: "Pomoz turistovi si zaplavat na dovolené." },
  A14_GrillMaster: { name: "Mistr grilování", description: "Zapal gril." },
  A15_SellWorth: { name: "Boháč! Milionář", description: "Prodej něco za 100 000 a víc." },
  A16_AllCreatures: { name: "Sběratel", description: "Najdi a zabij všechny tvory." },
  A17_Roulette: { name: "Vše na jednu kartu", description: "Vsaď na zelenou a vyhraj v ruletě." },
  A18_LegendarySkin: { name: "ZLATO ZLATO ZLATO", description: "Vytoč legendární skin z herního automatu." },
  A19_AllAttachments: { name: "Plně vybavený", description: "Nasaď všechny doplňky na jednu zbraň." },
  A20_Boss4: { name: "Děsivý pták", description: "Ochraň vyděšené ostrovany před děsivým ptákem." },
  A21_Boss5: { name: "Nejsmrtelnější úlovek", description: "Pomoz armádě porazit velkého tvora, kterého vypátrali." },
  A22_SeagullDynamite: { name: "Sen každého", description: "Zabij racka dynamitem." },
  A23_AllDripCreatures: { name: "Fishipedie", description: "Najdi a zabij všechny drip tvory." },
  A24_MaxBoat: { name: "Jsem rychlost", description: "Kup nejlepší motor pro loď." },
  A25_FinishGame: { name: "Jsme zpátky", description: "Dokonči hru." },
  A26_FastBoss: { name: "Brnkačka", description: "Zabij bosse do 10 sekund." },
  A27_Speedrunner: { name: "Bean", description: "Dokonči hru do 1 hodiny." },
  A28_Boss5MeleeKill: { name: "Kutil", description: "Poraz finálního bosse holýma rukama." },
};
