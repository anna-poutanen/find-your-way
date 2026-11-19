import { and, eq } from "drizzle-orm";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { getDb } from "@/db";
import { organizationClaims } from "@/db/schema";
import { requireShelterProfile } from "@/lib/profile";
import { getOrganizationIdForListing, getResourceById } from "@/lib/resources-server";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  try { await requireShelterProfile(user); } catch { return Response.json({ error: "Choose a shelter or service-provider account in settings first." }, { status: 403 }); }
  const input = await request.json() as { listingId?: string; workEmail?: string; roleTitle?: string; note?: string };
  const workEmail = input.workEmail?.trim().toLowerCase() ?? ""; const roleTitle = input.roleTitle?.trim() ?? ""; const note = input.note?.trim() ?? "";
  if (!input.listingId || !/^\S+@\S+\.\S+$/.test(workEmail) || roleTitle.length < 2) return Response.json({ error: "Choose a listing and enter your work email and role." }, { status: 400 });
  const resource = await getResourceById(input.listingId); if (!resource) return Response.json({ error: "That listing could not be found." }, { status: 404 });
  if (await getOrganizationIdForListing(resource.id)) return Response.json({ error: "That listing is already connected to an organization. Contact an administrator for access." }, { status: 409 });
  const db = getDb();
  const existing = await db.select().from(organizationClaims).where(and(eq(organizationClaims.listingId, resource.id), eq(organizationClaims.status, "pending"))).get();
  if (existing) return Response.json({ error: "A claim for this listing is already under review." }, { status: 409 });
  await db.insert(organizationClaims).values({ id: crypto.randomUUID(), listingId: resource.id, listingName: resource.name, submittedBy: user.userId, workEmail, roleTitle: roleTitle.slice(0, 120), note: note.slice(0, 1000) || null });
  return Response.json({ ok: true });
}
