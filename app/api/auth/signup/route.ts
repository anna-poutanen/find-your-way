import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { authAccounts, profiles } from "@/db/schema";
import { createSalt, createSession, isSameOrigin, normalizeEmail, passwordDigest, safeReturnPath, setSessionCookie, validPassword } from "@/lib/auth";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const input = await request.json() as { displayName?: string; email?: string; password?: string; accountType?: string; returnTo?: string };
  const displayName = input.displayName?.trim() ?? "";
  const email = normalizeEmail(input.email ?? "");
  const password = input.password ?? "";
  const accountType = input.accountType === "shelter" ? "shelter" : "user";
  if (displayName.length < 2 || displayName.length > 80) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!validPassword(password)) return NextResponse.json({ error: "Use at least 10 characters with a letter and a number." }, { status: 400 });

  const db = getDb();
  if (await db.select({ userId: authAccounts.userId }).from(authAccounts).where(eq(authAccounts.email, email)).get()) {
    return NextResponse.json({ error: "An account already exists for that email." }, { status: 409 });
  }

  // Preserve an existing administrator profile during the move away from the
  // hosting provider's identity headers. New visitors can never select admin.
  const existingProfile = await db.select().from(profiles).where(eq(profiles.email, email)).get();
  const userId = existingProfile?.userId ?? crypto.randomUUID();
  const role = existingProfile?.role === "admin" ? "admin" : accountType;
  const salt = createSalt();
  const passwordHash = await passwordDigest(password, salt);

  if (existingProfile) {
    await db.update(profiles).set({ displayName, email, updatedAt: new Date().toISOString() }).where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({ userId, email, displayName, role });
  }
  await db.insert(authAccounts).values({ userId, email, passwordHash, passwordSalt: salt });
  const token = await createSession(userId);
  const response = NextResponse.json({ ok: true, redirectTo: safeReturnPath(input.returnTo) });
  setSessionCookie(response, token);
  return response;
}
