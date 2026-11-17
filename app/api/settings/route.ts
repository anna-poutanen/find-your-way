import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const input = await request.json() as { displayName?: string; accountType?: string; anonymousByDefault?: boolean };
  const displayName = input.displayName?.trim() ?? "";
  if (displayName.length < 2 || displayName.length > 80) return Response.json({ error: "Enter a name between 2 and 80 characters." }, { status: 400 });
  const profile = await ensureProfile(user);
  if (profile.role !== "admin" && input.accountType !== "user" && input.accountType !== "shelter") {
    return Response.json({ error: "Choose a valid account type." }, { status: 400 });
  }
  const role = profile.role === "admin" ? "admin" : input.accountType as "user" | "shelter";
  await getDb().update(profiles).set({ displayName, role, anonymousByDefault: input.anonymousByDefault !== false, updatedAt: new Date().toISOString() }).where(eq(profiles.userId, user.userId));
  return Response.json({ ok: true, role });
}
