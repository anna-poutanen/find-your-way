"use client";

import { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";

type SettingsFormProps = {
  displayName: string;
  email: string;
  role: "user" | "shelter" | "admin";
  anonymousByDefault: boolean;
};

export function SettingsForm({ displayName, email, role, anonymousByDefault }: SettingsFormProps) {
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        displayName: form.get("displayName"),
        anonymousByDefault: form.get("anonymousByDefault") === "on",
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    setStatus(response.ok ? "Your settings have been saved." : result.error ?? "We couldn’t save your settings. Please try again.");
  }

  const roleLabel = role === "admin" ? "Administrator" : role === "shelter" ? "Shelter or service provider" : "Someone looking for support";

  return (
    <form className="form-card settings-card" onSubmit={submit}>
      <div className="form-card-heading">
        <span className="feature-icon"><Save size={20} /></span>
        <div><h2>Account settings</h2><p>Update how your account appears and choose your messaging privacy default.</p></div>
      </div>
      <div className="form-grid">
        <label><span>Your name</span><input name="displayName" defaultValue={displayName} minLength={2} maxLength={80} required /></label>
        <label><span>Email address</span><input value={email} type="email" readOnly aria-readonly="true" /></label>
        <label className="md:col-span-2"><span>Account type</span><input value={roleLabel} readOnly aria-readonly="true" /></label>
      </div>
      <label className="anonymous-control settings-anonymous">
        <input name="anonymousByDefault" type="checkbox" defaultChecked={anonymousByDefault} />
        <span><strong>Start new messages anonymously</strong><small>You can still change this option before sending each message.</small></span>
      </label>
      <div className="form-actions">
        <p><CheckCircle2 size={16} /> Your email and account type cannot be changed here.</p>
        <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save settings"}</button>
      </div>
      {status && <p className="form-status" role="status">{status}</p>}
    </form>
  );
}
