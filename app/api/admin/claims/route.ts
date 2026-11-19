import { and, eq } from "drizzle-orm";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { getDb } from "@/db";
import { auditLogs, conversations, listingOwnership, organizationClaims, organizationMembers, organizations } from "@/db/schema";
import { requireAdminProfile } from "@/lib/profile";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  try { await requireAdminProfile(user); } catch { return Response.json({ error: "Admin access required." }, { status: 403 }); }
  const { claimId, action } = await request.json() as { claimId?: string; action?: "approve" | "reject" | "changes_requested" };
  if (!claimId || !action || !["approve", "reject", "changes_requested"].includes(action)) return Response.json({ error: "Review action is incomplete." }, { status: 400 });
  const db = getDb(); const claim = await db.select().from(organizationClaims).where(eq(organizationClaims.id, claimId)).get();
  if (!claim || claim.status !== "pending") return Response.json({ error: "Claim is no longer pending." }, { status: 409 });
  const now = new Date().toISOString(); const status = action === "approve" ? "approved" : action;
  if (action === "approve") {
    const organizationId = crypto.randomUUID();
    await db.batch([
      db.insert(organizations).values({ id: organizationId, name: claim.listingName, verificationStatus: "verified", createdBy: claim.submittedBy }),
      db.insert(organizationMembers).values({ organizationId, userId: claim.submittedBy, memberRole: "owner", status: "active" }),
      db.insert(listingOwnership).values({ listingId: claim.listingId, organizationId }),
      db.update(organizationClaims).set({ status, organizationId, reviewerId: user.userId, reviewedAt: now }).where(and(eq(organizationClaims.id, claim.id), eq(organizationClaims.status, "pending"))),
      db.update(conversations).set({ organizationId, channel: "both" }).where(eq(conversations.listingId, claim.listingId)),
    ]);
  } else {
    await db.update(organizationClaims).set({ status, reviewerId: user.userId, reviewedAt: now }).where(eq(organizationClaims.id, claim.id));
  }
  await db.insert(auditLogs).values({ id: crypto.randomUUID(), actorUserId: user.userId, action: `claim_${action}`, entityType: "organization_claim", entityId: claim.id });
  return Response.json({ ok: true });
}
