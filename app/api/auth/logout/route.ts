import { NextRequest, NextResponse } from "next/server";
import { sanitizeReturnTo } from "../../../../lib/auth/return-to";
import { SESSION_COOKIE_NAME } from "../../../../lib/auth/session";

// POST + SameSite=Lax na session cookie stačí jako CSRF ochrana (Lax
// cookie se neposílá u cross-site POST requestů) — netřeba samostatný
// CSRF token pro tak jednoduchý formulář.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const returnTo = sanitizeReturnTo(formData.get("returnTo")?.toString() ?? null);

  const response = NextResponse.redirect(new URL(returnTo, request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
