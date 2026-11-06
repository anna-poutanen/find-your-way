import "server-only";

import { count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import type { ChatGPTUser } from "@/app/chatgpt-auth";

export async function ensureProfile(user: ChatGPTUser) {
  const db = getDb();
  const existing = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).get();
  if (existing) return existing;

  // Private working Sites bootstrap their first account as an admin. Before a
  // public launch this is replaced with an explicit owner allowlist.
  const [{ value }] = await db.select({ value: count() }).from(profiles);
  const role = value === 0 ? "admin" : "user";
  await db.insert(profiles).values({
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    role,
  });
  return (await db.select().from(profiles).where(eq(profiles.userId, user.userId)).get())!;
}

export async function requireAdminProfile(user: ChatGPTUser) {
  const profile = await ensureProfile(user);
  if (profile.role !== "admin") throw new Error("Admin access is required.");
  return profile;
}
