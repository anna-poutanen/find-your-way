import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { listings } from "@/db/schema";
import { getResource, resources, type Resource, type ResourceCategory } from "@/lib/resource-data";

function toResource(row: typeof listings.$inferSelect): Resource {
  let tags: string[] = [];
  try { tags = JSON.parse(row.servicesJson) as string[]; } catch { tags = []; }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as ResourceCategory,
    city: row.city ?? "British Columbia",
    address: row.address ?? row.city ?? "Contact the organization",
    phone: row.phone ?? "Contact online",
    email: row.email ?? undefined,
    hours: row.hours ?? "Contact for current hours",
    summary: row.summary,
    description: row.description ?? row.summary,
    eligibility: row.eligibility ?? "Contact the organization to confirm eligibility.",
    tags: tags.length ? tags : ["Newly verified"],
    programs: row.description ? [row.description] : [row.summary],
    ageRange: row.ageMin || row.ageMax ? `${row.ageMin ?? 0}–${row.ageMax ?? "+"}` : undefined,
    verified: row.lastVerifiedAt ? new Date(row.lastVerifiedAt).toLocaleDateString("en-CA", { month: "long", year: "numeric" }) : "Recently",
  };
}

export async function getAllResources() {
  const rows = await getDb().select().from(listings).where(eq(listings.status, "published"));
  return [...rows.map(toResource), ...resources];
}

export async function getResourceBySlug(slug: string) {
  const seeded = getResource(slug); if (seeded) return seeded;
  const row = await getDb().select().from(listings).where(eq(listings.slug, slug)).get();
  return row?.status === "published" ? toResource(row) : undefined;
}
