import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Clock3, ExternalLink, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MessageComposer } from "@/components/message-composer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { resources } from "@/lib/resource-data";
import { getResourceBySlug } from "@/lib/resources-server";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return resources.map((item) => ({ slug: item.slug })); }

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const resource = await getResourceBySlug(slug); if (!resource) notFound(); const user = await getCurrentUser();
  return <main><SiteHeader user={user} /><section className="detail-hero"><div className="shell"><Link href="/#directory" className="back-link"><ArrowLeft size={16} /> Back to directory</Link><div className="detail-title-row"><div><span className="resource-type">{resource.category}</span><h1>{resource.name}</h1><p>{resource.summary}</p></div><span className="verified-badge"><BadgeCheck size={17} /> Reviewed {resource.verified}</span></div></div></section><section className="section-space pt-8"><div className="shell detail-grid"><div><div className="contact-panel"><div><MapPin size={19} /><span><small>Location</small><strong>{resource.address}</strong></span></div><div><Phone size={19} /><span><small>Phone</small><a href={`tel:${resource.phone}`}>{resource.phone}</a></span></div>{resource.email && <div><Mail size={19} /><span><small>Email</small><a href={`mailto:${resource.email}`}>{resource.email}</a></span></div>}<div><Clock3 size={19} /><span><small>Hours</small><strong>{resource.hours}</strong></span></div></div><div className="tag-list large">{resource.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="prose-section"><span className="eyebrow">About</span><h2>What to expect</h2><p>{resource.description}</p></div><div className="prose-section"><span className="eyebrow">Eligibility</span><h2>Who this is for</h2><p>{resource.eligibility}</p></div><div className="prose-section"><span className="eyebrow">Programs & services</span><h2>Available support</h2><ul>{resource.programs.map((program) => <li key={program}><ShieldCheck size={17} /> {program}</li>)}</ul></div><div className="accuracy-note"><BadgeCheck size={18} /><p><strong>Help keep this accurate.</strong> Program details change. Confirm availability before visiting, or tell us if something needs an update.</p><button>Report an update <ExternalLink size={14} /></button></div></div><aside><MessageComposer listingId={resource.id} listingName={resource.name} signedIn={Boolean(user)} /></aside></div></section><SiteFooter /></main>;
}
