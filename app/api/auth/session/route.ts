import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { emailKey } from "@/lib/firebase/convert";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/firebase/session";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

const schema = z.object({ idToken: z.string().min(20).max(4096) });
const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

/** Only accept requests made by our own pages (CSRF guard for a cookie-setting endpoint). */
function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

/**
 * POST /api/auth/session { idToken }
 * Verifies a fresh Firebase ID token, sets the httpOnly session cookie and makes
 * sure the user's profile exists. Returns { onboarded } so the client knows where to go.
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!limiter(clientIp(request.headers)).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const auth = adminAuth();
  const db = adminDb();
  if (!auth || !db) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  let decoded;
  try {
    decoded = await auth.verifyIdToken(parsed.data.idToken, true);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  // Only mint sessions for sign-ins that just happened.
  if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
    return NextResponse.json({ error: "Sign in again" }, { status: 401 });
  }

  const sessionCookie = await auth.createSessionCookie(parsed.data.idToken, {
    expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
  });

  // First sign-in: create the profile and register the sign-in email.
  const userRef = db.collection("users").doc(decoded.uid);
  const email = decoded.email?.toLowerCase() ?? null;
  const onboarded = await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const emailRef = email ? db.collection("userEmails").doc(emailKey(email)) : null;
    const emailSnap = emailRef ? await tx.get(emailRef) : null;

    if (!snap.exists) {
      tx.set(userRef, {
        email,
        name: (decoded.name as string | undefined) ?? null,
        avatar_url: decoded.picture ?? null,
        home_city: null,
        currency: "USD",
        food_pref: null,
        timezone: null,
        is_admin: false,
        onboarded_at: null,
        email_notifications: true,
        push_notifications: false,
        created_at: FieldValue.serverTimestamp(),
      });
    } else if (email && snap.get("email") !== email) {
      tx.update(userRef, { email });
    }

    // Claim the email unless another account already verified it.
    if (emailRef && email && decoded.email_verified) {
      const owner = emailSnap?.get("user_id") as string | undefined;
      const verifiedElsewhere = owner && owner !== decoded.uid && emailSnap?.get("verified_at");
      if (!verifiedElsewhere && owner !== decoded.uid) {
        tx.set(emailRef, {
          user_id: decoded.uid,
          email,
          primary: true,
          verified_at: FieldValue.serverTimestamp(),
          created_at: FieldValue.serverTimestamp(),
        });
      }
    }
    return Boolean(snap.exists && snap.get("onboarded_at"));
  });

  const res = NextResponse.json({ onboarded });
  res.cookies.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
