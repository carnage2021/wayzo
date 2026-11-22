"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { ArrowIcon, Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { authClient, authErrorMessage } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
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

type Mode = "signin" | "signup";

export function LoginForm({
  next,
  initialError,
  googleEnabled,
  initialMode = "signin",
}: {
  next: string;
  initialError: string | null;
  googleEnabled: boolean;
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [shake, setShake] = useState(0);
  const [pending, start] = useTransition();
  const [pendingGoogle, startGoogle] = useTransition();
  const continueUrl = `/auth/continue?next=${encodeURIComponent(next)}`;

  function fail(message: string, f: Record<string, string> = {}) {
    setError(message);
    setFields(f);
    setShake((s) => s + 1);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = normalizeEmail(email);
    const f: Record<string, string> = {};
    if (mode === "signup" && !name.trim()) f.name = "Tell us your name.";
    if (!valid) f.email = "Please enter a valid email address.";
    if (password.length < 8) f.password = "Use at least 8 characters.";
    if (Object.keys(f).length) return fail("Check the highlighted fields.", f);
    setError(null);
    setFields({});
    start(async () => {
      const res =
        mode === "signup"
          ? await authClient.signUp.email({ name: name.trim(), email: valid!, password })
          : await authClient.signIn.email({ email: valid!, password });
      if (res.error) return fail(authErrorMessage(res.error.code));
      window.location.assign(continueUrl);
    });
  }

  function onGoogle() {
    setError(null);
    startGoogle(async () => {
      const res = await authClient.signIn.social({ provider: "google", callbackURL: continueUrl });
      if (res.error) setError(authErrorMessage(res.error.code, "Google sign-in is unavailable right now."));
    });
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <div className="eyebrow text-blue">{mode === "signin" ? "Welcome back" : "Get started"}</div>
        <h1 className="font-display mt-3 text-[clamp(34px,4vw,44px)] leading-[1.05] font-extrabold">
          {mode === "signin" ? "Sign in to Wayzo" : "Create your account"}
        </h1>
      </div>

      <div
        className="bg-mist grid grid-cols-2 rounded-full p-1"
        role="tablist"
        aria-label="Sign in or create account"
      >
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
              setFields({});
            }}
            className={cn(
              "rounded-full py-2.5 text-[15px] font-semibold transition-colors",
              mode === m ? "bg-ink text-white" : "text-muted hover:text-ink",
            )}
          >
            {m === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {googleEnabled && (
        <>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onGoogle}
            loading={pendingGoogle}
            disabled={pending}
          >
            {!pendingGoogle && <GoogleIcon />}
            Continue with Google
          </Button>
          <div className="text-subtle flex items-center gap-4 text-[13px] font-semibold" role="separator">
            <span className="bg-line h-px flex-1" />
            or with email
            <span className="bg-line h-px flex-1" />
          </div>
        </>
      )}

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        {mode === "signup" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="login-name">Your name</Label>
            <Input
              id="login-name"
              autoComplete="name"
              placeholder="Alex Rivera"
              icon={<UserRound />}
              value={name}
              invalid={Boolean(fields.name)}
              onChange={(e) => setName(e.target.value)}
            />
            <FieldError>{fields.name}</FieldError>
          </div>
        )}
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
            invalid={Boolean(fields.email)}
            shakeSignal={shake}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FieldError>{fields.email}</FieldError>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            {mode === "signin" && (
              <Link href="/forgot-password" className="text-blue text-sm font-semibold hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <Input
            id="login-password"
            type={show ? "text" : "password"}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            icon={<Lock />}
            value={password}
            invalid={Boolean(fields.password)}
            onChange={(e) => setPassword(e.target.value)}
            trailing={
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="text-subtle hover:text-ink inline-flex size-9 items-center justify-center rounded-full"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? (
                  <EyeOff className="size-[18px]" aria-hidden />
                ) : (
                  <Eye className="size-[18px]" aria-hidden />
                )}
              </button>
            }
          />
          <FieldError>{fields.password}</FieldError>
        </div>
        {error && (
          <p role="alert" className="text-error -mt-1 text-sm font-semibold">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={pending} disabled={pendingGoogle}>
          {mode === "signin" ? "Sign in" : "Create account"} {!pending && <ArrowIcon />}
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
