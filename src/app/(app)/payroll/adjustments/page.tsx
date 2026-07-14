import { requireUser } from "@/lib/auth/session";
import { getSalaryAdjustments, currentMonthKey } from "@/lib/services/payroll";
import { hasPermission } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPKR, formatDatePK } from "@/lib/utils";
import { AddAdjustmentDialog } from "@/components/payroll/add-adjustment-dialog";

export default async function AdjustmentsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const user = await requireUser("payroll:view");
  const sp = await searchParams;
  const month = sp.month ?? currentMonthKey();
  const canManage = hasPermission(user.role, "payroll:manage");

  const adjustments = await getSalaryAdjustments(user, undefined, month);

  return (
    <>
      <PageHeader
        eyebrow="Payroll"
        title="Salary Adjustments"
        description="Manage bonuses and deductions applied to teacher salaries before payroll generation."
        actions={canManage ? <AddAdjustmentDialog month={month} /> : null}
      />

      <form method="get" className="mb-6 flex items-center gap-2">
        <label className="text-sm font-semibold text-muted" htmlFor="adj-month">Month</label>
        <input
          id="adj-month"
          name="month"
          type="month"
          defaultValue={month}
          className="rounded-lg border border-outline/60 bg-surface-low px-3 py-2 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105">Apply</button>
      </form>

      {!adjustments.length ? (
        <EmptyState
          title="No adjustments found"
          description={canManage ? "Add bonuses or deductions before generating payroll." : "No salary adjustments for this month."}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-low font-label text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Effective Date</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustments.map((adj: any) => (
                    <tr key={adj.id} className="border-t border-outline/60 hover:bg-surface-low/50">
                      <td className="px-4 py-4 font-semibold text-ink">{adj.teacher_name ?? "—"}</td>
                      <td className="px-4 py-4">
                        <Badge tone={adj.type === "bonus" ? "green" : "red"}>
                          {adj.type === "bonus" ? "Bonus" : "Deduction"}
                        </Badge>
                      </td>
                      <td className={`px-4 py-4 font-semibold ${adj.type === "bonus" ? "text-success" : "text-danger"}`}>
                        {adj.type === "deduction" ? "-" : "+"}{formatPKR(adj.amount)}
                      </td>
                      <td className="px-4 py-4 text-muted">{adj.reason}</td>
                      <td className="px-4 py-4 text-muted">{formatDatePK(adj.effective_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
