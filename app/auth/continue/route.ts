import { NextResponse, type NextRequest } from "next/server";
import { getProfile, getUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/utils";

/** After sign-in/sign-up: new users answer the onboarding questions first, everyone else goes to `next`. */
export async function GET(request: NextRequest) {
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const user = await getUser();
  if (!user) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, request.url));
  const profile = await getProfile(user.id);
  const dest = profile?.onboarded_at ? next : `/onboarding?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(new URL(dest, request.url));
}
