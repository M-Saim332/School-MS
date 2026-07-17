"use client";

import { useState, useTransition } from "react";
import { createAdjustmentAction } from "@/app/(app)/finance/payroll/actions";
import type { AdjustmentType } from "@/types/database";

interface Props {
  month: string;
}

export function AddAdjustmentDialog({ month }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    teacher_id: "",
    amount: "",
    type: "bonus" as AdjustmentType,
    reason: "",
    effective_date: `${month}-01`
  });

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.teacher_id || !form.amount || !form.reason) {
      setError("Please fill in all required fields.");
      return;
    }
    startTransition(async () => {
      const res = await createAdjustmentAction({
        teacher_id: form.teacher_id,
        amount: Number(form.amount),
        type: form.type,
        reason: form.reason,
        effective_date: form.effective_date
      });
      if (res.error) {
        setError(res.error);
      } else {
        setOpen(false);
        window.location.reload();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-soft hover:brightness-105"
      >
        Add Adjustment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-[0_32px_80px_rgba(27,28,29,0.18)]">
            <h2 className="mb-4 font-display text-xl font-bold text-ink">Add Salary Adjustment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-ink">
                  Teacher ID <span className="text-danger">*</span>
                </label>
                <input
                  value={form.teacher_id}
                  onChange={(e) => handleChange("teacher_id", e.target.value)}
                  placeholder="Teacher UUID"
                  className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="mt-0.5 text-xs text-muted">Copy from Staff → Teachers page</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="bonus">Bonus</option>
                    <option value="deduction">Deduction</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink">
                    Amount (PKR) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    placeholder="5000"
                    className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-ink">
                  Reason <span className="text-danger">*</span>
                </label>
                <input
                  value={form.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  placeholder="e.g. Performance bonus, Late attendance deduction"
                  className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-ink">Effective Date</label>
                <input
                  type="date"
                  value={form.effective_date}
                  onChange={(e) => handleChange("effective_date", e.target.value)}
                  className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {error && <p className="text-sm font-semibold text-danger">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-outline/60 px-4 py-2 text-sm font-semibold text-muted hover:bg-surface-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
                >
                  {isPending ? "Saving…" : "Save Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
