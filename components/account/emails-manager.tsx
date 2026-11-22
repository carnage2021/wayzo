"use client";

import { useState, useTransition, type FormEvent } from "react";
import { BadgeCheck, Clock, Mail, Plus, Trash2 } from "lucide-react";
import { addEmail, removeEmail, resendVerification } from "@/app/(app)/(shell)/account/actions";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { FieldError, Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

type Row = { id: string; email: string; verified_at: string | null };

export function EmailsManager({ primaryEmail, rows }: { primaryEmail: string; rows: Row[] }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const extras = rows.filter((r) => r.email.toLowerCase() !== primaryEmail.toLowerCase());

  function onAdd(e: FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await addEmail(email);
      if (!res.ok) {
        setError(res.error);
        setShake((s) => s + 1);
        return;
      }
      setEmail("");
      toast.success("Check that inbox for a confirmation link");
    });
  }

  async function act(id: string, fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setBusyId(id);
    const res = await fn();
    setBusyId(null);
    if (res.ok) toast.success(success);
    else toast.error(res.error ?? "Something went wrong");
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        <li className="bg-mist flex items-center gap-3 rounded-[18px] p-3.5">
          <Mail className="text-subtle size-5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 truncate font-semibold">{primaryEmail}</span>
          <Tag variant="ink">Sign-in</Tag>
        </li>
        {extras.map((r) => (
          <li
            key={r.id}
            className="border-soft-line flex flex-wrap items-center gap-3 rounded-[18px] border p-3.5"
          >
            <Mail className="text-subtle size-5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate font-semibold">{r.email}</span>
            {r.verified_at ? (
              <Tag variant="lime">
                <BadgeCheck className="size-3.5" aria-hidden /> Verified
              </Tag>
            ) : (
              <>
                <Tag variant="mist">
                  <Clock className="size-3.5" aria-hidden /> Pending
                </Tag>
                <Button
                  size="sm"
                  variant="link"
                  disabled={busyId === r.id}
                  onClick={() => act(r.id, () => resendVerification(r.id), "Confirmation email sent")}
                >
                  Resend
                </Button>
              </>
            )}
            <button
              type="button"
              className="text-subtle hover:text-error inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-[#FEF3F2] disabled:opacity-50"
              aria-label={`Remove ${r.email}`}
              disabled={busyId === r.id}
              onClick={() => act(r.id, () => removeEmail(r.id), "Email removed")}
            >
              <Trash2 className="size-[18px]" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <form noValidate onSubmit={onAdd} className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="work@email.com"
            aria-label="Add another email"
            icon={<Plus />}
            value={email}
            invalid={Boolean(error)}
            shakeSignal={shake}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            wrapperClassName="flex-1"
          />
          <Button type="submit" variant="ink" loading={pending} className="sm:min-h-[58px]">
            Add email
          </Button>
        </div>
        <FieldError>{error}</FieldError>
      </form>
    </div>
  );
}
