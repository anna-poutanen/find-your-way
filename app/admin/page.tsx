import { desc, eq } from "drizzle-orm";
import { Database, FileCheck2, ShieldCheck } from "lucide-react";
import { ImportPanel } from "@/components/import-panel";
import { ReviewActions } from "@/components/review-actions";
import { SiteHeader } from "@/components/site-header";
import { getDb } from "@/db";
import { importJobs, listingRevisions } from "@/db/schema";
import { requireCurrentUser } from "@/lib/auth";
import { requireAdminProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireCurrentUser("/admin");
  await requireAdminProfile(user);
  const db = getDb();
  const revisions = await db.select().from(listingRevisions).where(eq(listingRevisions.status, "pending")).orderBy(desc(listingRevisions.createdAt)).limit(20);
  const jobs = await db.select().from(importJobs).orderBy(desc(importJobs.createdAt)).limit(8);
  return (
    <main>
      <SiteHeader user={user} />
      <section className="dashboard-hero admin-hero"><div className="shell"><span className="eyebrow"><ShieldCheck size={14} /> Admin workspace</span><h1>Review what enters the directory.</h1><p>Approve shelter submissions, inspect imports and keep an audit trail of every public change.</p></div></section>
      <section className="section-space pt-8"><div className="shell admin-grid"><div><ImportPanel /><section className="dashboard-section mt-7"><div className="dashboard-section-heading"><div><span className="eyebrow">Review queue</span><h2>Pending submissions</h2></div><span className="count-badge">{revisions.length}</span></div>{revisions.length ? <div className="review-list">{revisions.map((revision) => { const payload = JSON.parse(revision.payloadJson) as Record<string,string>; return <article key={revision.id}><div className="review-icon"><FileCheck2 size={19} /></div><div><span className="status-pill">New listing</span><h3>{payload.name}</h3><p>{payload.summary}</p><small>{payload.category} · {payload.city} · {payload.email}</small></div><ReviewActions revisionId={revision.id} /></article>; })}</div> : <div className="soft-empty"><FileCheck2 size={21} /><div><strong>The review queue is clear</strong><p>New shelter submissions and edits will appear here.</p></div></div>}</section></div><aside className="admin-side"><div className="side-card"><span className="feature-icon"><Database size={20} /></span><h2>Recent imports</h2>{jobs.length ? <div className="job-list">{jobs.map((job) => <div key={job.id}><strong>{job.fileName}</strong><span>{job.status.replaceAll("_", " ")} · {job.detectedRows} rows</span></div>)}</div> : <p className="mt-3 text-sm text-[var(--muted-foreground)]">No directory files uploaded yet.</p>}</div><div className="side-card compact"><strong>Approval rule</strong><p>Submissions never overwrite a published listing. Approval creates a new verified version.</p></div></aside></div></section>
    </main>
  );
}
