"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label = "Copy",
  className,
  tone = "light",
}: {
  value: string;
  label?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy. Select the text and copy it manually.");
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition-all hover:-translate-y-0.5",
        tone === "light" ? "bg-ink text-white" : "bg-lime text-ink",
        className,
      )}
      aria-label={`${label}: ${value}`}
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copied ? "Copied" : label}
    </button>
  );
}
