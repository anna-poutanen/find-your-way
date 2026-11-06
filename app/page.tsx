import Link from "next/link";
import { ArrowDown, ArrowRight, BadgeCheck, HeartHandshake, MapPinned, MessageCircleMore, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ResourceExplorer } from "@/components/resource-explorer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAllResources } from "@/lib/resources-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const resources = await getAllResources();
  return (
    <main>
      <SiteHeader user={user} />
      <section className="hero-section">
        <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="hero-kicker"><span /> Youth-built · BC-wide</span>
            <h1>A clearer path to <em>somewhere safe.</em></h1>
            <p>Find shelters, housing programs and practical support across British Columbia—without having to know exactly what to ask for.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#directory">Find support <ArrowDown size={17} /></a>
              <Link className="secondary-button" href="/shelter">Add your organization <ArrowRight size={17} /></Link>
            </div>
            <div className="trust-row"><span><BadgeCheck size={16} /> Reviewed information</span><span><ShieldCheck size={16} /> Private messaging</span></div>
          </div>
          <div className="hero-compass" aria-label="Ways to find support">
            <div className="compass-card main-card">
              <span className="compass-label">Start here</span><h2>What do you need tonight?</h2>
              <div className="need-list">
                <a href="#directory"><span className="need-icon coral"><HeartHandshake size={19} /></span><span><strong>A safe place to stay</strong><small>Emergency and youth shelters</small></span><ArrowRight size={17} /></a>
                <a href="#directory"><span className="need-icon teal"><MapPinned size={19} /></span><span><strong>Longer-term housing</strong><small>Transition and supportive programs</small></span><ArrowRight size={17} /></a>
                <a href="#directory"><span className="need-icon gold"><MessageCircleMore size={19} /></span><span><strong>Someone to talk to</strong><small>Community and crisis support</small></span><ArrowRight size={17} /></a>
              </div>
            </div>
            <div className="floating-note note-one"><strong>Open now</strong><span>24/7 options are clearly marked</span></div>
            <div className="floating-note note-two"><ShieldCheck size={18} /><span>Choose to stay anonymous</span></div>
          </div>
        </div>
      </section>
      <section className="crisis-strip"><div className="shell crisis-inner"><span className="crisis-dot" /><strong>In immediate danger?</strong><span>Call <a href="tel:911">9-1-1</a></span><span>BC services <a href="tel:211">2-1-1</a></span><span>Suicide & crisis <a href="tel:988">9-8-8</a></span></div></section>
      <ResourceExplorer items={resources} signedIn={Boolean(user)} />
      <section className="section-space pt-4"><div className="shell"><div className="how-panel"><div><span className="eyebrow light">Built around trust</span><h2>Information that improves instead of going stale.</h2><p>Shelters can claim and maintain their own profiles. Every public change stays in review until an administrator approves it.</p><Link href="/shelter" className="light-link">For shelters and organizations <ArrowRight size={16} /></Link></div><ol><li><span>01</span><div><strong>Organizations submit</strong><small>Add a new program or propose an update.</small></div></li><li><span>02</span><div><strong>Admins verify</strong><small>Sources and contact details are checked.</small></div></li><li><span>03</span><div><strong>People find support</strong><small>Search, save and message with confidence.</small></div></li></ol></div></div></section>
      <SiteFooter />
    </main>
  );
}
