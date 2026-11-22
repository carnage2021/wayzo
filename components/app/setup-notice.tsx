import Link from "next/link";
import { Database } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** Shown in place of auth/app screens until the database and auth env vars are set. */
export function SetupNotice() {
  return (
    <div className="flex flex-col gap-6">
      <span className="bg-lime text-ink inline-flex size-14 items-center justify-center rounded-[18px]">
        <Database className="size-6" aria-hidden />
      </span>
      <div>
        <div className="eyebrow text-blue">Setup needed</div>
        <h1 className="font-display mt-3 text-[34px] leading-[1.05] font-extrabold">
          Connect the database to sign in
        </h1>
        <p className="text-muted mt-3 text-base leading-[1.6]">
          Logins are stored in MongoDB and trips in Neon Postgres. Add these to{" "}
          <code className="text-ink font-semibold">.env.local</code> and restart the dev server:
        </p>
      </div>
      <pre className="bg-ink text-lime overflow-x-auto rounded-[18px] p-5 text-[13px] leading-relaxed">
        {`DATABASE_URL=postgresql://...
MONGODB_URI=mongodb+srv://...
BETTER_AUTH_SECRET=...`}
      </pre>
      <p className="text-muted text-sm leading-relaxed">
        Then run <code className="text-ink font-semibold">pnpm db:migrate</code> (see README).
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Back to home
      </Link>
    </div>
  );
}
