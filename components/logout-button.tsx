"use client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }
  return <button type="button" onClick={logout}>Sign out</button>;
}
