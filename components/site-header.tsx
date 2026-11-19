/* eslint-disable @next/next/no-html-link-for-pages */
import { Compass, Menu, UserRound } from "lucide-react";
import type { AppUser } from "@/lib/auth";

export function SiteHeader({ user }: { user: AppUser | null }) {
  return (
    <header className="site-header">
      <div className="shell flex h-[76px] items-center justify-between gap-5">
        <a href="/" className="brand" aria-label="Find Your Way home">
          <span className="brand-mark"><Compass size={21} strokeWidth={2.2} /></span>
          <span>
            <strong>Find Your Way</strong>
            <small>by Hearts Against Homelessness</small>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <a className="nav-link" href="/#directory">Find support</a>
          <a className="nav-link" href="/about">About</a>
          <a className="nav-link" href="/shelter">For organizations</a>
        </nav>

        <details className="mobile-nav md:hidden">
          <summary aria-label="Open main menu"><Menu size={19} /><span className="sr-only">Menu</span></summary>
          <nav aria-label="Mobile navigation">
            <a href="/#directory">Find support</a>
            <a href="/about">About</a>
            <a href="/shelter">For organizations</a>
          </nav>
        </details>

        <div className="flex items-center gap-2">
          {user ? (
            <a href="/dashboard" className="account-pill">
              <span className="account-avatar"><UserRound size={15} /></span>
              <span className="hidden sm:inline">My space</span>
            </a>
          ) : (
            <a href="/login?return_to=%2Fdashboard" className="account-pill">
              Sign in
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
