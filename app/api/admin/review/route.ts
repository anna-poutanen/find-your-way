import { eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { auditLogs, listingRevisions, listings, organizationMembers, organizations } from "@/db/schema";
import { requireAdminProfile } from "@/lib/profile";

function slugify(value: string) { return `${value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${crypto.randomUUID().slice(0, 6)}`; }

export async function POST(request: Request) {
  const user = await getChatGPTUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  try { await requireAdminProfile(user); } catch { return Response.json({ error: "Admin access required" }, { status: 403 }); }
  const { revisionId, action } = await request.json() as { revisionId?: string; action?: "approve" | "reject" | "changes_requested" };
  if (!revisionId || !action) return Response.json({ error: "Review action is incomplete." }, { status: 400 });
  const db = getDb(); const revision = await db.select().from(listingRevisions).where(eq(listingRevisions.id, revisionId)).get();
  if (!revision || revision.status !== "pending") return Response.json({ error: "Submission is no longer pending." }, { status: 409 });
  const status = action === "approve" ? "approved" : action; const now = new Date().toISOString();
  await db.update(listingRevisions).set({ status, reviewerId: user.userId, reviewedAt: now }).where(eq(listingRevisions.id, revisionId));
  if (action === "approve") {
    const data = JSON.parse(revision.payloadJson) as Record<string, string>; const listingId = revision.listingId ?? crypto.randomUUID();
    if (!revision.listingId) await db.insert(listings).values({ id: listingId, organizationId: revision.organizationId, slug: slugify(data.name), name: data.name, category: data.category, summary: data.summary, description: data.details, city: data.city, address: data.address || null, phone: data.phone || null, email: data.email || null, website: data.website || null, status: "published", sourceLabel: "Organization submission", lastVerifiedAt: now, createdBy: revision.submittedBy });
    if (revision.organizationId) { await db.update(organizations).set({ verificationStatus: "verified" }).where(eq(organizations.id, revision.organizationId)); await db.update(organizationMembers).set({ status: "active" }).where(eq(organizationMembers.organizationId, revision.organizationId)); }
  }
  await db.insert(auditLogs).values({ id: crypto.randomUUID(), actorUserId: user.userId, action, entityType: "listing_revision", entityId: revisionId });
  return Response.json({ ok: true });
}
