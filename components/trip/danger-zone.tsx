"use client";

import { useState, useTransition } from "react";
import { deleteTrip, leaveTrip } from "@/app/(app)/trips/actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError, Input, Label } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

export function DangerZone({
  tripId,
  tripName,
  isOwner,
}: {
  tripId: string;
  tripName: string;
  isOwner: boolean;
}) {
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onDelete() {
    setError(null);
    start(async () => {
      const res = await deleteTrip(tripId, confirm);
      if (res && !res.ok) setError(res.error);
    });
  }

  function onLeave() {
    start(async () => {
      const res = await leaveTrip(tripId);
      if (res && !res.ok) toast.error(res.error);
    });
  }

  return (
    <Card size="lg" className="border-[#FECDCA]">
      <CardTitle className="text-[22px]">{isOwner ? "Delete trip" : "Leave trip"}</CardTitle>
      <CardDescription>
        {isOwner
          ? "Deletes the trip for everyone, including bookings, plans, expenses and photos. This can't be undone."
          : "You'll lose access to this trip. You can rejoin with a new invite."}
      </CardDescription>
      <Dialog onOpenChange={() => (setConfirm(""), setError(null))}>
        <DialogTrigger asChild>
          <Button variant={isOwner ? "danger" : "outline"} className="self-start">
            {isOwner ? "Delete trip" : "Leave trip"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isOwner ? "Delete this trip?" : "Leave this trip?"}</DialogTitle>
            <DialogDescription>
              {isOwner ? (
                <>
                  Type <b className="text-ink">{tripName}</b> to confirm. Everything in it is deleted for all
                  members.
                </>
              ) : (
                "You'll stop receiving briefs and updates for this trip."
              )}
            </DialogDescription>
          </DialogHeader>
          {isOwner && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-trip">Trip name</Label>
              <Input
                id="confirm-trip"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                invalid={Boolean(error)}
                autoComplete="off"
              />
              <FieldError>{error}</FieldError>
            </div>
          )}
          <DialogFooter>
            {isOwner ? (
              <Button
                variant="danger"
                onClick={onDelete}
                loading={pending}
                disabled={confirm.trim() !== tripName}
              >
                Delete forever
              </Button>
            ) : (
              <Button variant="danger" onClick={onLeave} loading={pending}>
                Leave trip
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
