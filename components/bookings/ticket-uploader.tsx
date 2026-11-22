"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, Check, FileUp, Loader2, ScanLine, Upload } from "lucide-react";
import { deleteBooking, extendTripDates } from "@/app/(app)/trips/[tripId]/bookings/actions";
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
import { uploadFiles } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { shortDate } from "./booking-meta";

const ACCEPT = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_FILES = 10;

type ItemStatus = "uploading" | "reading" | "done" | "review" | "duplicate" | "skipped" | "error";
type Item = { key: string; name: string; status: ItemStatus; progress: number; message?: string };

type ProcessResponse =
  | {
      ok: true;
      notTravel: boolean;
      added: { id: string; title: string; type: string; status: "confirmed" | "needs_review" }[];
      duplicates: string[];
      extend: { start: string; end: string } | null;
      autofilled: boolean;
    }
  | { ok: false; error: string };

function mimeOf(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "heic" || ext === "heif" ? "image/heic" : ext === "pdf" ? "application/pdf" : "";
}

/** iPhone photos (HEIC) become JPEG in the browser; AI vision models don't read HEIC. */
async function normalise(file: File): Promise<File> {
  const type = mimeOf(file);
  if (type !== "image/heic" && type !== "image/heif") return file;
  const heic2any = (await import("heic2any")).default;
  const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(out) ? out[0]! : out;
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
}

