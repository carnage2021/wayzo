"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowIcon, Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { FieldError, Input, Label } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { normalizeEmail } from "@/lib/validation/email";
import { TRAVELS_WITH, type TravelsWith } from "@/lib/validation/options";
import { IconLock, IconMail } from "./icons";

function utmSource(): string | null {
  const params = new URLSearchParams(window.location.search);
  const parts = ["utm_source", "utm_medium", "utm_campaign"]
    .map((k) => params.get(k))
    .filter((v): v is string => Boolean(v));
  return parts.length ? parts.join("/").slice(0, 200) : null;
}

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [who, setWho] = useState<TravelsWith>("Friends");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = normalizeEmail(email);
    if (!valid) {
      setError("Please enter a valid email address.");
      setShake((s) => s + 1);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: valid, travels_with: who, source: utmSource() }),
      });
      if (res.status === 429) {
        setError("Too many tries. Please wait a minute and try again.");
        setShake((s) => s + 1);
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Something went wrong. Please try again.");
        setShake((s) => s + 1);
        return;
      }
      track("waitlist_joined", { travels_with: who });
      setDone(valid);
    } catch {
      setError("You seem to be offline. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setEmail("");
    setDone(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  if (done) {
    return (
      <div role="status" className="animate-fadeup flex flex-col items-center gap-4 text-center">
        <span className="animate-popin bg-lime inline-flex size-[84px] items-center justify-center rounded-full">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0B1020"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h3 className="font-display mt-1.5 text-[32px] font-extrabold">You&apos;re on the list!</h3>
        <p className="text-muted m-0 max-w-[340px] text-base leading-[1.6]">
          We&apos;ll email <b className="text-ink">{done}</b> as soon as your invite is ready.
        </p>
        <Button type="button" variant="lime" className="mt-2" onClick={reset}>
          Add another email
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-[22px]">
      <div>
        <h3 className="font-display m-0 text-[30px] leading-[1.1] font-extrabold">Join the waitlist</h3>
        <p className="text-muted mt-2 text-[15px]">
          Takes ten seconds. We&apos;ll email you when your invite is ready.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="wl-email">Email address</Label>
        <Input
          shakeSignal={shake}
          ref={inputRef}
          id="wl-email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          icon={<IconMail size={20} stroke="#7A8397" />}
          invalid={Boolean(error)}
          aria-describedby={error ? "wl-err" : undefined}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
        />
        <FieldError id="wl-err">{error}</FieldError>
      </div>
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-2.5 p-0 text-sm font-semibold">Who do you usually travel with?</legend>
        <div className="flex flex-wrap gap-2">
          {TRAVELS_WITH.map((opt) => (
            <Chip key={opt} selected={who === opt} onClick={() => setWho(opt)}>
              {opt}
            </Chip>
          ))}
        </div>
      </fieldset>
      <Button type="submit" variant="ink" size="lg" className="w-full" loading={submitting}>
        Get early access {!submitting && <ArrowIcon />}
      </Button>
      <div className="text-subtle flex items-center justify-center gap-2 text-[13px]">
        <IconLock size={14} />
        No spam. Unsubscribe anytime.
      </div>
    </form>
  );
}
