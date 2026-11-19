import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { ConversationThread } from "@/components/conversation-thread";
import { SiteHeader } from "@/components/site-header";
import { getDb } from "@/db";
import { conversations, messages, organizationMembers } from "@/db/schema";
import { requireCurrentUser } from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCurrentUser(`/messages/${id}`); const profile = await ensureProfile(user); const db = getDb();
  const conversation = await db.select().from(conversations).where(eq(conversations.id, id)).get();
  if (!conversation) redirect("/dashboard");
  const organizationAccess = conversation.organizationId ? await db.select().from(organizationMembers).where(and(eq(organizationMembers.organizationId, conversation.organizationId), eq(organizationMembers.userId, user.userId), eq(organizationMembers.status, "active"))).get() : null;
  const viewerKind = conversation.userId === user.userId ? "user" : organizationAccess || profile.role === "admin" ? "organization" : null;
  if (!viewerKind) redirect("/dashboard");
  const rows = await db.select().from(messages).where(eq(messages.conversationId, conversation.id)).orderBy(asc(messages.createdAt));
  return <main><SiteHeader user={user} /><section className="settings-page"><div className="shell thread-shell"><a className="back-link" href={viewerKind === "user" ? "/dashboard" : "/shelter#messages"}><ArrowLeft size={16} /> Back to {viewerKind === "user" ? "dashboard" : "organization workspace"}</a><header className="thread-heading"><span className="eyebrow"><LockKeyhole size={14} /> Private conversation</span><h1>{conversation.listingName}</h1><p>{conversation.anonymous ? "The person seeking support is using anonymous messaging." : "This conversation uses their account display name."}</p></header><ConversationThread conversationId={conversation.id} viewerKind={viewerKind} messages={rows.map((row) => ({ id: row.id, body: row.body, senderKind: row.senderKind, createdAt: row.createdAt, deliveryStatus: row.deliveryStatus }))} /></div></section></main>;
}
