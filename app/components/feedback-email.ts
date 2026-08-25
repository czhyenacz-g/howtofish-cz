// Basic obfuscation, NE kryptografická ochrana — email se skládá z částí,
// jen aby ho jednoduchý scraping bot nenašel jako čistý text v HTML/JS
// stringu. Tahle funkce se volá výhradně z FeedbackEmailButton, což je
// komponenta renderovaná jen ve větvi pro přihlášené uživatele.
export function buildFeedbackEmail(): string {
  const local = "info";
  const domain = "howtofish";
  const tld = "cz";
  return `${local}@${domain}.${tld}`;
}

export function buildFeedbackMailtoBody(nickname: string, pageUrl: string): string {
  return [
    "Dobrý den,",
    "",
    "chtěl bych doplnit nebo opravit něco na této stránce:",
    "",
    pageUrl,
    "",
    "...",
    "",
    `Steam nick: ${nickname}`,
  ].join("\n");
}

export const FEEDBACK_MAILTO_SUBJECT = "HowToFish.cz – návrh / zpětná vazba";

export function buildFeedbackMailto({
  nickname,
  pageUrl,
}: {
  nickname: string;
  pageUrl: string;
}): string {
  const email = buildFeedbackEmail();
  const body = buildFeedbackMailtoBody(nickname, pageUrl);
  return `mailto:${email}?subject=${encodeURIComponent(FEEDBACK_MAILTO_SUBJECT)}&body=${encodeURIComponent(body)}`;
}
