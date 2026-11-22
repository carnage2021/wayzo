import { Mail } from "lucide-react";
import { CopyButton } from "@/components/app/copy-button";
import { Tag } from "@/components/ui/chip";

/**
 * The trip's forwarding email (trip-<code>@<domain>). Email needs a domain we own, so until
 * NEXT_PUBLIC_INBOUND_EMAIL_DOMAIN is set this shows a "coming soon" note instead of an address.
 */
export function ForwardingAddress({ address }: { address: string | null }) {
  return (
    <div className="bg-mist flex flex-col gap-2 rounded-[18px] p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        <Mail className="text-blue size-4" aria-hidden /> Forward booking emails
        {!address && <Tag variant="mist">Coming soon</Tag>}
      </div>
      {address ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <code className="text-ink min-w-0 truncate text-[15px] font-semibold">{address}</code>
          <CopyButton value={address} label="Copy" />
        </div>
      ) : (
        <p className="text-muted text-[13px] leading-relaxed">
          Each trip gets its own email address to forward confirmations to. For now, upload the PDF or a
          screenshot instead.
        </p>
      )}
    </div>
  );
}
