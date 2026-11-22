"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Bell, Building2, Mail, UserRound } from "lucide-react";
import { completeOnboarding, updateProfile } from "@/app/(app)/(shell)/account/actions";
import { ArrowIcon, Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { FieldError, FieldHint, Input, Label, NativeSelect } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toaster";
import { track } from "@/lib/analytics";
import { CURRENCIES } from "@/lib/currencies";
import { FOOD_PREFS } from "@/lib/validation/options";

export type ProfileValues = {
  name: string;
  home_city: string;
  currency: string;
  food_pref: (typeof FOOD_PREFS)[number] | null;
  email_notifications: boolean;
  push_notifications: boolean;
};

export function ProfileForm({
  mode,
  initial,
  next = "/trips",
}: {
  mode: "onboarding" | "account";
  initial: ProfileValues;
  next?: string;
}) {
  const [v, setV] = useState<ProfileValues>(initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [pending, start] = useTransition();
  const [skipping, startSkip] = useTransition();

  const set = <K extends keyof ProfileValues>(k: K, val: ProfileValues[K]) => {
    setV((s) => ({ ...s, [k]: val }));
    setFields((f) => ({ ...f, [k]: "" }));
  };

  async function togglePush(on: boolean) {
    if (!on) return set("push_notifications", false);
    if (!("Notification" in window)) {
      toast.error("This browser doesn't support notifications. Add Wayzo to your home screen first.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") set("push_notifications", true);
    else toast("Notifications are blocked. You can turn them on in your browser settings.");
  }

  const timezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res =
        mode === "onboarding"
          ? await completeOnboarding({ ...v, timezone: timezone() }, next)
          : await updateProfile(v);
      if (res && !res.ok) {
        setFields(res.fields ?? {});
        setError(res.fields ? null : res.error);
        setShake((s) => s + 1);
        return;
      }
      if (mode === "onboarding") track("onboarding_completed", { skipped: false });
      else toast.success("Profile saved");
    });
  }

  function onSkip() {
    startSkip(async () => {
      track("onboarding_completed", { skipped: true });
      const res = await completeOnboarding({ timezone: timezone() }, next, true);
      if (res && !res.ok) toast.error(res.error);
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-7">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-name">Your name</Label>
          <Input
            id="p-name"
            icon={<UserRound />}
            autoComplete="name"
            value={v.name}
            invalid={Boolean(fields.name)}
            shakeSignal={shake}
            onChange={(e) => set("name", e.target.value)}
          />
          <FieldError>{fields.name}</FieldError>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-city">Home city</Label>
          <Input
            id="p-city"
            icon={<Building2 />}
            placeholder="London"
            autoComplete="address-level2"
            value={v.home_city}
            onChange={(e) => set("home_city", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="p-currency">Default currency</Label>
        <NativeSelect id="p-currency" value={v.currency} onChange={(e) => set("currency", e.target.value)}>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} · {c.name}
            </option>
          ))}
        </NativeSelect>
        <FieldHint>New trips start in this currency.</FieldHint>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-semibold">Food preference</legend>
        <div className="flex flex-wrap gap-2">
          {FOOD_PREFS.map((f) => (
            <Chip
              key={f}
              selected={v.food_pref === f}
              onClick={() => set("food_pref", v.food_pref === f ? null : f)}
            >
              {f}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-semibold">Notifications</legend>
        <label className="border-line flex items-center gap-4 rounded-[18px] border-[1.5px] p-4">
          <span className="text-blue inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF1FF]">
            <Mail className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Email</span>
            <span className="text-subtle block text-[13px]">Your 7 AM brief, reminders and invites</span>
          </span>
          <Switch
            checked={v.email_notifications}
            onCheckedChange={(c) => set("email_notifications", c)}
            aria-label="Email notifications"
          />
        </label>
        <label className="border-line flex items-center gap-4 rounded-[18px] border-[1.5px] p-4">
          <span className="bg-lime/30 text-ink inline-flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Bell className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Push on this device</span>
            <span className="text-subtle block text-[13px]">
              Check-in times, departures and group updates
            </span>
          </span>
          <Switch
            checked={v.push_notifications}
            onCheckedChange={togglePush}
            aria-label="Push notifications"
          />
        </label>
      </fieldset>

      {error && (
        <div role="alert" className="text-error rounded-2xl bg-[#FEF3F2] px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {mode === "onboarding" && (
          <Button type="button" variant="outline" onClick={onSkip} loading={skipping} disabled={pending}>
            Skip for now
          </Button>
        )}
        <Button type="submit" loading={pending} disabled={skipping}>
          {mode === "onboarding" ? "Let's go" : "Save profile"}{" "}
          {!pending && mode === "onboarding" && <ArrowIcon />}
        </Button>
      </div>
    </form>
  );
}
