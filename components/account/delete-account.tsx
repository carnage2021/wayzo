"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/(app)/(shell)/account/actions";
import { Button } from "@/components/ui/button";
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

export function DeleteAccount() {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onConfirm() {
    start(async () => {
      const res = await deleteAccount(text);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <Dialog onOpenChange={() => (setText(""), setError(null))}>
      <DialogTrigger asChild>
        <Button variant="danger" className="self-start">
          Delete account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            Your profile and data are deleted and you&apos;re removed from every trip. Trips you own pass to
            the longest-standing member, or are deleted if you&apos;re the only one. This can&apos;t be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-delete">
            Type <b>DELETE</b> to confirm
          </Label>
          <Input
            id="confirm-delete"
            value={text}
            autoComplete="off"
            invalid={Boolean(error)}
            onChange={(e) => setText(e.target.value)}
          />
          <FieldError>{error}</FieldError>
        </div>
        <DialogFooter>
          <Button variant="danger" onClick={onConfirm} loading={pending} disabled={text.trim() !== "DELETE"}>
            Delete my account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
