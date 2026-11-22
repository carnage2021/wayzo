"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, PenLine } from "lucide-react";
import { createTrip, updateTrip } from "@/app/(app)/trips/actions";
import { ArrowIcon, Button } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label, NativeSelect } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { track } from "@/lib/analytics";
import { CURRENCIES } from "@/lib/currencies";
import { DestinationInput, type DestinationValue } from "./destination-input";

export type TripFormValues = {
  name: string;
  destinations: DestinationValue[];
  start_date: string;
  end_date: string;
  currency: string;
};

export function TripForm({
  mode,
  tripId,
  initial,
}: {
  mode: "create" | "edit";
  tripId?: string;
  initial: TripFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<TripFormValues>(initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof TripFormValues>(k: K, v: TripFormValues[K]) => {
    setValues((s) => ({ ...s, [k]: v }));
    setFields((f) => ({ ...f, [k]: "" }));
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const payload = {
      name: values.name,
      destinations: values.destinations,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      currency: values.currency,
    };
    startTransition(async () => {
      const res = mode === "create" ? await createTrip(payload) : await updateTrip(tripId ?? "", payload);
      if (!res.ok) {
        setFields(res.fields ?? {});
        setFormError(res.fields ? null : res.error);
        setShake((s) => s + 1);
        return;
      }
      if (mode === "create") {
        track("trip_created", {
          destinations: payload.destinations.length,
          dated: Boolean(payload.start_date),
        });
        toast.success("Trip created");
        router.push(`/trips/${res.data.id}`);
      } else {
        toast.success("Trip details saved");
        router.refresh();
      }
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <Label htmlFor="trip-name">Trip name</Label>
        <Input
          id="trip-name"
          placeholder="Lisbon with the crew"
          icon={<PenLine />}
          maxLength={80}
          value={values.name}
          invalid={Boolean(fields.name)}
          shakeSignal={shake}
          aria-describedby={fields.name ? "trip-name-err" : undefined}
          onChange={(e) => set("name", e.target.value)}
          autoFocus={mode === "create"}
        />
        <FieldError id="trip-name-err">{fields.name}</FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="trip-destinations">Where are you going?</Label>
        <DestinationInput
          value={values.destinations}
          onChange={(v) => set("destinations", v)}
          invalid={Boolean(fields.destinations)}
        />
        <FieldError>{fields.destinations}</FieldError>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="trip-start">Start date</Label>
          <Input
            id="trip-start"
            type="date"
            icon={<CalendarDays />}
            value={values.start_date}
            invalid={Boolean(fields.start_date)}
            onChange={(e) => set("start_date", e.target.value)}
          />
          <FieldError>{fields.start_date}</FieldError>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="trip-end">End date</Label>
          <Input
            id="trip-end"
            type="date"
            icon={<CalendarDays />}
            min={values.start_date || undefined}
            value={values.end_date}
            invalid={Boolean(fields.end_date)}
            onChange={(e) => set("end_date", e.target.value)}
          />
          <FieldError>{fields.end_date}</FieldError>
        </div>
        <div className="sm:col-span-2">
          <FieldHint>Not sure yet? Leave dates empty. Your first tickets will fill them in.</FieldHint>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="trip-currency">Trip currency</Label>
        <NativeSelect
          id="trip-currency"
          value={values.currency}
          onChange={(e) => set("currency", e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} · {c.name}
            </option>
          ))}
        </NativeSelect>
        <FieldHint>Shared budgets and balances are shown in this currency.</FieldHint>
      </div>

      {formError && (
        <div role="alert" className="text-error rounded-2xl bg-[#FEF3F2] px-4 py-3 text-sm font-medium">
          {formError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" loading={pending}>
          {mode === "create" ? "Create trip" : "Save changes"}{" "}
          {!pending && mode === "create" && <ArrowIcon />}
        </Button>
      </div>
    </form>
  );
}
