import Link from "next/link";
import { Compass, UserRound } from "lucide-react";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { chatGPTSignInPath } from "@/app/chatgpt-auth";

export function SiteHeader({ user }: { user: ChatGPTUser | null }) {
  return (
    <header className="site-header">
      <div className="shell flex h-[76px] items-center justify-between gap-5">
        <Link href="/" className="brand" aria-label="Find Your Way home">
          <span className="brand-mark"><Compass size={21} strokeWidth={2.2} /></span>
          <span>
            <strong>Find Your Way</strong>
            <small>by Hearts Against Homelessness</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <Link className="nav-link" href="/#directory">Find support</Link>
          <Link className="nav-link" href="/about">About</Link>
          <Link className="nav-link" href="/shelter">For organizations</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="account-pill">
              <span className="account-avatar"><UserRound size={15} /></span>
              <span className="hidden sm:inline">My space</span>
            </Link>
          ) : (
            <a href={chatGPTSignInPath("/dashboard")} target="_top" className="account-pill">
              Sign in
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
