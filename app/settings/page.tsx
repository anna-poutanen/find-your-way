import { ArrowLeft } from "lucide-react";
import { SettingsForm } from "@/components/settings-form";
import { SiteHeader } from "@/components/site-header";
import { requireCurrentUser } from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireCurrentUser("/settings");
  const profile = await ensureProfile(user);
  return (
    <main>
      <SiteHeader user={user} />
      <section className="dashboard-hero"><div className="shell"><a className="back-link" href="/dashboard"><ArrowLeft size={16} /> Back to dashboard</a><span className="eyebrow settings-eyebrow">Settings</span><h1>Make your account work for you.</h1><p>Manage your profile and default privacy preference.</p></div></section>
      <section className="section-space pt-8"><div className="shell settings-shell"><SettingsForm displayName={profile.displayName} email={profile.email} role={profile.role} anonymousByDefault={profile.anonymousByDefault} /></div></section>
    </main>
  );
}
