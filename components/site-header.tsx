import { Compass, UserRound } from "lucide-react";
import Link from "next/link";
import type { AppUser } from "@/lib/auth";

export function SiteHeader({ user }: { user: AppUser | null }) {
  return (
    <header className="site-header">
      <div className="shell flex h-[76px] items-center justify-between gap-5">
        <Link href="/" prefetch={false} className="brand" aria-label="Find Your Way home">
          <span className="brand-mark"><Compass size={21} strokeWidth={2.2} /></span>
          <span>
            <strong>Find Your Way</strong>
            <small>by Hearts Against Homelessness</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <Link className="nav-link" href="/#directory" prefetch={false}>Find support</Link>
          <Link className="nav-link" href="/about" prefetch={false}>About</Link>
          <Link className="nav-link" href="/shelter" prefetch={false}>For organizations</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" prefetch={false} className="account-pill">
              <span className="account-avatar"><UserRound size={15} /></span>
              <span className="hidden sm:inline">My space</span>
            </Link>
          ) : (
            <Link href="/login?return_to=%2Fdashboard" prefetch={false} className="account-pill">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
