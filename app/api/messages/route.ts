import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { getDb } from "@/db";
import { conversations, messages } from "@/db/schema";
import { queueAndAttemptEmail } from "@/lib/email-delivery";
import { ensureProfile } from "@/lib/profile";
import { getOrganizationIdForListing, getResourceById } from "@/lib/resources-server";

export async function GET() {
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  await ensureProfile(user); const rows = await getDb().select().from(conversations).where(eq(conversations.userId, user.userId)).orderBy(desc(conversations.lastMessageAt));
  return Response.json({ conversations: rows });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  const input = await request.json() as { listingId?: string; body?: string; anonymous?: boolean };
  const body = input.body?.trim();
  if (!input.listingId || !body || body.length < 10 || body.length > 3000) return Response.json({ error: "Write a message between 10 and 3,000 characters." }, { status: 400 });
  const resource = await getResourceById(input.listingId);
  if (!resource) return Response.json({ error: "That resource is no longer available." }, { status: 404 });
  const profile = await ensureProfile(user); const db = getDb();
  const organizationId = await getOrganizationIdForListing(resource.id);
  let conversation = await db.select().from(conversations).where(and(eq(conversations.userId, user.userId), eq(conversations.listingId, input.listingId), eq(conversations.status, "open"))).get();
  if (!conversation) {
    const id = crypto.randomUUID();
    await db.insert(conversations).values({ id, listingId: resource.id, listingName: resource.name, userId: user.userId, organizationId, contactEmail: resource.email ?? null, anonymous: input.anonymous !== false, channel: organizationId ? (resource.email ? "both" : "in_app") : (resource.email ? "email_relay" : "in_app"), relayToken: crypto.randomUUID().replaceAll("-", "") });
    conversation = await db.select().from(conversations).where(eq(conversations.id, id)).get();
  }
  if (!conversation) return Response.json({ error: "Conversation could not be created." }, { status: 500 });
  if (!conversation.organizationId && organizationId) await db.update(conversations).set({ organizationId }).where(eq(conversations.id, conversation.id));
  const messageId = crypto.randomUUID();
  await db.insert(messages).values({ id: messageId, conversationId: conversation.id, senderUserId: user.userId, senderKind: "user", body, deliveryStatus: conversation.contactEmail || resource.email ? "queued" : "stored" });
  await db.update(conversations).set({ anonymous: input.anonymous !== false, contactEmail: conversation.contactEmail ?? resource.email ?? null, lastMessageAt: new Date().toISOString() }).where(eq(conversations.id, conversation.id));
  const sender = input.anonymous === false ? profile.displayName : "Someone using Find Your Way";
  const emailStatus = await queueAndAttemptEmail({ messageId, toEmail: conversation.contactEmail ?? resource.email, subject: `New Find Your Way message about ${resource.name}`, textBody: `${sender} sent a private message about ${resource.name}:\n\n${body}\n\nSign in to Find Your Way to reply without exposing personal email addresses.` });
  return Response.json({ ok: true, conversationId: conversation.id, emailStatus });
}
