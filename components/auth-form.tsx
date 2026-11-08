"use client";

import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

type AuthMode = "login" | "signup";

export function AuthForm({ mode, returnTo }: { mode: AuthMode; returnTo: string }) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(form.entries()), returnTo }),
    });
    const result = await response.json().catch(() => ({}));
    setSending(false);
    if (response.ok) {
      window.location.assign(result.redirectTo ?? returnTo);
      return;
    }
    setStatus(result.error ?? "We couldn’t complete that request. Please try again.");
  }

  const signup = mode === "signup";
  return (
    <form className="auth-card" onSubmit={submit}>
      <span className="auth-lock"><LockKeyhole size={20} /></span>
      <span className="eyebrow">{signup ? "Create your account" : "Welcome back"}</span>
      <h1>{signup ? "Keep support close." : "Sign in to Find Your Way."}</h1>
      <p>{signup ? "Save resources, contact organizations privately, and manage shelter information." : "Access your saved resources, conversations, and organization workspace."}</p>

      {signup && <label><span>Your name</span><input name="displayName" autoComplete="name" minLength={2} maxLength={80} required /></label>}
      <label><span>Email address</span><input name="email" type="email" autoComplete="email" required /></label>
      <label><span>Password</span><input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={10} required /></label>
      {signup && <small className="password-hint">Use at least 10 characters, including a letter and a number.</small>}

      {signup && (
        <fieldset>
          <legend>I’m creating an account as</legend>
          <label className="account-choice"><input type="radio" name="accountType" value="user" defaultChecked /><span><strong>Someone looking for support</strong><small>Save resources and message organizations.</small></span></label>
          <label className="account-choice"><input type="radio" name="accountType" value="shelter" /><span><strong>A shelter or service provider</strong><small>Submit and manage organization information.</small></span></label>
        </fieldset>
      )}

      <button type="submit" className="primary-button w-full justify-center" disabled={sending}>
        {sending ? "Please wait…" : signup ? "Create account" : "Sign in"} <ArrowRight size={16} />
      </button>
      {status && <p className="form-status error" role="alert">{status}</p>}
      <p className="auth-switch">
        {signup ? "Already have an account?" : "New to Find Your Way?"}{" "}
        <a href={`${signup ? "/login" : "/signup"}?return_to=${encodeURIComponent(returnTo)}`}>{signup ? "Sign in" : "Create an account"}</a>
      </p>
      <p className="auth-privacy">Your Find Your Way account is independent of ChatGPT and is only used for this service.</p>
    </form>
  );
}
