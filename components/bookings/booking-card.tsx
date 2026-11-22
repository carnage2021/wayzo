"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import { FileText, MoreHorizontal, Pencil, Sparkles, Trash2 } from "lucide-react";
import { deleteBooking } from "@/app/(app)/trips/[tripId]/bookings/actions";
import { Avatar, type AvatarPerson } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";
import { formatMoney } from "@/lib/currencies";
import type { BookingRow } from "@/lib/db/types";
import { bookingTitle, TYPE_LABEL } from "@/lib/tickets/logic";
import { cn } from "@/lib/utils";
import { BookingEditor } from "./booking-editor";
import { TYPE_ICON, TYPE_TONE, timeRange } from "./booking-meta";

const item =
  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink outline-none data-[highlighted]:bg-mist";

export function BookingCard({
  tripId,
  booking,
  addedBy,
}: {
  tripId: string;
  booking: BookingRow;
  addedBy: AvatarPerson | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();
  const Icon = TYPE_ICON[booking.type];
  const title = bookingTitle(booking);
  const review = booking.status === "needs_review";
  const sourceUrl = booking.source_key ? `/api/trips/${tripId}/bookings/${booking.id}/source` : null;

  function onDelete() {
    startDelete(async () => {
      const r = await deleteBooking(tripId, booking.id);
      setConfirmDelete(false);
      if (!r.ok) return void toast.error(r.error);
      toast(`Deleted ${title}`);
      router.refresh();
    });
  }

  return (
    <article
      className={cn(
        "flex items-start gap-4 rounded-[22px] border bg-white p-4 sm:p-5",
        review ? "border-lime shadow-[0_0_0_3px_rgba(215,255,61,.35)]" : "border-soft-line",
      )}
    >
      <span
        className={cn(
          "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl",
          TYPE_TONE[booking.type],
        )}
      >
        <Icon className="size-[22px]" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="truncate text-[17px] font-bold">{title}</h3>
          {review && (
            <span className="bg-lime text-ink inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold">
              <Sparkles className="size-3" aria-hidden /> Needs a check
            </span>
          )}
        </div>
        <div className="text-muted mt-1 text-[15px] font-medium">
          {timeRange(booking.type, booking.start_at, booking.end_at)}
        </div>
        <div className="text-subtle mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
          <span>
            {TYPE_LABEL[booking.type]}
            {booking.provider && booking.type !== "stay" ? ` · ${booking.provider}` : ""}
          </span>
          {booking.booking_code && (
            <span className="font-mono font-semibold tracking-wide">{booking.booking_code}</span>
          )}
          {booking.seat_or_room && <span>Seat/room {booking.seat_or_room}</span>}
          {booking.travellers.length > 0 && (
            <span>
              {booking.travellers.length} traveller{booking.travellers.length > 1 ? "s" : ""}
            </span>
          )}
          {booking.price_minor !== null && booking.currency && (
            <span>{formatMoney(booking.price_minor, booking.currency)}</span>
          )}
        </div>
        {review && (
          <Button size="sm" className="mt-3" onClick={() => setEditing(true)}>
            Review details
          </Button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {addedBy && (
          <span title={`Added by ${addedBy.name ?? "a member"}`}>
            <Avatar person={addedBy} size={30} />
          </span>
        )}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            className="hover:bg-mist focus-visible:ring-blue/30 inline-flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-4"
            aria-label={`Actions for ${title}`}
          >
            <MoreHorizontal className="size-5" aria-hidden />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="border-soft-line shadow-card z-50 w-52 rounded-[18px] border bg-white p-1.5"
            >
              {sourceUrl && (
                <DropdownMenu.Item asChild className={item}>
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="text-subtle size-[18px]" aria-hidden /> Open original
                  </a>
                </DropdownMenu.Item>
              )}
              <DropdownMenu.Item className={item} onSelect={() => setEditing(true)}>
                <Pencil className="text-subtle size-[18px]" aria-hidden /> Edit
              </DropdownMenu.Item>
              <DropdownMenu.Item className={cn(item, "text-error")} onSelect={() => setConfirmDelete(true)}>
                <Trash2 className="size-[18px]" aria-hidden /> Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {editing && (
        <BookingEditor tripId={tripId} booking={booking} open={editing} onOpenChange={setEditing} />
      )}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {title}?</DialogTitle>
            <DialogDescription>
              It disappears for everyone on the trip. The original file stays in the trip&apos;s storage.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="ink" onClick={onDelete} loading={deleting}>
              Delete booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
