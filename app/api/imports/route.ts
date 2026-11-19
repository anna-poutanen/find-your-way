import { env } from "cloudflare:workers";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { getDb } from "@/db";
import { importJobs } from "@/db/schema";
import { listingRevisions } from "@/db/schema";
import { parseImportFile } from "@/lib/import-parsers";
import { requireAdminProfile } from "@/lib/profile";

const allowedExtensions = new Set(["csv", "xlsx", "xls", "pdf"]);

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  try { await requireAdminProfile(user); } catch { return Response.json({ error: "Admin access required" }, { status: 403 }); }
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return Response.json({ error: "Files must be 10 MB or smaller." }, { status: 400 });
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!allowedExtensions.has(extension)) return Response.json({ error: "Use a CSV, XLSX, XLS or PDF file." }, { status: 400 });
  const bytes = await file.arrayBuffer(); const id = crypto.randomUUID(); const objectKey = `imports/${id}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  if (env.BUCKET) await env.BUCKET.put(objectKey, bytes, { httpMetadata: { contentType: file.type || "application/octet-stream" } });
  try {
    const parsed = await parseImportFile(bytes, extension, file.name); const detectedRows = parsed.candidates.length; const status = detectedRows ? "needs_review" : "failed";
    const db = getDb();
    await db.insert(importJobs).values({ id, uploadedBy: user.userId, fileName: file.name, fileType: extension, objectKey, status, detectedRows, previewJson: JSON.stringify(parsed.rows.slice(0, 10)), errorMessage: detectedRows ? null : "No structured shelter records could be detected." });
    for (const candidate of parsed.candidates) await db.insert(listingRevisions).values({ id: crypto.randomUUID(), submittedBy: user.userId, payloadJson: JSON.stringify(candidate), status: "pending" });
    return Response.json({ job: { id, fileName: file.name, status, detectedRows, preview: parsed.rows.slice(0, 6), candidateCount: detectedRows } });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "The file could not be extracted.";
    await getDb().insert(importJobs).values({ id, uploadedBy: user.userId, fileName: file.name, fileType: extension, objectKey, status: "failed", detectedRows: 0, errorMessage: message });
    return Response.json({ error: `The file was uploaded, but extraction failed: ${message}` }, { status: 422 });
  }
}
