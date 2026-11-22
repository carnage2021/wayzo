import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Fast edge guard: no session cookie on an app route -> /login.
 * The session itself is verified in server code via `requireUser()`, so a stale
 * cookie still ends at /login, which then shows the form.
 */
export function middleware(request: NextRequest) {
  if (!getSessionCookie(request, { cookiePrefix: "wayzo" })) {
    const { pathname, search } = request.nextUrl;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/trips/:path*", "/account/:path*", "/onboarding/:path*", "/admin/:path*"],
};
