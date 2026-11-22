import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/firebase/session";

/**
 * POST-only so a link prefetch or crawler can't sign people out.
 * Clears this browser's session; other devices stay signed in.
 */
export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
