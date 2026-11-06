import { env } from "cloudflare:workers";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { getDb } from "@/db";
import { importJobs } from "@/db/schema";
import { requireAdminProfile } from "@/lib/profile";

const allowedExtensions = new Set(["csv", "xlsx", "xls", "pdf"]);

function parseCsv(text: string) {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]; const next = text[index + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") index += 1; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); return rows;
}

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
  let preview: string[][] = []; let detectedRows = 0;
  if (extension === "csv") { preview = parseCsv(new TextDecoder().decode(bytes)); detectedRows = Math.max(0, preview.length - 1); }
  const status = extension === "csv" ? "needs_review" : "uploaded";
  await getDb().insert(importJobs).values({ id, uploadedBy: user.userId, fileName: file.name, fileType: extension, objectKey, status, detectedRows, previewJson: JSON.stringify(preview.slice(0, 10)) });
  return Response.json({ job: { id, fileName: file.name, status, detectedRows, preview: preview.slice(0, 6) } });
}
