import { NextResponse, type NextRequest } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import { waitlist } from "@/lib/db/schema";
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

  if (!isDbConfigured()) {
    // Local dev without a database: accept so the landing page can be demoed end-to-end.
    if (process.env.NODE_ENV === "production") {
      console.error("[waitlist] DATABASE_URL missing");
      return NextResponse.json({ ok: false, error: "Waitlist is temporarily unavailable." }, { status: 503 });
    }
    console.info(`[waitlist:dev] ${email} (${travels_with}) source=${source ?? "-"}`);
    return NextResponse.json({ ok: true });
  }

  // Unique email: a duplicate sign-up inserts nothing (and gets no second email).
  let isNew = false;
  try {
    const rows = await db()
      .insert(waitlist)
      .values({ email, travelsWith: travels_with, source: source ?? null })
      .onConflictDoNothing()
      .returning({ id: waitlist.id });
    isNew = rows.length > 0;
  } catch (e) {
    console.error("[waitlist] insert failed", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  // Only email new sign-ups.
  if (isNew) {
    await sendEmail(waitlistConfirmationEmail(email)).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}
