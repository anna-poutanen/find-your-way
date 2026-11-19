"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

type ThreadMessage = { id: string; body: string; senderKind: string; createdAt: string; deliveryStatus: string };

export function ConversationThread({ conversationId, messages, viewerKind }: { conversationId: string; messages: ThreadMessage[]; viewerKind: "user" | "organization" }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSending(true); setStatus("");
    const response = await fetch(`/api/messages/${conversationId}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body }) });
    const result = await response.json().catch(() => ({})); setSending(false);
    if (!response.ok) { setStatus(result.error ?? "The reply could not be sent."); return; }
    setBody("");
    setStatus(result.emailStatus === "sent"
      ? "Reply sent in the app and by email."
      : result.emailStatus === "configuration_required"
        ? "Reply sent in the app. Email notifications are not configured yet."
        : result.emailStatus === "failed"
          ? "Reply sent in the app, but the email notification failed."
          : "Reply sent in the app.");
    router.refresh();
  }

  return <div className="thread-layout">
    <div className="message-list" aria-live="polite">
      {messages.map((message) => {
        const mine = viewerKind === "user" ? message.senderKind === "user" : message.senderKind !== "user";
        return <article key={message.id} className={mine ? "thread-message mine" : "thread-message"}>
          <div><strong>{mine ? "You" : message.senderKind === "user" ? "Person seeking support" : "Organization"}</strong><time>{new Date(message.createdAt).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}</time></div>
          <p>{message.body}</p>
          <small>{message.deliveryStatus === "sent" ? "Email notification sent" : message.deliveryStatus === "failed" ? "In app · email delivery failed" : "Available in app"}</small>
        </article>;
      })}
    </div>
    <form className="reply-card" onSubmit={submit}>
      <label htmlFor="reply"><span>Your reply</span><textarea id="reply" value={body} onChange={(event) => setBody(event.target.value)} minLength={2} maxLength={3000} required /></label>
      <button className="primary-button" type="submit" disabled={sending}>{sending ? "Sending…" : "Send reply"} <Send size={16} /></button>
      {status && <p className="form-status" role="status">{status}</p>}
    </form>
  </div>;
}
