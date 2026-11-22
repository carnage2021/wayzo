import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { verifySignedToken } from "@/lib/signed-token";

type Payload = { uid: string; rid: string; email: string };

/** GET /auth/verify-email?token=… — marks an extra email verified (token is HMAC-signed, 24h). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const secret = process.env.APP_SECRET;
  const db = adminDb();
  const payload = secret ? verifySignedToken<Payload>(url.searchParams.get("token") ?? "", secret) : null;

  if (!payload || !db || !/^[a-f0-9]{64}$/.test(payload.rid)) {
    return NextResponse.redirect(new URL("/account?email_verified=0", url));
  }

  const ref = db.collection("userEmails").doc(payload.rid);
  const verified = await db
    .runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const matches =
        snap.exists &&
        snap.get("user_id") === payload.uid &&
        snap.get("email") === payload.email &&
        !snap.get("verified_at");
      if (matches) tx.update(ref, { verified_at: FieldValue.serverTimestamp() });
      return matches;
    })
    .catch(() => false);

  return NextResponse.redirect(new URL(`/account?email_verified=${verified ? "1" : "0"}`, url));
}
