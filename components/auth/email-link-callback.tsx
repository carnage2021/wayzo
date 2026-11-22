"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { ArrowIcon, Button, buttonVariants } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { authErrorMessage, completeEmailLink, isEmailLink, rememberedEmail } from "@/lib/firebase/client";
import { afterSignIn } from "@/lib/utils";
import { normalizeEmail } from "@/lib/validation/email";

type State = "working" | "need-email" | "error";

/**
 * Completes Firebase email-link sign-in. If the link was opened on another
 * device/browser we don't know the email, so we ask for it (Firebase requires it).
 */
export function EmailLinkCallback({ next }: { next: string }) {
  const [state, setState] = useState<State>("working");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [shake, setShake] = useState(0);
  const [pending, setPending] = useState(false);
  const started = useRef(false);

  async function finish(address: string) {
    setPending(true);
    try {
      const { onboarded } = await completeEmailLink(address, window.location.href);
      window.location.replace(afterSignIn(onboarded, next));
    } catch (err) {
      setPending(false);
      setError(authErrorMessage(err));
      setState((s) => (s === "need-email" ? s : "error"));
      setShake((n) => n + 1);
    }
  }

  useEffect(() => {
    if (started.current) return; // StrictMode runs effects twice; the link is single-use
    started.current = true;
    if (!isEmailLink(window.location.href)) {
      setError("This sign-in link is incomplete. Send yourself a new one.");
      setState("error");
      return;
    }
    const saved = rememberedEmail();
    if (saved) void finish(saved);
    else setState("need-email");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = normalizeEmail(email);
    if (!valid) {
      setError("Please enter a valid email address.");
      setShake((n) => n + 1);
      return;
    }
    setError(null);
    void finish(valid);
  }

  if (state === "working") {
    return (
      <div role="status" className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="text-blue size-10 animate-spin" aria-hidden />
        <h1 className="font-display text-[28px] leading-tight font-extrabold">Signing you in…</h1>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <div className="eyebrow text-blue">Sign in</div>
          <h1 className="font-display mt-3 text-[34px] leading-[1.05] font-extrabold">
            Link didn&apos;t work
          </h1>
          <p className="text-muted mt-3 text-base leading-[1.6]">{error}</p>
        </div>
        <Link href={`/login?next=${encodeURIComponent(next)}`} className={buttonVariants({ size: "lg" })}>
          Back to sign in <ArrowIcon />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <div className="eyebrow text-blue">One more step</div>
        <h1 className="font-display mt-3 text-[clamp(30px,4vw,40px)] leading-[1.05] font-extrabold">
          Confirm your email
        </h1>
        <p className="text-muted mt-3 text-base leading-[1.6]">
          You opened the link on a different device. Enter the email you used to sign in.
        </p>
      </div>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-email">Email address</Label>
          <Input
            id="confirm-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@email.com"
            icon={<Mail />}
            value={email}
            invalid={Boolean(error)}
            shakeSignal={shake}
            aria-describedby={error ? "confirm-err" : undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
          />
          <FieldError id="confirm-err">{error}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={pending}>
          Continue {!pending && <ArrowIcon />}
        </Button>
      </form>
    </div>
  );
}
