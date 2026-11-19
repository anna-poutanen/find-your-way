import "server-only";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizationInvitations, organizationMembers, profiles } from "@/db/schema";
import type { AppUser } from "@/lib/auth";
import { normalizeEmail } from "@/lib/auth";

export async function acceptPendingInvitations(user: AppUser) {
  const db = getDb();
  const email = normalizeEmail(user.email);
  const pending = await db.select().from(organizationInvitations).where(and(eq(organizationInvitations.email, email), eq(organizationInvitations.status, "pending")));
  if (!pending.length) return 0;
  const now = new Date().toISOString();
  for (const invitation of pending) {
    await db.insert(organizationMembers).values({ organizationId: invitation.organizationId, userId: user.userId, memberRole: "staff", status: "active" }).onConflictDoUpdate({ target: [organizationMembers.organizationId, organizationMembers.userId], set: { status: "active" } });
    await db.update(organizationInvitations).set({ status: "accepted", acceptedAt: now }).where(eq(organizationInvitations.id, invitation.id));
  }
  await db.update(profiles).set({ role: "shelter", updatedAt: now }).where(and(eq(profiles.userId, user.userId), eq(profiles.role, "user")));
  return pending.length;
}

export async function canManageOrganization(user: AppUser, organizationId: string) {
  if (user.role === "admin") return true;
  const member = await getDb().select().from(organizationMembers).where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, user.userId), eq(organizationMembers.status, "active"))).get();
  return member?.memberRole === "owner";
}

export async function canAccessOrganization(user: AppUser, organizationId: string) {
  if (user.role === "admin") return true;
  const member = await getDb().select().from(organizationMembers).where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, user.userId), eq(organizationMembers.status, "active"))).get();
  return Boolean(member);
}
