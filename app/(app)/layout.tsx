import type { Metadata } from "next";
import { SetupNotice } from "@/components/app/setup-notice";
import { requireUser } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/env";

export const metadata: Metadata = { robots: { index: false, follow: false } };
// Per-user pages: never prerender, always read the session.
export const dynamic = "force-dynamic";

/** Everything under (app) requires a signed-in user (middleware also guards). */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isFirebaseConfigured()) {
    return (
      <div className="bg-canvas flex min-h-dvh items-center justify-center px-6 py-16">
        <div className="shadow-soft w-full max-w-[460px] rounded-[28px] bg-white p-8">
          <SetupNotice />
        </div>
      </div>
    );
  }
  await requireUser();
  return <div className="bg-canvas text-ink min-h-dvh">{children}</div>;
}
