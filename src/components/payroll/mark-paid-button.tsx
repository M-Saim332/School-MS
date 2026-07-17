"use client";

import { useState, useTransition } from "react";
import { markPayrollPaidAction } from "@/app/(app)/finance/payroll/actions";

export function MarkPaidButton({ payrollId }: { payrollId: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) return <span className="text-xs font-semibold text-success">Marked Paid ✓</span>;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await markPayrollPaidAction(payrollId);
          if (res.ok) setDone(true);
        })
      }
      className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 disabled:opacity-60"
    >
      {isPending ? "…" : "Mark Paid"}
    </button>
  );
}
