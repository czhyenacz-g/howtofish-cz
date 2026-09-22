import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getGameBySlug, hasGameDetailPage } from "../../../../data/games.ts";

// Interní (ne veřejný) endpoint pro on-demand revalidaci detailu hry po
// ručním schválení / odmítnutí videa — volá ho CLI
// (scripts/game-videos-review.ts), protože samo revalidatePath zavolat
// nemůže (běží mimo Next runtime).
//
// Bezpečnost:
//  - vyžaduje hlavičku `x-revalidate-secret` shodnou s env
//    GAME_REVALIDATE_SECRET a porovnává ji v konstantním čase,
//  - bez nastaveného secretu vrací vždy 401 (fail closed) — endpoint tedy
//    nikdy není otevřený omylem,
//  - revalidovat umí POUZE existující detail hry (jinak 400), takže se
//    nedá zneužít k revalidaci libovolné cesty.
export async function POST(request: Request) {
  const secret = process.env.GAME_REVALIDATE_SECRET;
  const provided = request.headers.get("x-revalidate-secret");

  if (!secret || !provided || !secretsMatch(provided, secret)) {
    return Response.json({ error: "Neautorizováno." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Neplatné JSON tělo." }, { status: 400 });
  }

  const slug = (body as { slug?: unknown } | null)?.slug;
  if (typeof slug !== "string" || slug.length === 0 || slug.length > 120) {
    return Response.json({ error: "Chybí platný slug." }, { status: 400 });
  }

  const game = getGameBySlug(slug);
  if (!game || !hasGameDetailPage(game)) {
    return Response.json({ error: "Neznámá hra s vlastním detailem." }, { status: 400 });
  }

  revalidatePath(`/games/${game.slug}`);
  return Response.json({ revalidated: true, slug: game.slug });
}

function secretsMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
}
