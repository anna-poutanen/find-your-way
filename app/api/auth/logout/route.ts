import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { authSessions } from "@/db/schema";
import { clearSessionCookie, hashSessionToken, isSameOrigin, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const token = cookie?.slice(SESSION_COOKIE.length + 1);
  if (token) await getDb().delete(authSessions).where(eq(authSessions.tokenHash, await hashSessionToken(decodeURIComponent(token))));
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
