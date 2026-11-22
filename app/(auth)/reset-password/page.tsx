import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/password-reset";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token && /^[\w-]{10,200}$/.test(token) ? token : null} />;
}
