"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (response.ok) {
      router.replace("/");
      router.refresh();
    }
  }
  return <button type="button" onClick={logout}>Sign out</button>;
}
