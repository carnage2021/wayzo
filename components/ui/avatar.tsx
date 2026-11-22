/* eslint-disable @next/next/no-img-element -- avatars come from arbitrary OAuth hosts */
import * as React from "react";
import { avatarFill, cn, initials } from "@/lib/utils";

export type AvatarPerson = { id: string; name: string | null; avatar_url?: string | null };

/** 28–32px circle with a 2px surface-coloured border. */
export function Avatar({
  person,
  size = 32,
  ringClassName = "border-white",
  className,
}: {
  person: AvatarPerson;
  size?: number;
  ringClassName?: string;
  className?: string;
}) {
  const label = person.name ?? "Traveller";
  return (
    <span
      title={label}
      className={cn(
        "text-ink relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 font-bold",
        ringClassName,
        className,
      )}
      style={{
        width: size,
        height: size,
        background: avatarFill(person.id),
        fontSize: Math.round(size * 0.36),
      }}
    >
      {person.avatar_url ? (
        <img src={person.avatar_url} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <span aria-hidden>{initials(person.name)}</span>
      )}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Overlapping avatars (−8px) with a "+N" overflow bubble. */
export function AvatarStack({
  people,
  max = 3,
  size = 28,
  ringClassName,
  className,
}: {
  people: AvatarPerson[];
  max?: number;
  size?: number;
  ringClassName?: string;
  className?: string;
}) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className={cn("flex", className)}>
      {shown.map((p, i) => (
        <Avatar
          key={p.id}
          person={p}
          size={size}
          ringClassName={ringClassName}
          className={i > 0 ? "-ml-2" : ""}
        />
      ))}
      {extra > 0 && (
        <span
          className={cn(
            "bg-ink -ml-2 inline-flex items-center justify-center rounded-full border-2 text-[10px] font-bold text-white",
            ringClassName ?? "border-white",
          )}
          style={{ width: size, height: size }}
          aria-label={`${extra} more`}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
