import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Bookmark, Building2, ChevronRight, MessageCircle, Settings, ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { SiteHeader } from "@/components/site-header";
import { getDb } from "@/db";
import { conversations, favorites } from "@/db/schema";
import { requireCurrentUser } from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";
import { resources } from "@/lib/resource-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireCurrentUser("/dashboard");
  const profile = await ensureProfile(user);
  const db = getDb();
  const savedIds = await db.select().from(favorites).where(eq(favorites.userId, user.userId));
  const saved = resources.filter((item) => savedIds.some((row) => row.listingId === item.id));
  const threads = await db.select().from(conversations).where(eq(conversations.userId, user.userId)).orderBy(desc(conversations.lastMessageAt)).limit(6);
  return (
    <main>
      <SiteHeader user={user} />
      <section className="dashboard-hero"><div className="shell"><span className="eyebrow">My space</span><h1>Welcome back, {user.fullName?.split(" ")[0] ?? "there"}.</h1><p>Your saved resources, conversations and organization work live here.</p></div></section>
      <section className="section-space pt-8">
        <div className="shell dashboard-grid">
          <aside className="dashboard-nav">
            <Link className="active" href="/dashboard"><Bookmark size={17} /> Overview</Link>
            <Link href="/shelter"><Building2 size={17} /> Organization workspace</Link>
            {profile.role === "admin" && <Link href="/admin"><ShieldCheck size={17} /> Admin review</Link>}
            <button><Settings size={17} /> Settings</button>
            <LogoutButton />
          </aside>
          <div className="dashboard-content">
            <div className="metric-grid"><div><Bookmark size={18} /><strong>{saved.length}</strong><span>Saved resources</span></div><div><MessageCircle size={18} /><strong>{threads.length}</strong><span>Conversations</span></div><div><Building2 size={18} /><strong>{profile.role === "user" ? "—" : "1"}</strong><span>Organizations</span></div></div>
            <section className="dashboard-section"><div className="dashboard-section-heading"><div><span className="eyebrow">Saved</span><h2>Your resources</h2></div><Link href="/#directory">Browse more</Link></div>{saved.length ? <div className="saved-list">{saved.map((item) => <Link key={item.id} href={`/resources/${item.slug}`}><div><strong>{item.name}</strong><span>{item.category} · {item.city}</span></div><ChevronRight size={17} /></Link>)}</div> : <div className="soft-empty"><Bookmark size={21} /><div><strong>No saved resources yet</strong><p>Use the heart button in the directory to keep useful options close.</p></div></div>}</section>
            <section className="dashboard-section"><div className="dashboard-section-heading"><div><span className="eyebrow">Messages</span><h2>Recent conversations</h2></div></div>{threads.length ? <div className="saved-list">{threads.map((thread) => <div className="conversation-row" key={thread.id}><div><strong>{thread.listingName}</strong><span>{thread.anonymous ? "Anonymous conversation" : "Named conversation"} · {thread.status}</span></div><span className="status-pill">{thread.channel.replace("_", " ")}</span></div>)}</div> : <div className="soft-empty"><MessageCircle size={21} /><div><strong>No conversations yet</strong><p>You can contact an organization privately from any resource page.</p></div></div>}</section>
          </div>
        </div>
      </section>
    </main>
  );
}
