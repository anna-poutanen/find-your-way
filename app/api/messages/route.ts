import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { getDb } from "@/db";
import { conversations, messages } from "@/db/schema";
import { ensureProfile } from "@/lib/profile";

export async function GET() {
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  await ensureProfile(user); const rows = await getDb().select().from(conversations).where(eq(conversations.userId, user.userId)).orderBy(desc(conversations.lastMessageAt));
  return Response.json({ conversations: rows });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  const input = await request.json() as { listingId?: string; listingName?: string; body?: string; anonymous?: boolean };
  const body = input.body?.trim();
  if (!input.listingId || !input.listingName || !body || body.length < 10 || body.length > 3000) return Response.json({ error: "Write a message between 10 and 3,000 characters." }, { status: 400 });
  await ensureProfile(user); const db = getDb();
  let conversation = await db.select().from(conversations).where(and(eq(conversations.userId, user.userId), eq(conversations.listingId, input.listingId), eq(conversations.status, "open"))).get();
  if (!conversation) {
    const id = crypto.randomUUID();
    await db.insert(conversations).values({ id, listingId: input.listingId, listingName: input.listingName, userId: user.userId, anonymous: input.anonymous !== false, channel: "email_relay", relayToken: crypto.randomUUID().replaceAll("-", "") });
    conversation = await db.select().from(conversations).where(eq(conversations.id, id)).get();
  }
  if (!conversation) return Response.json({ error: "Conversation could not be created." }, { status: 500 });
  await db.insert(messages).values({ id: crypto.randomUUID(), conversationId: conversation.id, senderUserId: user.userId, senderKind: "user", body, deliveryStatus: "queued" });
  await db.update(conversations).set({ anonymous: input.anonymous !== false, lastMessageAt: new Date().toISOString() }).where(eq(conversations.id, conversation.id));
  return Response.json({ ok: true, conversationId: conversation.id });
}
