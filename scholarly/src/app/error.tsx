"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getFriendlyErrorMessage } from "@/lib/errors";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
      <div className="card-surface rounded-xl p-6 shadow-soft">
        <p className="font-label text-xs font-bold uppercase tracking-[0.16em] text-danger">Something needs attention</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">We could not finish that action</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{getFriendlyErrorMessage(error)}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>Try again</Button>
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>Go back</Button>
        </div>
      </div>
    </main>
  );
}
