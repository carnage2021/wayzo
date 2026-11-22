import { NextResponse, type NextRequest } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { userEmails } from "@/lib/db/schema";
import { verifySignedToken } from "@/lib/signed-token";
import { UUID_RE } from "@/lib/trips/queries";

type Payload = { uid: string; rid: string; email: string };

/** GET /auth/verify-email?token=… — marks an extra email verified (token is HMAC-signed, 24h). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const secret = process.env.APP_SECRET;
  const payload = secret ? verifySignedToken<Payload>(url.searchParams.get("token") ?? "", secret) : null;

  if (!payload || !isDbConfigured() || !UUID_RE.test(payload.rid)) {
    return NextResponse.redirect(new URL("/account?email_verified=0", url));
  }

  const updated = await db()
    .update(userEmails)
    .set({ verifiedAt: new Date() })
    .where(
      and(
        eq(userEmails.id, payload.rid),
        eq(userEmails.userId, payload.uid),
        eq(userEmails.email, payload.email),
        isNull(userEmails.verifiedAt),
      ),
    )
    .returning({ id: userEmails.id })
    .catch(() => []);

  return NextResponse.redirect(new URL(`/account?email_verified=${updated.length ? "1" : "0"}`, url));
}
