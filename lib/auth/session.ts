// Podepsaná (HMAC), ne šifrovaná session cookie — v payloadu je jen
// steam_id a expirace, žádná citlivá data. Aktuální nickname/avatar/
// is_blocked se vždy dočítá z DB (viz current-user.ts), takže cookie
// nemůže obsahovat zastaralý stav blokace.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "htf_session";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 dní

type SessionPayload = {
  steamId: string;
  exp: number; // unix seconds
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET není nastavený — Steam přihlášení nemůže vytvářet session.",
    );
  }
  return secret;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionCookieValue(steamId: string): string {
  const secret = getSecret();
  const payload: SessionPayload = {
    steamId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const data = base64url(JSON.stringify(payload));
  const signature = sign(data, secret);
  return `${data}.${signature}`;
}

export function verifySessionCookieValue(value: string | undefined | null): { steamId: string } | null {
  if (!value) return null;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  const dotIndex = value.lastIndexOf(".");
  if (dotIndex === -1) return null;
  const data = value.slice(0, dotIndex);
  const signature = value.slice(dotIndex + 1);
  if (!data || !signature) return null;

  const expectedSignature = sign(data, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (typeof payload.steamId !== "string" || typeof payload.exp !== "number") return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return { steamId: payload.steamId };
}
