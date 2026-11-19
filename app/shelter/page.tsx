import { and, desc, eq } from "drizzle-orm";
import { Building2, CheckCircle2, ChevronRight, MessageCircle, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { ClaimForm } from "@/components/claim-form";
import { SiteHeader } from "@/components/site-header";
import { StaffManager } from "@/components/staff-manager";
import { SubmissionForm } from "@/components/submission-form";
import { getDb } from "@/db";
import { conversations, organizationInvitations, organizationMembers, organizations, profiles } from "@/db/schema";
import { requireCurrentUser } from "@/lib/auth";
import { acceptPendingInvitations } from "@/lib/organizations";
import { ensureProfile } from "@/lib/profile";
import { getAllResources, getOrganizationIdForListing } from "@/lib/resources-server";

export const dynamic = "force-dynamic";

export default async function ShelterPage() {
  const user = await requireCurrentUser("/shelter");
  await acceptPendingInvitations(user);
  const profile = await ensureProfile(user);
  if (profile.role === "user") redirect("/dashboard");
  const db = getDb();
  const memberships = await db.select().from(organizationMembers).where(and(eq(organizationMembers.userId, user.userId), eq(organizationMembers.status, "active")));
  const workspaceOrganizations: { id: string; name: string; canManage: boolean; staff: { userId: string; name: string; email: string; role: string }[]; invitations: { id: string; email: string }[] }[] = [];
  const inbox: (typeof conversations.$inferSelect)[] = [];
  for (const membership of memberships) {
    const organization = await db.select().from(organizations).where(eq(organizations.id, membership.organizationId)).get();
    if (!organization) continue;
    const memberRows = await db.select().from(organizationMembers).where(and(eq(organizationMembers.organizationId, organization.id), eq(organizationMembers.status, "active")));
    const staff: { userId: string; name: string; email: string; role: string }[] = [];
    for (const member of memberRows) {
      const memberProfile = await db.select().from(profiles).where(eq(profiles.userId, member.userId)).get();
      if (memberProfile) staff.push({ userId: member.userId, name: memberProfile.displayName, email: memberProfile.email, role: member.memberRole });
    }
    const invitations = await db.select().from(organizationInvitations).where(and(eq(organizationInvitations.organizationId, organization.id), eq(organizationInvitations.status, "pending")));
    workspaceOrganizations.push({ id: organization.id, name: organization.name, canManage: profile.role === "admin" || membership.memberRole === "owner", staff, invitations: invitations.map((item) => ({ id: item.id, email: item.email })) });
    const organizationThreads = await db.select().from(conversations).where(eq(conversations.organizationId, organization.id)).orderBy(desc(conversations.lastMessageAt)).limit(20);
    for (const thread of organizationThreads) if (!inbox.some((item) => item.id === thread.id)) inbox.push(thread);
  }
  inbox.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  const resources = await getAllResources();
  const claimOptions: { id: string; name: string; city: string }[] = [];
  for (const resource of resources) if (!await getOrganizationIdForListing(resource.id)) claimOptions.push({ id: resource.id, name: resource.name, city: resource.city });

  return <main>
    <SiteHeader user={user} />
    <section className="page-hero organization-hero"><div className="shell"><span className="eyebrow">Organization workspace</span><h1>Keep your services easy to find.</h1><p>Submit a new organization, claim an existing listing, respond to private messages, and manage staff access. Public changes stay in review until an administrator approves them.</p><div className="mini-feature-row"><span><Building2 size={18} /> One organization, many programs</span><span><Users size={18} /> Managed staff access</span><span><MessageCircle size={18} /> Private conversations</span><span><CheckCircle2 size={18} /> Admin-verified changes</span></div></div></section>
    <section className="section-space pt-10"><div className="shell organization-sections">
      <StaffManager organizations={workspaceOrganizations} />
      <section className="dashboard-section" id="messages"><div className="dashboard-section-heading"><div><span className="eyebrow">Inbox</span><h2>Organization conversations</h2></div><span className="count-badge">{inbox.length}</span></div>{inbox.length ? <div className="saved-list">{inbox.map((thread) => <a key={thread.id} href={`/messages/${thread.id}`}><div><strong>{thread.listingName}</strong><span>{thread.anonymous ? "Anonymous conversation" : "Named conversation"} · {thread.status}</span></div><ChevronRight size={17} /></a>)}</div> : <div className="soft-empty"><MessageCircle size={21} /><div><strong>No organization messages yet</strong><p>Messages appear here after a listing is connected to your organization.</p></div></div>}</section>
      <div className="workspace-grid"><div id="submit-listing"><SubmissionForm /></div><div id="claim-listing"><ClaimForm listings={claimOptions} /></div></div>
    </div></section>
  </main>;
}
