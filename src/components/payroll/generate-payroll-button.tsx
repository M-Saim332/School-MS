"use client";

import { useState, useTransition } from "react";
import { generatePayrollAction } from "@/app/(app)/payroll/actions";

export function GeneratePayrollButton({ month }: { month: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleGenerate() {
    setMessage(null);
    startTransition(async () => {
      const result = await generatePayrollAction(month);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Payroll generated successfully!" });
        // Refresh page after success
        setTimeout(() => window.location.reload(), 1200);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={handleGenerate}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-soft hover:brightness-105 disabled:opacity-60"
      >
        {isPending ? "Generating…" : "Generate Payroll"}
      </button>
      {message && (
        <p className={`text-xs font-semibold ${message.type === "error" ? "text-danger" : "text-success"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
