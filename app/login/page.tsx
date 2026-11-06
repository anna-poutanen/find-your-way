import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser, safeReturnPath } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const returnTo = safeReturnPath((await searchParams).return_to);
  if (await getCurrentUser()) redirect(returnTo);
  return <main><SiteHeader user={null} /><section className="auth-section"><AuthForm mode="login" returnTo={returnTo} /></section></main>;
}
