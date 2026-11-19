import "server-only";

import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { emailDeliveries, messages } from "@/db/schema";

type DeliveryInput = {
  messageId: string;
  toEmail?: string | null;
  subject: string;
  textBody: string;
};

export async function queueAndAttemptEmail(input: DeliveryInput) {
  if (!input.toEmail) {
    await getDb().update(messages).set({ deliveryStatus: "stored" }).where(eq(messages.id, input.messageId));
    return "stored" as const;
  }

  const db = getDb();
  const deliveryId = crypto.randomUUID();
  await db.insert(emailDeliveries).values({ id: deliveryId, messageId: input.messageId, toEmail: input.toEmail, subject: input.subject, textBody: input.textBody });

  if (!env.RESEND_API_KEY || !env.MESSAGE_FROM_EMAIL) {
    await db.update(emailDeliveries).set({ status: "configuration_required", lastError: "Email sender credentials are not configured.", attempts: 1, updatedAt: new Date().toISOString() }).where(eq(emailDeliveries.id, deliveryId));
    await db.update(messages).set({ deliveryStatus: "failed" }).where(eq(messages.id, input.messageId));
    return "configuration_required" as const;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: env.MESSAGE_FROM_EMAIL, to: [input.toEmail], subject: input.subject, text: input.textBody }),
    });
    const result = await response.json().catch(() => ({})) as { id?: string; message?: string };
    if (!response.ok) throw new Error(result.message ?? `Email provider returned ${response.status}.`);
    await db.update(emailDeliveries).set({ status: "sent", providerMessageId: result.id ?? null, attempts: 1, updatedAt: new Date().toISOString() }).where(eq(emailDeliveries.id, deliveryId));
    await db.update(messages).set({ deliveryStatus: "sent" }).where(eq(messages.id, input.messageId));
    return "sent" as const;
  } catch (error) {
    await db.update(emailDeliveries).set({ status: "failed", lastError: error instanceof Error ? error.message.slice(0, 500) : "Email delivery failed.", attempts: 1, updatedAt: new Date().toISOString() }).where(eq(emailDeliveries.id, deliveryId));
    await db.update(messages).set({ deliveryStatus: "failed" }).where(eq(messages.id, input.messageId));
    return "failed" as const;
  }
}
