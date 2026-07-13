"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFriendlyErrorMessage } from "@/lib/errors";

export default function AppError({
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
    <Card>
      <CardHeader>
        <div>
          <p className="font-label text-xs font-bold uppercase tracking-[0.16em] text-danger">Something needs attention</p>
          <CardTitle>We could not finish that action</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{getFriendlyErrorMessage(error)}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>Try again</Button>
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>Go back</Button>
        </div>
      </CardContent>
    </Card>
  );
}
