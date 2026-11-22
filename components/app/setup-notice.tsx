import Link from "next/link";
import { Database } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** Shown in place of auth/app screens until the Firebase env vars are set. */
export function SetupNotice() {
  return (
    <div className="flex flex-col gap-6">
      <span className="bg-lime text-ink inline-flex size-14 items-center justify-center rounded-[18px]">
        <Database className="size-6" aria-hidden />
      </span>
      <div>
        <div className="eyebrow text-blue">Setup needed</div>
        <h1 className="font-display mt-3 text-[34px] leading-[1.05] font-extrabold">
          Connect Firebase to sign in
        </h1>
        <p className="text-muted mt-3 text-base leading-[1.6]">
          Accounts and trips are stored in Firebase. Add these to{" "}
          <code className="text-ink font-semibold">.env.local</code> and restart the dev server:
        </p>
      </div>
      <pre className="bg-ink text-lime overflow-x-auto rounded-[18px] p-5 text-[13px] leading-relaxed">
        {`NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
FIREBASE_SERVICE_ACCOUNT_KEY='{...}'`}
      </pre>
      <p className="text-muted text-sm leading-relaxed">
        Then deploy the rules in <code className="text-ink font-semibold">firebase/</code> (see README).
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Back to home
      </Link>
    </div>
  );
}
