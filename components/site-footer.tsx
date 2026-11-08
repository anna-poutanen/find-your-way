import { ArrowUpRight, Compass } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell grid gap-10 py-12 md:grid-cols-[1.2fr_.8fr_.8fr]">
        <div>
          <div className="flex items-center gap-3 text-white">
            <span className="footer-mark"><Compass size={20} /></span>
            <strong className="text-lg">Find Your Way</strong>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
            A youth-led directory helping people across British Columbia find shelter, housing and support with less friction.
          </p>
        </div>
        <div>
          <p className="footer-label">Explore</p>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            <a href="/#directory">Find support</a>
            <a href="/shelter">Add an organization</a>
            <a href="/about">About this project</a>
          </div>
        </div>
        <div>
          <p className="footer-label">Need help now?</p>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            <a href="tel:911">Emergency · 9-1-1 <ArrowUpRight size={14} /></a>
            <a href="tel:211">BC services · 2-1-1 <ArrowUpRight size={14} /></a>
            <a href="tel:988">Suicide & crisis · 9-8-8 <ArrowUpRight size={14} /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/45">
        Information changes. Always verify details directly with the organization before visiting.
      </div>
    </footer>
  );
}