export function TicketUploader({
  tripId,
  isOwner,
  compact = false,
}: {
  tripId: string;
  isOwner: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [extend, setExtend] = useState<{ start: string; end: string } | null>(null);
  const [extending, setExtending] = useState(false);

  const update = (key: string, patch: Partial<Item>) =>
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  function announce(res: Extract<ProcessResponse, { ok: true }>) {
    for (const b of res.added) {
      if (b.status === "confirmed") {
        toast.success(`Added ${b.title}`, {
          duration: 10_000,
          action: {
            label: "Undo",
            onClick: async () => {
              const r = await deleteBooking(tripId, b.id);
              if (r.ok) {
                toast(`Removed ${b.title}`);
                router.refresh();
              } else toast.error(r.error);
            },
          },
        });
      } else {
        toast(`${b.title} needs a quick check`, { description: "We highlighted what to confirm." });
      }
    }
    for (const d of res.duplicates) toast(`Already in this trip`, { description: d });
    if (res.autofilled) toast.success("Trip dates and destination filled in from your tickets");
  }

  async function handle(files: File[]) {
    if (!files.length || busy) return;
    const picked = files.slice(0, MAX_FILES);
    if (files.length > MAX_FILES)
      toast.error(`Up to ${MAX_FILES} files at a time. We took the first ${MAX_FILES}.`);
    const valid = picked.filter((f) => ACCEPT.includes(mimeOf(f)) && f.size <= MAX_BYTES);
    const rejected = picked.length - valid.length;
    if (rejected)
      toast.error(
        `${rejected} file${rejected > 1 ? "s" : ""} skipped: use PDF, JPG, PNG, HEIC or WEBP up to 15 MB.`,
      );
    if (!valid.length) return;

    setBusy(true);
    const batch: Item[] = valid.map((f, i) => ({
      key: `${Date.now()}-${i}`,
      name: f.name,
      status: "uploading",
      progress: 0,
    }));
    setItems((list) => [...batch, ...list].slice(0, 20));

    let ready: File[];
    try {
      ready = await Promise.all(valid.map(normalise));
    } catch {
      batch.forEach((b) =>
        update(b.key, { status: "error", message: "Couldn't read this photo. Try a screenshot." }),
      );
      setBusy(false);
      return;
    }

    let anyAdded = false;
    let extendRange: { start: string; end: string } | null = null;
    // Two at a time: uploads are quick, reading takes 15–40 s each on free models.
    const queue = ready.map((file, i) => ({ file, item: batch[i]! }));
    const worker = async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        const { file, item } = job;
        try {
          // Straight to UploadThing; the server checks trip membership and records the file.
          const [uploaded] = await uploadFiles("ticket", {
            files: [file],
            input: { tripId },
            onUploadProgress: ({ progress }) => update(item.key, { progress: Math.round(progress) }),
          });
          if (!uploaded) throw new Error("upload");
          update(item.key, { status: "reading", progress: 100 });
          const res = await fetch(`/api/trips/${tripId}/tickets/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: uploaded.key }),
          });
          const data = (await res.json()) as ProcessResponse;
          if (!data.ok) {
            update(item.key, { status: "error", message: data.error });
            continue;
          }
          if (data.notTravel) {
            update(item.key, { status: "skipped", message: "This doesn't look like a booking." });
            continue;
          }
          announce(data);
          if (data.added.length) anyAdded = true;
          if (data.extend) {
            extendRange = extendRange
              ? {
                  start: data.extend.start < extendRange.start ? data.extend.start : extendRange.start,
                  end: data.extend.end > extendRange.end ? data.extend.end : extendRange.end,
                }
              : data.extend;
          }
          const review = data.added.filter((a) => a.status === "needs_review").length;
          update(item.key, {
            status: data.added.length === 0 ? "duplicate" : review ? "review" : "done",
            message:
              data.added.length === 0
                ? "Already in this trip"
                : `${data.added.map((a) => a.title).join(", ")}${review ? " · needs a check" : ""}`,
          });
        } catch {
          update(item.key, {
            status: "error",
            message: "Upload failed. Check your connection and try again.",
          });
        }
      }
    };
    await Promise.all([worker(), worker()]);
    setBusy(false);
    if (anyAdded) router.refresh();
    if (extendRange && isOwner) setExtend(extendRange);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    void handle(Array.from(e.dataTransfer.files));
  }

  async function confirmExtend() {
    if (!extend) return;
    setExtending(true);
    const r = await extendTripDates(tripId, extend.start, extend.end);
    setExtending(false);
    setExtend(null);
    if (r.ok) {
      toast.success("Trip dates updated");
      router.refresh();
    } else toast.error(r.error);
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          "bg-canvas flex flex-col items-center gap-3 rounded-[22px] border-[1.5px] border-dashed border-[#B9C2D3] px-5 text-center transition-colors",
          compact ? "py-7" : "py-10",
          over && "border-blue bg-[#EEF1FF]",
        )}
      >
        <span className="bg-lime text-ink inline-flex size-12 items-center justify-center rounded-[14px]">
          {busy ? (
            <Loader2 className="size-[22px] animate-spin" aria-hidden />
          ) : (
            <Upload className="size-[22px]" aria-hidden />
          )}
        </span>
        <div className="font-semibold">{busy ? "Reading your tickets…" : "Drop tickets here"}</div>
        <div className="text-subtle text-[13px]">
          PDF, screenshot or photo · up to 15 MB each, 10 at a time
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="ink" onClick={() => input.current?.click()} disabled={busy}>
            <FileUp className="size-4" aria-hidden /> Choose files
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="sm:hidden"
            onClick={() => camera.current?.click()}
            disabled={busy}
          >
            <Camera className="size-4" aria-hidden /> Take photo
          </Button>
        </div>
        <input
          ref={input}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/*"
          className="sr-only"
          aria-label="Upload tickets"
          onChange={(e) => {
            void handle(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <input
          ref={camera}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          aria-label="Take a photo of a ticket"
          onChange={(e) => {
            void handle(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {items.map((i) => (
            <li
              key={i.key}
              className="border-soft-line flex items-center gap-3 rounded-[16px] border bg-white px-3.5 py-3"
            >
              <span
                className={cn(
                  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl",
                  i.status === "done" && "text-success bg-[#E7F8EE]",
                  i.status === "review" && "bg-lime text-ink",
                  (i.status === "uploading" || i.status === "reading") && "text-blue bg-[#EEF1FF]",
                  (i.status === "duplicate" || i.status === "skipped") && "bg-mist text-muted",
                  i.status === "error" && "text-error bg-[#FEF3F2]",
                )}
              >
                {i.status === "uploading" && <Upload className="size-4" aria-hidden />}
                {i.status === "reading" && <ScanLine className="size-4 animate-pulse" aria-hidden />}
                {(i.status === "done" || i.status === "duplicate") && (
                  <Check className="size-4" aria-hidden />
                )}
                {(i.status === "review" || i.status === "skipped" || i.status === "error") && (
                  <AlertCircle className="size-4" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{i.name}</div>
                <div className="text-subtle truncate text-[13px]">
                  {i.status === "uploading" && `Uploading… ${i.progress}%`}
                  {i.status === "reading" && "Reading the ticket… this can take up to a minute"}
                  {i.message && i.status !== "uploading" && i.status !== "reading" && i.message}
                </div>
                {i.status === "uploading" && (
                  <div className="bg-mist mt-1.5 h-1.5 overflow-hidden rounded-full">
                    <div
                      className="bg-blue h-full rounded-full transition-[width]"
                      style={{ width: `${i.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={Boolean(extend)} onOpenChange={(o) => !o && setExtend(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend trip to include this?</DialogTitle>
            <DialogDescription>
              {extend &&
                `These tickets run from ${shortDate(extend.start)} to ${shortDate(extend.end)}, outside the trip dates.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtend(null)}>
              Keep dates
            </Button>
            <Button onClick={confirmExtend} loading={extending}>
              Extend trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
