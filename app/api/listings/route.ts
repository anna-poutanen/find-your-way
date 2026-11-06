import { eq } from "drizzle-orm";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { getDb } from "@/db";
import { listingRevisions, organizationMembers, organizations, profiles } from "@/db/schema";
import { ensureProfile } from "@/lib/profile";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  const payload = await request.json() as Record<string, string>;
  for (const field of ["name", "category", "city", "email", "summary", "details"]) if (!payload[field]?.trim()) return Response.json({ error: `Please complete ${field}.` }, { status: 400 });
  await ensureProfile(user); const db = getDb(); const organizationId = crypto.randomUUID();
  await db.batch([
    db.insert(organizations).values({ id: organizationId, name: payload.name.trim(), website: payload.website || null, verificationStatus: "pending", createdBy: user.userId }),
    db.insert(organizationMembers).values({ organizationId, userId: user.userId, memberRole: "owner", status: "pending" }),
    db.insert(listingRevisions).values({ id: crypto.randomUUID(), organizationId, submittedBy: user.userId, payloadJson: JSON.stringify(payload), status: "pending" }),
  ]);
  const profile = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).get();
  if (profile?.role === "user") await db.update(profiles).set({ role: "shelter", updatedAt: new Date().toISOString() }).where(eq(profiles.userId, user.userId));
  return Response.json({ ok: true });
}
