"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { ArrowIcon, Button, buttonVariants } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { authClient, authErrorMessage } from "@/lib/auth/client";
import { normalizeEmail } from "@/lib/validation/email";

/** Step 1: ask for a reset link (always shows the same confirmation, so it can't reveal accounts). */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = normalizeEmail(email);
    if (!valid) return setError("Please enter a valid email address.");
    setError(null);
    start(async () => {
      const res = await authClient.requestPasswordReset({ email: valid, redirectTo: "/reset-password" });
      if (res.error?.code === "TOO_MANY_REQUESTS") return setError(authErrorMessage(res.error.code));
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-4">
        <div className="eyebrow text-blue">Check your inbox</div>
        <h1 className="font-display text-[34px] leading-[1.05] font-extrabold">Reset link sent</h1>
        <p className="text-muted text-base leading-[1.6]">
          If an account exists for <b className="text-ink">{email}</b>, a link to choose a new password is on
          its way. It expires in 1 hour.
        </p>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <div className="eyebrow text-blue">Forgot password</div>
        <h1 className="font-display mt-3 text-[clamp(32px,4vw,40px)] leading-[1.05] font-extrabold">
          Reset your password
        </h1>
        <p className="text-muted mt-3 text-base leading-[1.6]">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fp-email">Email address</Label>
        <Input
          id="fp-email"
          type="email"
          autoComplete="email"
          icon={<Mail />}
          value={email}
          invalid={Boolean(error)}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FieldError>{error}</FieldError>
      </div>
      <Button type="submit" size="lg" loading={pending}>
        Send reset link {!pending && <ArrowIcon />}
      </Button>
      <Link href="/login" className="text-blue text-center text-sm font-semibold hover:underline">
        Back to sign in
      </Link>
    </form>
  );
}

/** Step 2: choose a new password with the token from the email. */
export function ResetPasswordForm({ token }: { token: string | null }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    token ? null : "This reset link is incomplete. Ask for a new one.",
  );
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (password.length < 8) return setError("Use at least 8 characters.");
    setError(null);
    start(async () => {
      const res = await authClient.resetPassword({ newPassword: password, token });
      if (res.error)
        return setError(
          authErrorMessage(res.error.code, "We couldn't reset your password. Ask for a new link."),
        );
      setDone(true);
    });
  }

  if (done) {
    return (
      <div role="status" className="flex flex-col gap-4">
        <div className="eyebrow text-blue">All set</div>
        <h1 className="font-display text-[34px] leading-[1.05] font-extrabold">Password updated</h1>
        <Link href="/login" className={buttonVariants({ size: "lg" })}>
          Sign in <ArrowIcon />
        </Link>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <div className="eyebrow text-blue">New password</div>
        <h1 className="font-display mt-3 text-[clamp(32px,4vw,40px)] leading-[1.05] font-extrabold">
          Choose a new password
        </h1>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="rp-password">New password</Label>
        <Input
          id="rp-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          icon={<Lock />}
          value={password}
          invalid={Boolean(error)}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!token}
        />
        <FieldError>{error}</FieldError>
      </div>
      <Button type="submit" size="lg" loading={pending} disabled={!token}>
        Save password
      </Button>
      {!token && (
        <Link href="/forgot-password" className="text-blue text-center text-sm font-semibold hover:underline">
          Get a new link
        </Link>
      )}
    </form>
  );
}
