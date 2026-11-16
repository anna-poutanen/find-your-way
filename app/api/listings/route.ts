import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { getDb } from "@/db";
import { listingRevisions, organizationMembers, organizations } from "@/db/schema";
import { requireShelterProfile } from "@/lib/profile";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  try { await requireShelterProfile(user); } catch { return Response.json({ error: "A shelter or admin account is required." }, { status: 403 }); }
  const payload = await request.json() as Record<string, string>;
  for (const field of ["name", "category", "city", "email", "summary", "details"]) if (!payload[field]?.trim()) return Response.json({ error: `Please complete ${field}.` }, { status: 400 });
  const db = getDb(); const organizationId = crypto.randomUUID();
  await db.batch([
    db.insert(organizations).values({ id: organizationId, name: payload.name.trim(), website: payload.website || null, verificationStatus: "pending", createdBy: user.userId }),
    db.insert(organizationMembers).values({ organizationId, userId: user.userId, memberRole: "owner", status: "pending" }),
    db.insert(listingRevisions).values({ id: crypto.randomUUID(), organizationId, submittedBy: user.userId, payloadJson: JSON.stringify(payload), status: "pending" }),
  ]);
  return Response.json({ ok: true });
}
