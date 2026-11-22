"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { authErrorMessage, sendEmailLink, signInWithGoogle } from "@/lib/firebase/client";
import { ArrowIcon, Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { afterSignIn } from "@/lib/utils";
import { normalizeEmail } from "@/lib/validation/email";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28v-3.1H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.27 6.62l4 3.1C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  );
}

export function LoginForm({ next, initialError }: { next: string; initialError: string | null }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [shake, setShake] = useState(0);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pendingEmail, startEmail] = useTransition();
  const [pendingGoogle, startGoogle] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = normalizeEmail(email);
    if (!valid) {
      setError("Please enter a valid email address.");
      setShake((s) => s + 1);
      return;
    }
    setError(null);
    startEmail(async () => {
      try {
        await sendEmailLink(valid, next);
        setSentTo(valid);
      } catch (err) {
        setError(authErrorMessage(err));
        setShake((s) => s + 1);
      }
    });
  }

  function onGoogle() {
    setError(null);
    startGoogle(async () => {
      try {
        const { onboarded } = await signInWithGoogle();
        window.location.assign(afterSignIn(onboarded, next));
      } catch (err) {
        setError(authErrorMessage(err));
      }
    });
  }

  if (sentTo) {
    return (
      <div role="status" className="animate-fadeup flex flex-col items-center gap-4 text-center">
        <span className="animate-popin bg-lime inline-flex size-[84px] items-center justify-center rounded-full">
          <Mail className="text-ink size-9" strokeWidth={2.2} aria-hidden />
        </span>
        <h1 className="font-display mt-1.5 text-[32px] leading-tight font-extrabold">Check your inbox</h1>
        <p className="text-muted max-w-[340px] text-base leading-[1.6]">
          We sent a sign-in link to <b className="text-ink">{sentTo}</b>. Open it on this device to continue.
        </p>
        <Button variant="soft" className="mt-2" onClick={() => setSentTo(null)}>
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <div className="eyebrow text-blue">Welcome</div>
        <h1 className="font-display mt-3 text-[clamp(34px,4vw,44px)] leading-[1.05] font-extrabold">
          Sign in to Wayzo
        </h1>
        <p className="text-muted mt-3 text-base leading-[1.6]">
          No password needed. We&apos;ll email you a magic link.
        </p>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onGoogle}
        loading={pendingGoogle}
        disabled={pendingEmail}
      >
        {!pendingGoogle && <GoogleIcon />}
        Continue with Google
      </Button>

      <div className="text-subtle flex items-center gap-4 text-[13px] font-semibold" role="separator">
        <span className="bg-line h-px flex-1" />
        or with email
        <span className="bg-line h-px flex-1" />
      </div>

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-email">Email address</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@email.com"
            icon={<Mail />}
            value={email}
            invalid={Boolean(error)}
            shakeSignal={shake}
            aria-describedby={error ? "login-err" : undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
          />
          <FieldError id="login-err">{error}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={pendingEmail} disabled={pendingGoogle}>
          Email me a sign-in link {!pendingEmail && <ArrowIcon />}
        </Button>
      </form>

      <p className="text-subtle text-center text-[13px] leading-relaxed">
        By continuing you agree to our{" "}
        <a href="/terms" className="text-ink font-semibold underline-offset-2 hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-ink font-semibold underline-offset-2 hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
