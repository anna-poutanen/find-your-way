"use client";

import { useState } from "react";
import { LockKeyhole, Send } from "lucide-react";

export function MessageComposer({ listingId, listingName, signedIn }: { listingId: string; listingName: string; signedIn: boolean }) {
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!signedIn) {
      window.location.href = `/signin-with-chatgpt?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setSending(true);
    setStatus("");
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listingId, listingName, body, anonymous }),
    });
    setSending(false);
    if (response.ok) {
      setBody("");
      setStatus("Your message has been added to a private conversation.");
    } else {
      const result = await response.json().catch(() => ({}));
      setStatus(result.error ?? "We couldn't send your message. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="message-card">
      <span className="eyebrow">Private message</span>
      <h2>Ask {listingName} a question</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
        Messages are not for emergencies. The organization may reply in the app or through our private email relay.
      </p>
      <label className="mt-6 block text-sm font-semibold" htmlFor="message">Your message</label>
      <textarea id="message" value={body} onChange={(event) => setBody(event.target.value)} minLength={10} maxLength={3000} required placeholder="Share what you need help with. Avoid including highly sensitive information." />
      <label className="anonymous-control">
        <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
        <span><strong>Remain anonymous</strong><small>Your account name and email will not be shared with the organization.</small></span>
      </label>
      <button className="primary-button w-full justify-center" type="submit" disabled={sending}>
        {sending ? "Sending…" : "Send private message"} <Send size={16} />
      </button>
      <div className="mt-4 flex gap-2 text-xs leading-5 text-[var(--muted-foreground)]"><LockKeyhole size={14} className="mt-0.5 shrink-0" /> Your email stays private when anonymous messaging is on.</div>
      {status && <p className="form-status" role="status">{status}</p>}
    </form>
  );
}
