import "server-only";

import { count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import type { AppUser } from "@/lib/auth";

export async function ensureProfile(user: AppUser) {
  const db = getDb();
  const existing = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).get();
  if (existing) return existing;

  const [{ value }] = await db.select({ value: count() }).from(profiles);
  const role = value === 0 ? "user" : user.role;
  await db.insert(profiles).values({
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    role,
  });
  return (await db.select().from(profiles).where(eq(profiles.userId, user.userId)).get())!;
}

export async function requireAdminProfile(user: AppUser) {
  const profile = await ensureProfile(user);
  if (profile.role !== "admin") throw new Error("Admin access is required.");
  return profile;
}
