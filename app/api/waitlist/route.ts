import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { emailKey } from "@/lib/firebase/convert";
import { sendEmail, waitlistConfirmationEmail } from "@/lib/notifications/email";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { waitlistSchema } from "@/lib/validation/schemas";

const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

/**
 * POST /api/waitlist  { email, travels_with, source }
 * - 5 requests / minute / IP
 * - duplicates return success without a second row (and without a second email)
 */
export async function POST(request: NextRequest) {
  const rl = limiter(clientIp(request.headers));
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  const json: unknown = await request.json().catch(() => null);
  const parsed = waitlistSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }
  const { email, travels_with, source } = parsed.data;

  const db = adminDb();
  if (!db) {
    // Local dev without Firebase: accept so the landing page can be demoed end-to-end.
    if (process.env.NODE_ENV === "production") {
      console.error("[waitlist] Firebase Admin credentials missing");
      return NextResponse.json({ ok: false, error: "Waitlist is temporarily unavailable." }, { status: 503 });
    }
    console.info(`[waitlist:dev] ${email} (${travels_with}) source=${source ?? "-"}`);
    return NextResponse.json({ ok: true });
  }

  // Doc id = hash of the email, and create() fails if it exists: duplicates are a no-op.
  let isNew = true;
  try {
    await db
      .collection("waitlist")
      .doc(emailKey(email))
      .create({
        email,
        travels_with,
        source: source ?? null,
        invited_at: null,
        created_at: FieldValue.serverTimestamp(),
      });
  } catch (e) {
    if ((e as { code?: number }).code === 6) {
      isNew = false; // ALREADY_EXISTS
    } else {
      console.error("[waitlist] insert failed", e instanceof Error ? e.message : e);
      return NextResponse.json(
        { ok: false, error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }
  }

  // Only email new sign-ups.
  if (isNew) {
    await sendEmail(waitlistConfirmationEmail(email)).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}
