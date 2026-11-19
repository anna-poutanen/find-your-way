import { and, eq } from "drizzle-orm";
import { getCurrentUser, isSameOrigin, normalizeEmail } from "@/lib/auth";
import { getDb } from "@/db";
import { organizationInvitations, organizationMembers, profiles } from "@/db/schema";
import { canManageOrganization } from "@/lib/organizations";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const input = await request.json() as { organizationId?: string; email?: string };
  const email = normalizeEmail(input.email ?? "");
  if (!input.organizationId || !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Choose an organization and enter a valid email." }, { status: 400 });
  if (!await canManageOrganization(user, input.organizationId)) return Response.json({ error: "Only an organization owner or administrator can manage staff." }, { status: 403 });
  const db = getDb(); const existingProfile = await db.select().from(profiles).where(eq(profiles.email, email)).get();
  if (existingProfile) {
    await db.insert(organizationMembers).values({ organizationId: input.organizationId, userId: existingProfile.userId, memberRole: "staff", status: "active" }).onConflictDoUpdate({ target: [organizationMembers.organizationId, organizationMembers.userId], set: { memberRole: "staff", status: "active" } });
    if (existingProfile.role === "user") await db.update(profiles).set({ role: "shelter", updatedAt: new Date().toISOString() }).where(eq(profiles.userId, existingProfile.userId));
    return Response.json({ ok: true, state: "added" });
  }
  const pending = await db.select().from(organizationInvitations).where(and(eq(organizationInvitations.organizationId, input.organizationId), eq(organizationInvitations.email, email), eq(organizationInvitations.status, "pending"))).get();
  if (pending) return Response.json({ error: "That email already has a pending invitation." }, { status: 409 });
  await db.insert(organizationInvitations).values({ id: crypto.randomUUID(), organizationId: input.organizationId, email, invitedBy: user.userId });
  return Response.json({ ok: true, state: "invited" });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const input = await request.json() as { organizationId?: string; invitationId?: string; memberUserId?: string };
  if (!input.organizationId || !await canManageOrganization(user, input.organizationId)) return Response.json({ error: "Only an organization owner or administrator can manage staff." }, { status: 403 });
  const db = getDb();
  if (input.invitationId) {
    await db.update(organizationInvitations).set({ status: "cancelled" }).where(and(eq(organizationInvitations.id, input.invitationId), eq(organizationInvitations.organizationId, input.organizationId)));
    return Response.json({ ok: true });
  }
  if (input.memberUserId) {
    const member = await db.select().from(organizationMembers).where(and(eq(organizationMembers.organizationId, input.organizationId), eq(organizationMembers.userId, input.memberUserId))).get();
    if (!member || member.memberRole === "owner") return Response.json({ error: "Organization owners cannot be removed here." }, { status: 400 });
    await db.update(organizationMembers).set({ status: "removed" }).where(and(eq(organizationMembers.organizationId, input.organizationId), eq(organizationMembers.userId, input.memberUserId)));
    return Response.json({ ok: true });
  }
  return Response.json({ error: "Choose a staff member or invitation." }, { status: 400 });
}
