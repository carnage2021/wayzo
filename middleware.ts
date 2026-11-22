import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/firebase/session";

const PROTECTED_PREFIXES = ["/trips", "/account", "/onboarding", "/admin"];

/**
 * Fast edge guard: no session cookie on an app route -> /login.
 * The cookie is fully verified (signature + revocation) in server code via `requireUser()`,
 * so a stale cookie still ends at /login, which then shows the form.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !request.cookies.has(SESSION_COOKIE)) {
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
