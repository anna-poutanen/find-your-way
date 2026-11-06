import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { authAccounts } from "@/db/schema";
import { constantTimeEqual, createSession, isSameOrigin, normalizeEmail, passwordDigest, safeReturnPath, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const input = await request.json() as { email?: string; password?: string; returnTo?: string };
  const email = normalizeEmail(input.email ?? "");
  const account = await getDb().select().from(authAccounts).where(eq(authAccounts.email, email)).get();
  if (!account) return NextResponse.json({ error: "The email or password is incorrect." }, { status: 401 });
  const candidate = await passwordDigest(input.password ?? "", account.passwordSalt, account.hashIterations);
  if (!constantTimeEqual(candidate, account.passwordHash)) return NextResponse.json({ error: "The email or password is incorrect." }, { status: 401 });
  const token = await createSession(account.userId);
  const response = NextResponse.json({ ok: true, redirectTo: safeReturnPath(input.returnTo) });
  setSessionCookie(response, token);
  return response;
}
