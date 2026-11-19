import { and, eq } from "drizzle-orm";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { getDb } from "@/db";
import { conversations, messages, profiles } from "@/db/schema";
import { queueAndAttemptEmail } from "@/lib/email-delivery";
import { canAccessOrganization } from "@/lib/organizations";
import { ensureProfile } from "@/lib/profile";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const profile = await ensureProfile(user);
  const { id } = await params;
  const db = getDb();
  const conversation = await db.select().from(conversations).where(eq(conversations.id, id)).get();
  if (!conversation) return Response.json({ error: "Conversation not found." }, { status: 404 });
  const isUser = conversation.userId === user.userId;
  const isOrganization = Boolean(conversation.organizationId && await canAccessOrganization(user, conversation.organizationId));
  if (!isUser && !isOrganization && profile.role !== "admin") return Response.json({ error: "You do not have access to this conversation." }, { status: 403 });
  const input = await request.json() as { body?: string };
  const body = input.body?.trim() ?? "";
  if (body.length < 2 || body.length > 3000) return Response.json({ error: "Write a reply between 2 and 3,000 characters." }, { status: 400 });
  const recipient = isUser ? conversation.contactEmail : (await db.select({ email: profiles.email }).from(profiles).where(eq(profiles.userId, conversation.userId)).get())?.email;
  const messageId = crypto.randomUUID();
  await db.insert(messages).values({ id: messageId, conversationId: conversation.id, senderUserId: user.userId, senderKind: isUser ? "user" : (profile.role === "admin" ? "admin" : "shelter"), body, deliveryStatus: recipient ? "queued" : "stored" });
  await db.update(conversations).set({ lastMessageAt: new Date().toISOString(), status: "open" }).where(and(eq(conversations.id, conversation.id), eq(conversations.status, "open")));
  const emailStatus = await queueAndAttemptEmail({ messageId, toEmail: recipient, subject: `New reply about ${conversation.listingName}`, textBody: `There is a new private reply in your Find Your Way conversation about ${conversation.listingName}:\n\n${body}\n\nSign in to Find Your Way to continue the conversation.` });
  return Response.json({ ok: true, emailStatus });
}
