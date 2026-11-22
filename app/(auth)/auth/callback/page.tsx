import type { Metadata } from "next";
import { EmailLinkCallback } from "@/components/auth/email-link-callback";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Signing you in", robots: { index: false } };

/** Landing page for the emailed sign-in link (Firebase email-link auth). */
export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <EmailLinkCallback next={safeNextPath(next)} />;
}
