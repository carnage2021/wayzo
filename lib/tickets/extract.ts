import "server-only";
import type { TicketContent } from "@/lib/ai/parse-ticket";

export const TICKET_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;
export const MAX_TICKET_BYTES = 15 * 1024 * 1024;
export const MAX_FILES_PER_BATCH = 10;

/** Text shorter than this means a scanned PDF (images only), which goes to the free PDF parser instead. */
const MIN_TEXT_CHARS = 60;

/**
 * Turns an uploaded file into model input:
 * - text PDFs: extracted text (cheap, accurate, works on every model)
 * - scanned PDFs: the PDF itself, read by OpenRouter's free parser
 * - images: sent as images to a vision model
 */
export async function extractTicketContent(
  bytes: Uint8Array,
  mime: string,
  filename: string,
): Promise<TicketContent[]> {
  if (mime === "application/pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    try {
      const pdf = await getDocumentProxy(new Uint8Array(bytes));
      const { text } = await extractText(pdf, { mergePages: true });
      const clean = text
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      if (clean.length >= MIN_TEXT_CHARS) return [{ kind: "text", text: clean }];
    } catch (e) {
      console.warn("[tickets] pdf text extraction failed, sending PDF", e instanceof Error ? e.message : e);
    }
    return [{ kind: "pdf", base64: Buffer.from(bytes).toString("base64"), filename }];
  }
  return [
    {
      kind: "image",
      mime: mime === "image/heif" ? "image/heic" : mime,
      base64: Buffer.from(bytes).toString("base64"),
    },
  ];
}
