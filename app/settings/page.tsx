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
      <section className="settings-page"><div className="shell settings-shell"><a className="back-link" href="/dashboard"><ArrowLeft size={16} /> Back to dashboard</a><header className="settings-page-heading"><h1>Settings</h1><p>Manage your profile and privacy preferences.</p></header><SettingsForm displayName={profile.displayName} email={profile.email} role={profile.role} anonymousByDefault={profile.anonymousByDefault} /></div></section>
    </main>
  );
}
