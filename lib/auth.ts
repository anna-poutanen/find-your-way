import "server-only";

import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";
import { getDb } from "@/db";
import { authSessions, profiles } from "@/db/schema";

export type AppUser = {
  userId: string;
  email: string;
  displayName: string;
  fullName: string | null;
  role: "user" | "shelter" | "admin";
};

export const SESSION_COOKIE = "fyw_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const PASSWORD_ITERATIONS = 310000;

export async function getCurrentUser(): Promise<AppUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = await sha256(token);
  const now = new Date().toISOString();
  const row = await getDb()
    .select({
      userId: profiles.userId,
      email: profiles.email,
      displayName: profiles.displayName,
      role: profiles.role,
    })
    .from(authSessions)
    .innerJoin(profiles, eq(authSessions.userId, profiles.userId))
    .where(and(eq(authSessions.tokenHash, tokenHash), gt(authSessions.expiresAt, now)))
    .get();

  if (!row) return null;
  return {
    userId: row.userId,
    email: row.email,
    displayName: row.displayName,
    fullName: row.displayName,
    role: row.role,
  };
}

export async function requireCurrentUser(returnTo: string): Promise<AppUser> {
  const user = await getCurrentUser();
  if (user) return user;
  redirect(loginPath(returnTo));
}

export function loginPath(returnTo = "/dashboard") {
  return `/login?return_to=${encodeURIComponent(safeReturnPath(returnTo))}`;
}

export function safeReturnPath(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  try {
    const url = new URL(value, "https://app.local");
    if (url.origin !== "https://app.local" || ["/login", "/signup"].includes(url.pathname)) return "/dashboard";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validPassword(value: string) {
  return value.length >= 10 && /[a-z]/i.test(value) && /\d/.test(value);
}

export async function passwordDigest(password: string, salt: string, iterations = PASSWORD_ITERATIONS) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromBase64Url(salt), iterations },
    key,
    256,
  );
  return toBase64Url(new Uint8Array(bits));
}

export function createSalt() {
  return randomToken(16);
}

export function createSessionToken() {
  return randomToken(32);
}

export async function createSession(userId: string) {
  const token = createSessionToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  await getDb().insert(authSessions).values({ tokenHash, userId, expiresAt });
  return token;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function hashSessionToken(token: string) {
  return sha256(token);
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}

export function constantTimeEqual(left: string, right: string) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  let result = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) result |= (a[index] ?? 0) ^ (b[index] ?? 0);
  return result === 0;
}

function randomToken(length: number) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
