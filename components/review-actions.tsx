"use client";

import { useState } from "react";

export function ReviewActions({ revisionId }: { revisionId: string }) {
  const [status, setStatus] = useState("");

  async function review(action: "approve" | "reject" | "changes_requested") {
    const response = await fetch("/api/admin/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ revisionId, action }),
    });
    setStatus(response.ok ? `Marked ${action.replace("_", " ")}.` : "The review could not be saved.");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button className="small-button approve" onClick={() => review("approve")}>Approve</button>
        <button className="small-button" onClick={() => review("changes_requested")}>Request changes</button>
        <button className="small-button danger" onClick={() => review("reject")}>Reject</button>
      </div>
      {status && <p className="mt-2 text-xs text-[var(--muted-foreground)]" role="status">{status}</p>}
    </div>
  );
}
