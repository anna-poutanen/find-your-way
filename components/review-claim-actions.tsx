"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewClaimActions({ claimId }: { claimId: string }) {
  const router = useRouter(); const [status, setStatus] = useState(""); const [saving, setSaving] = useState(false);
  async function review(action: "approve" | "reject" | "changes_requested") {
    setSaving(true); setStatus("");
    const response = await fetch("/api/admin/claims", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ claimId, action }) });
    const result = await response.json().catch(() => ({})); setSaving(false);
    if (response.ok) { router.refresh(); return; }
    setStatus(result.error ?? "The claim review could not be saved.");
  }
  return <div><div className="flex flex-wrap gap-2"><button disabled={saving} className="small-button approve" onClick={() => review("approve")}>Approve</button><button disabled={saving} className="small-button" onClick={() => review("changes_requested")}>Request changes</button><button disabled={saving} className="small-button danger" onClick={() => review("reject")}>Reject</button></div>{status && <p className="form-status error" role="status">{status}</p>}</div>;
}
