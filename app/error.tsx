"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      void import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
    } else {
      console.error(error);
    }
  }, [error]);

  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="font-display text-blue text-6xl font-extrabold">Oops.</span>
      <h1 className="font-display text-3xl leading-tight font-extrabold">
        Something went wrong on our side.
      </h1>
      <p className="text-muted max-w-md">
        Try again. If it keeps happening, email hello@wayzo.app
        {error.digest ? ` with code ${error.digest}` : ""}.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
