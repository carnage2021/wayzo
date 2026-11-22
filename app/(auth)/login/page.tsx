import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { SetupNotice } from "@/components/app/setup-notice";
import { getUser } from "@/lib/auth";
import { isGoogleEnabled } from "@/lib/auth/server";
import { isBackendConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

const DEFAULT_ERROR = "We couldn't sign you in. Please try again.";
const ERRORS: Record<string, string> = {
  google: "Google sign-in was cancelled or failed. Try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; mode?: string }>;
}) {
  const { next, error, mode } = await searchParams;
  if (!isBackendConfigured()) return <SetupNotice />;
  const dest = safeNextPath(next);
  if (await getUser()) redirect(`/auth/continue?next=${encodeURIComponent(dest)}`);
  return (
    <LoginForm
      next={dest}
      googleEnabled={isGoogleEnabled()}
      initialMode={mode === "signup" ? "signup" : "signin"}
      initialError={error ? (ERRORS[error] ?? DEFAULT_ERROR) : null}
    />
  );
}
