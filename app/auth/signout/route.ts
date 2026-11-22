import { NextResponse, type NextRequest } from "next/server";
import { getAuth } from "@/lib/auth/server";

/** POST-only so a link prefetch or crawler can't sign people out. Ends this browser's session. */
export async function POST(request: NextRequest) {
  const out = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  const auth = getAuth();
  if (auth) {
    try {
      const res = await auth.api.signOut({ headers: request.headers, asResponse: true });
      for (const cookie of res.headers.getSetCookie()) out.headers.append("set-cookie", cookie);
    } catch {
      /* already signed out */
    }
  }
  return out;
}
