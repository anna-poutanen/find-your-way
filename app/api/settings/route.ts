import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const input = await request.json() as { displayName?: string; anonymousByDefault?: boolean };
  const displayName = input.displayName?.trim() ?? "";
  if (displayName.length < 2 || displayName.length > 80) return Response.json({ error: "Enter a name between 2 and 80 characters." }, { status: 400 });
  await ensureProfile(user);
  await getDb().update(profiles).set({ displayName, anonymousByDefault: input.anonymousByDefault !== false, updatedAt: new Date().toISOString() }).where(eq(profiles.userId, user.userId));
  return Response.json({ ok: true });
}
