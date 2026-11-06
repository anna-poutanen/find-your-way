import { and, eq } from "drizzle-orm";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { getDb } from "@/db";
import { favorites } from "@/db/schema";
import { ensureProfile } from "@/lib/profile";

export async function GET() {
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  await ensureProfile(user); const rows = await getDb().select({ listingId: favorites.listingId }).from(favorites).where(eq(favorites.userId, user.userId));
  return Response.json({ favorites: rows.map((row) => row.listingId) });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  const { listingId } = await request.json() as { listingId?: string }; if (!listingId) return Response.json({ error: "A resource is required" }, { status: 400 });
  await ensureProfile(user); await getDb().insert(favorites).values({ userId: user.userId, listingId }).onConflictDoNothing();
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  const { listingId } = await request.json() as { listingId?: string }; if (!listingId) return Response.json({ error: "A resource is required" }, { status: 400 });
  await getDb().delete(favorites).where(and(eq(favorites.userId, user.userId), eq(favorites.listingId, listingId)));
  return Response.json({ ok: true });
}
