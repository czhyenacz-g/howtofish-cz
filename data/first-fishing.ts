// Data průvodce /prvni-rybareni (první skutečné rybaření v ČR) — metadata,
// FAQ a zdroje na jednom místě: čte je stránka, JSON-LD i sitemap.
//
// `updatedAt` je datum POSLEDNÍ SKUTEČNÉ ZMĚNY obsahu (ručně, YYYY-MM-DD) —
// sitemap ho používá jako lastModified, nikdy ne čas buildu. Při úpravě
// textu stránky ho posuň.
//
// Právní údaje ověřeny 2026-10-18: zákon č. 99/2004 Sb. (znění od
// 1. 7. 2025), vyhláška č. 197/2004 Sb., stránka MZe o vydání rybářského
// lístku (aktualizace 26. 2. 2024) a rybsvaz.cz.

export const FIRST_FISHING_PATH = "/prvni-rybareni";
export const FIRST_FISHING_UPDATED_AT = "2026-10-18";

export const FIRST_FISHING_TITLE = "Jak začít rybařit? První výbava, povolenka a rybářský set | HowToFish.cz";
export const FIRST_FISHING_H1 = "První rybaření: Co potřebuješ a jak začít?";
export const FIRST_FISHING_DESCRIPTION =
  "Chceš poprvé na ryby? Zjisti, co potřebuješ, jak funguje rybářský lístek a povolenka a jak vybrat první rybářský set pro začátečníka.";

export const AFFILIATE_DISCLOSURE =
  "Některé odkazy vedou na partnerské obchody. Pokud přes ně nakoupíš, můžeme získat provizi. Cena pro tebe se tím nemění.";

export type FaqItem = { question: string; answer: string };

export const FIRST_FISHING_FAQ: FaqItem[] = [
  {
    question: "Potřebuju na první rybaření zkoušku?",
    answer:
      "Na 30denní rybářský lístek ne — kvalifikaci u něj podle vyhlášky č. 197/2004 Sb. dokládat nemusíš. Na lístek na 10 let nebo na dobu neurčitou potřebuješ při prvním vydání osvědčení o získané kvalifikaci, které vydává organizace pověřená Ministerstvem zemědělství (typicky po zkoušce v místní organizaci rybářského svazu).",
  },
  {
    question: "Může dítě rybařit?",
    answer:
      "Ano, ale v rybářském revíru potřebuje i dítě vlastní rybářský lístek a povolenku. Lístek na 10 let má pro děti do 15 let snížený poplatek a u Českého rybářského svazu dokládají děti do 15 let ke všem žádostem souhlas zákonného zástupce. Na začátek se hodí rybářský kroužek místní organizace.",
  },
  {
    question: "Můžu jít na ryby jen jednou, na zkoušku?",
    answer:
      "Nejjednodušší je soukromý nebo komerční rybník, kde si zaplatíš lov podle pravidel provozovatele. Do rybářského revíru potřebuješ rybářský lístek (stačí 30denní) a povolenku — jaké povolenky uživatel revíru nabízí a jestli vyžaduje členství, zjistíš přímo u něj.",
  },
  {
    question: "Kolik mě to bude stát?",
    answer:
      "Rybářský lístek stojí podle MZe 200 Kč na 30 dní, 500 Kč na 10 let (250 Kč se sníženým poplatkem) a 1 000 Kč na dobu neurčitou. U rybářského svazu k tomu platíš zápisné, členský příspěvek a povolenku — aktuální ceník má každý svaz na svém webu. K tomu vybavení a nástrahy.",
  },
  {
    question: "Je feedrový set vhodný na všechny ryby?",
    answer:
      "Ne. Feedrový set je dobrý začátek pro lov kaprovitých ryb na položenou. Na dravce (přívlač), plavanou, muškaření nebo sumce potřebuješ jiný prut a jinou montáž.",
  },
  {
    question: "Kde zjistím pravidla konkrétní vody?",
    answer:
      "U revírů v seznamu revírů rybářského svazu a v podmínkách k povolence (lovné míry, doby hájení, povolené způsoby lovu, povinná výbava). U soukromé vody u jejího provozovatele.",
  },
];

export type SourceLink = { label: string; url: string };

export const FIRST_FISHING_SOURCES: SourceLink[] = [
  { label: "Zákon č. 99/2004 Sb., o rybářství (MZe)", url: "https://mze.gov.cz/public/portal/mze/legislativa/pravni-predpisy-mze/uplna-zneni/zakon-2004-99-rybarstvi" },
  { label: "Vyhláška č. 197/2004 Sb. (MZe)", url: "https://mze.gov.cz/public/portal/mze/legislativa/pravni-predpisy-mze/uplna-zneni/vyhlaska-2004-197-rybarstvi" },
  { label: "MZe: Vydání rybářského lístku", url: "https://mze.gov.cz/public/web/mze/ministerstvo-zemedelstvi/zivotni-situace/rybarstvi/zadost-o-vydani-rybarskeho-listku.html" },
  { label: "Český rybářský svaz: Jak se stát rybářem", url: "https://www.rybsvaz.cz/jak-se-stat-rybarem" },
  { label: "Český rybářský svaz: Povolenky a poplatky", url: "https://www.rybsvaz.cz/povolenky-a-poplatky" },
  { label: "Český rybářský svaz: Seznam revírů", url: "https://www.rybsvaz.cz/seznam-reviru" },
  { label: "Moravský rybářský svaz", url: "https://mrsbrno.cz/" },
];
