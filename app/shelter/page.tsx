import { Building2, CheckCircle2, MessageCircle, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SubmissionForm } from "@/components/submission-form";
import { requireCurrentUser } from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function ShelterPage() {
  const user = await requireCurrentUser("/shelter");
  await ensureProfile(user);
  return (
    <main>
      <SiteHeader user={user} />
      <section className="page-hero organization-hero"><div className="shell"><span className="eyebrow">Organization workspace</span><h1>Keep your services easy to find.</h1><p>Submit a new organization, claim an existing listing and collaborate with staff. All public changes are reviewed before publication.</p><div className="mini-feature-row"><span><Building2 size={18} /> One organization, many programs</span><span><Users size={18} /> Multiple staff accounts</span><span><MessageCircle size={18} /> In-app and email messages</span><span><CheckCircle2 size={18} /> Admin-verified changes</span></div></div></section>
      <section className="section-space pt-10"><div className="shell workspace-grid"><div><SubmissionForm /></div><aside className="side-card"><span className="eyebrow">Already listed?</span><h2>Claim your profile</h2><p>We’ll verify your relationship to the organization before granting edit and message access.</p><button className="secondary-button w-full justify-center">Start a listing claim</button><hr /><h3>What happens next</h3><ol><li><span>1</span>Submit your work email and role.</li><li><span>2</span>An admin verifies the request.</li><li><span>3</span>Invite staff and propose updates.</li></ol></aside></div></section>
    </main>
  );
}
