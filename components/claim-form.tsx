"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";

export function ClaimForm({ listings }: { listings: { id: string; name: string; city: string }[] }) {
  const [status, setStatus] = useState(""); const [sending, setSending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); setSending(true); setStatus("");
    const response = await fetch("/api/claims", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
    const result = await response.json().catch(() => ({})); setSending(false);
    if (response.ok) { formElement.reset(); setStatus("Claim submitted. An administrator will verify your relationship to the organization."); }
    else setStatus(result.error ?? "The claim could not be submitted.");
  }
  return <form className="form-card" onSubmit={submit}>
    <div className="form-card-heading"><span className="feature-icon"><BadgeCheck size={21} /></span><div><h2>Claim an existing listing</h2><p>Request verified access to maintain an organization that is already in the directory.</p></div></div>
    <div className="form-grid">
      <label className="md:col-span-2"><span>Directory listing</span><select name="listingId" required defaultValue=""><option value="" disabled>Select an organization</option>{listings.map((listing) => <option key={listing.id} value={listing.id}>{listing.name} · {listing.city}</option>)}</select></label>
      <label><span>Your work email</span><input name="workEmail" type="email" required /></label>
      <label><span>Your role</span><input name="roleTitle" required placeholder="Program manager, director…" /></label>
      <label className="md:col-span-2"><span>Verification note</span><textarea name="note" maxLength={1000} placeholder="Tell the administrator how you are connected to this organization." /></label>
    </div>
    <div className="form-actions"><p>Approval connects this listing to your organization workspace.</p><button className="primary-button" type="submit" disabled={sending}>{sending ? "Submitting…" : "Submit claim"}</button></div>
    {status && <p className="form-status" role="status">{status}</p>}
  </form>;
}
