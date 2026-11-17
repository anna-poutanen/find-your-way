"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

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
        accountType: form.get("accountType"),
        anonymousByDefault: form.get("anonymousByDefault") === "on",
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    setStatus(response.ok ? "Your settings have been saved." : result.error ?? "We couldn’t save your settings. Please try again.");
  }

  return (
    <form className="form-card settings-card" onSubmit={submit}>
      <div className="form-card-heading">
        <div><h2>Profile</h2><p>Update your name, account type and messaging preference.</p></div>
      </div>
      <div className="form-grid">
        <label><span>Your name</span><input name="displayName" defaultValue={displayName} minLength={2} maxLength={80} required /></label>
        <label><span>Email address</span><input value={email} type="email" readOnly aria-readonly="true" /></label>
        <label className="md:col-span-2">
          <span>Account type</span>
          {role === "admin" ? (
            <input value="Administrator" readOnly aria-readonly="true" />
          ) : (
            <select name="accountType" defaultValue={role}>
              <option value="user">Someone looking for support</option>
              <option value="shelter">Shelter or service provider</option>
            </select>
          )}
          <small className="field-note">{role === "admin" ? "Administrator access is managed separately." : "Shelter accounts can submit and manage organization listings."}</small>
        </label>
      </div>
      <label className="anonymous-control settings-anonymous">
        <input name="anonymousByDefault" type="checkbox" defaultChecked={anonymousByDefault} />
        <span><strong>Start new messages anonymously</strong><small>You can still change this option before sending each message.</small></span>
      </label>
      <div className="form-actions">
        <p><CheckCircle2 size={16} /> Your email address stays the same.</p>
        <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save settings"}</button>
      </div>
      {status && <p className="form-status" role="status">{status}</p>}
    </form>
  );
}
