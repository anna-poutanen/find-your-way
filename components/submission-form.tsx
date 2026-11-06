"use client";

import { useState } from "react";
import { Building2, CheckCircle2 } from "lucide-react";

export function SubmissionForm() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSending(true);
    setStatus("");
    const form = new FormData(formElement);
    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    setSending(false);
    if (response.ok) {
      formElement.reset();
      setStatus("Submitted for admin review. We’ll keep the current directory unchanged until it is approved.");
    } else {
      const data = await response.json().catch(() => ({}));
      setStatus(data.error ?? "Something went wrong. Please review the form and try again.");
    }
  }

  return (
    <form onSubmit={submit} className="form-card">
      <div className="form-card-heading">
        <span className="feature-icon"><Building2 size={21} /></span>
        <div><h2>Add an organization</h2><p>Create a new listing or submit a program that is missing from the directory.</p></div>
      </div>
      <div className="form-grid">
        <label><span>Organization name</span><input name="name" required /></label>
        <label><span>Resource type</span><select name="category" required defaultValue=""><option value="" disabled>Select one</option><option>Emergency shelter</option><option>Youth housing</option><option>Women's housing</option><option>Community support</option></select></label>
        <label><span>City or service area</span><input name="city" required /></label>
        <label><span>Public contact email</span><input name="email" type="email" required /></label>
        <label><span>Phone</span><input name="phone" /></label>
        <label><span>Website</span><input name="website" type="url" placeholder="https://" /></label>
        <label className="md:col-span-2"><span>Address or locations</span><input name="address" /></label>
        <label className="md:col-span-2"><span>Short description</span><textarea name="summary" required minLength={20} maxLength={600} /></label>
        <label className="md:col-span-2"><span>Eligibility, hours and services</span><textarea name="details" required minLength={20} maxLength={3000} /></label>
      </div>
      <div className="form-actions">
        <p><CheckCircle2 size={16} /> An admin will verify this information before it appears publicly.</p>
        <button type="submit" className="primary-button" disabled={sending}>{sending ? "Submitting…" : "Submit for review"}</button>
      </div>
      {status && <p className="form-status" role="status">{status}</p>}
    </form>
  );
}
