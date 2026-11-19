"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Users } from "lucide-react";

type WorkspaceOrganization = { id: string; name: string; canManage: boolean; staff: { userId: string; name: string; email: string; role: string }[]; invitations: { id: string; email: string }[] };

export function StaffManager({ organizations }: { organizations: WorkspaceOrganization[] }) {
  const router = useRouter(); const [selected, setSelected] = useState(organizations[0]?.id ?? ""); const [status, setStatus] = useState(""); const [saving, setSaving] = useState(false);
  const organization = organizations.find((item) => item.id === selected) ?? organizations[0];
  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); setSaving(true); setStatus("");
    const response = await fetch("/api/staff", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ organizationId: selected, email: form.get("email") }) });
    const result = await response.json().catch(() => ({})); setSaving(false);
    if (response.ok) { formElement.reset(); setStatus(result.state === "added" ? "Staff access added." : "Invitation saved. Ask them to create an account using that email."); router.refresh(); }
    else setStatus(result.error ?? "Staff access could not be updated.");
  }
  async function remove(payload: { invitationId?: string; memberUserId?: string }) {
    setSaving(true); setStatus(""); const response = await fetch("/api/staff", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ organizationId: selected, ...payload }) });
    const result = await response.json().catch(() => ({})); setSaving(false);
    if (response.ok) router.refresh(); else setStatus(result.error ?? "Staff access could not be updated.");
  }
  if (!organization) return <section className="form-card"><div className="soft-empty"><Users size={21} /><div><strong>Staff access becomes available after an organization claim is approved.</strong><p>You can still submit a new organization or claim an existing listing below.</p></div></div></section>;
  return <section className="form-card" id="staff"><div className="form-card-heading"><span className="feature-icon"><Users size={21} /></span><div><h2>Staff access</h2><p>Add existing account holders or save invitations for colleagues who still need an account.</p></div></div>
    {organizations.length > 1 && <label><span>Organization</span><select value={selected} onChange={(event) => setSelected(event.target.value)}>{organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
    <div className="staff-list">{organization.staff.map((member) => <div key={member.userId}><div><strong>{member.name}</strong><span>{member.email} · {member.role}</span></div>{organization.canManage && member.role !== "owner" && <button type="button" className="text-button" disabled={saving} onClick={() => remove({ memberUserId: member.userId })}>Remove</button>}</div>)}{organization.invitations.map((invitation) => <div key={invitation.id}><div><strong>{invitation.email}</strong><span>Invitation pending</span></div>{organization.canManage && <button type="button" className="text-button" disabled={saving} onClick={() => remove({ invitationId: invitation.id })}>Cancel</button>}</div>)}</div>
    {organization.canManage && <form className="staff-invite" onSubmit={invite}><label><span>Colleague’s email</span><input name="email" type="email" required /></label><button className="secondary-button" type="submit" disabled={saving}><UserPlus size={16} /> Add or invite staff</button></form>}
    {status && <p className="form-status" role="status">{status}</p>}
  </section>;
}
