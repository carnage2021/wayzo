import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { SetupNotice } from "@/components/app/setup-notice";
import { getUser } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

const DEFAULT_ERROR = "We couldn't sign you in. Please try again.";
const ERRORS: Record<string, string> = {
  link_expired: "That sign-in link has expired or was already used. Send yourself a new one.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  if (!isFirebaseConfigured()) return <SetupNotice />;
  const dest = safeNextPath(next);
  if (await getUser()) redirect(dest);
  return <LoginForm next={dest} initialError={error ? (ERRORS[error] ?? DEFAULT_ERROR) : null} />;
}
