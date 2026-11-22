import { NextResponse, type NextRequest } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth/server";

/** Better Auth endpoints: /api/auth/sign-in/email, /sign-up/email, /get-session, /callback/google, ... */
function handlers() {
  const auth = getAuth();
  return auth ? toNextJsHandler(auth) : null;
}

const notConfigured = () => NextResponse.json({ error: "Sign-in isn't configured yet." }, { status: 503 });

export async function GET(request: NextRequest) {
  const h = handlers();
  return h ? h.GET(request) : notConfigured();
}

export async function POST(request: NextRequest) {
  const h = handlers();
  return h ? h.POST(request) : notConfigured();
}
