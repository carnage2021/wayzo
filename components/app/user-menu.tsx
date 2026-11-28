"use client";

import { useRef } from "react";
import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import { LogOut, Plane, UserRound } from "lucide-react";
import { Avatar, type AvatarPerson } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const item =
  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink outline-none transition-colors data-[highlighted]:bg-mist";

export function UserMenu({
  person,
  email,
  tone = "dark",
  align = "end",
  side = "bottom",
  showName = false,
}: {
  person: AvatarPerson;
  email: string;
  tone?: "dark" | "light";
  align?: "start" | "end";
  side?: "top" | "bottom";
  showName?: boolean;
}) {
  const signOutForm = useRef<HTMLFormElement>(null);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          "focus-visible:ring-lime flex items-center gap-3 rounded-full p-1 text-left transition-colors outline-none focus-visible:ring-2",
          tone === "dark" ? "hover:bg-white/[.08]" : "hover:bg-mist",
          showName && "w-full rounded-2xl p-2",
        )}
        aria-label="Account menu"
      >
        <Avatar person={person} size={36} ringClassName={tone === "dark" ? "border-ink" : "border-white"} />
        {showName && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">{person.name ?? "You"}</span>
            <span className="text-muted-dark block truncate text-xs">{email}</span>
          </span>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          side={side}
          sideOffset={10}
          className="border-soft-line shadow-card z-50 w-64 rounded-[20px] border bg-white p-2 data-[state=open]:animate-[fade-in_.15s_ease]"
        >
          <div className="px-3 pt-2 pb-3">
            <div className="truncate text-[15px] font-semibold">{person.name ?? "Traveller"}</div>
            <div className="text-subtle truncate text-[13px]">{email}</div>
          </div>
          <DropdownMenu.Separator className="bg-soft-line mx-1 mb-1 h-px" />
          <DropdownMenu.Item asChild className={item}>
            <Link href="/trips">
              <Plane className="text-subtle size-[18px]" aria-hidden /> My trips
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={item}>
            <Link href="/account">
              <UserRound className="text-subtle size-[18px]" aria-hidden /> Account
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="bg-soft-line mx-1 my-1 h-px" />
          {/* Submit from onSelect: Radix closes (and unmounts) the menu on select, which would drop a plain submit. */}
          <form ref={signOutForm} action="/auth/signout" method="post">
            <DropdownMenu.Item
              asChild
              className={item}
              onSelect={(e) => {
                e.preventDefault();
                signOutForm.current?.requestSubmit();
              }}
            >
              <button type="submit">
                <LogOut className="text-subtle size-[18px]" aria-hidden /> Sign out
              </button>
            </DropdownMenu.Item>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
