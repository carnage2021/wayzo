"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Sparkles } from "lucide-react";
import { confirmBooking, discardBooking } from "@/app/(app)/trips/[tripId]/bookings/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldError, Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import type { BookingRow } from "@/lib/db/types";
import { CONFIRM_THRESHOLD, TYPE_LABEL } from "@/lib/tickets/logic";
import { cn } from "@/lib/utils";

const TYPES = Object.entries(TYPE_LABEL) as [BookingRow["type"], string][];

type Form = {
  type: BookingRow["type"];
  provider: string;
  booking_code: string;
  start_at: string;
  end_at: string;
  from_place: string;
  to_place: string;
  address: string;
  seat_or_room: string;
  price: string;
  currency: string;
  notes: string;
};

function initial(b: BookingRow): Form {
  const digits = b.currency === "JPY" || b.currency === "KRW" ? 0 : 2;
  return {
    type: b.type,
    provider: b.provider ?? "",
    booking_code: b.booking_code ?? "",
    start_at: b.start_at ?? "",
    end_at: b.end_at ?? "",
    from_place: b.from_place ?? "",
    to_place: b.to_place ?? "",
    address: b.address ?? "",
    seat_or_room: b.seat_or_room ?? "",
    price: b.price_minor !== null ? String(b.price_minor / 10 ** digits) : "",
    currency: b.currency ?? "",
    notes: b.notes ?? "",
  };
}

const isTransport = (t: string) => ["flight", "train", "bus", "ferry"].includes(t);

export function BookingEditor({
  tripId,
  booking,
  open,
  onOpenChange,
}: {
  tripId: string;
  booking: BookingRow;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(() => initial(booking));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const [discarding, startDiscard] = useTransition();
  const review = booking.status === "needs_review";
  const sourceUrl = booking.source_key ? `/api/trips/${tripId}/bookings/${booking.id}/source` : null;
  const isImage = booking.source_mime?.startsWith("image/");

  // Fields the reader wasn't sure about (only highlighted while the booking awaits review).
  const unsure = (f: string) => review && (booking.confidence[f] ?? 1) < CONFIRM_THRESHOLD;

  const set = (k: keyof Form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await confirmBooking(tripId, booking.id, form);
      if (!r.ok) {
        setErrors(r.fields ?? {});
        toast.error(r.error);
        return;
      }
      toast.success(review ? "Booking confirmed" : "Booking saved");
      onOpenChange(false);
      router.refresh();
    });
  }

  function onDiscard() {
    startDiscard(async () => {
      const r = await discardBooking(tripId, booking.id);
      if (!r.ok) return void toast.error(r.error);
      toast("Booking discarded");
      onOpenChange(false);
      router.refresh();
    });
  }

  const field = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`be-${k}`} className={cn(unsure(k) && "text-ink")}>
        {label}
        {unsure(k) && (
          <span className="bg-lime text-ink ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold">
            <Sparkles className="size-3" aria-hidden /> Check this
          </span>
        )}
      </Label>
      <Input
        id={`be-${k}`}
        value={form[k]}
        onChange={set(k)}
        invalid={Boolean(errors[k])}
        wrapperClassName={cn(unsure(k) && "ring-lime rounded-2xl ring-2 ring-offset-2")}
        {...props}
      />
      <FieldError>{errors[k]}</FieldError>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-w-[1040px]", sourceUrl && "lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-8")}
      >
        {sourceUrl && (
          <div className="bg-mist hidden min-h-[520px] overflow-hidden rounded-[20px] lg:block">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
              <img src={sourceUrl} alt="Original ticket" className="size-full object-contain" />
            ) : (
              <iframe src={sourceUrl} title="Original ticket" className="size-full min-h-[520px]" />
            )}
          </div>
        )}
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{review ? "Check this booking" : "Edit booking"}</DialogTitle>
            <DialogDescription>
              {review
                ? "We weren't sure about a few details. Fix anything that's off, then confirm."
                : "Changes are visible to everyone on the trip."}
            </DialogDescription>
          </DialogHeader>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue inline-flex items-center gap-2 text-sm font-semibold lg:hidden"
            >
              <ExternalLink className="size-4" aria-hidden /> Open original ticket
            </a>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="be-type">Type</Label>
            <NativeSelect id="be-type" value={form.type} onChange={set("type")}>
              {TYPES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field("provider", form.type === "stay" ? "Property" : "Provider")}
            {field("booking_code", "Booking code", { autoCapitalize: "characters" })}
            {field("start_at", form.type === "stay" ? "Check-in" : "Starts", {
              placeholder: "2027-04-12T11:05",
            })}
            {field("end_at", form.type === "stay" ? "Check-out" : "Ends", {
              placeholder: "2027-04-12T13:40",
            })}
          </div>
          {isTransport(form.type) ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {field("from_place", "From")}
              {field("to_place", "To")}
            </div>
          ) : (
            field("to_place", "Place")
          )}
          {!isTransport(form.type) && field("address", "Address")}
          <div className="grid grid-cols-[1fr_110px] gap-4 sm:grid-cols-[1fr_1fr_110px]">
            <div className="hidden sm:block">
              {field("seat_or_room", form.type === "stay" ? "Room" : "Seat")}
            </div>
            {field("price", "Price", { inputMode: "decimal" })}
            {field("currency", "Currency", { maxLength: 3, autoCapitalize: "characters" })}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="be-notes">Notes</Label>
            <Textarea id="be-notes" value={form.notes} onChange={set("notes")} rows={2} />
          </div>
          <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {review && (
              <Button
                type="button"
                variant="outline"
                onClick={onDiscard}
                loading={discarding}
                disabled={pending}
              >
                Discard
              </Button>
            )}
            <Button type="submit" loading={pending} disabled={discarding}>
              {review ? "Confirm booking" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
