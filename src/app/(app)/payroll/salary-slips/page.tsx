import { requireUser } from "@/lib/auth/session";
import { getPayrollList, formatMonth, currentMonthKey } from "@/lib/services/payroll";
import { hasPermission } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPKR, formatDatePK } from "@/lib/utils";
import { MarkPaidButton } from "@/components/payroll/mark-paid-button";

export default async function SalarySlipsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const user = await requireUser("payroll:view");
  const sp = await searchParams;
  const month = sp.month ?? currentMonthKey();
  const canManage = hasPermission(user.role, "payroll:manage");
  const isTeacher = user.role === "teacher";

  const payrollList = await getPayrollList(user, month === "all" ? undefined : month);

  return (
    <>
      <PageHeader
        eyebrow="Payroll"
        title={isTeacher ? "My Salary Slips" : "All Salary Slips"}
        description={isTeacher ? "Your monthly salary records." : "Review and manage salary slips for all teachers."}
      />

      <form method="get" className="mb-6 flex items-center gap-2">
        <label className="text-sm font-semibold text-muted" htmlFor="slip-month">Month</label>
        <input
          id="slip-month"
          name="month"
          type="month"
          defaultValue={month === "all" ? undefined : month}
          className="rounded-lg border border-outline/60 bg-surface-low px-3 py-2 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105">Apply</button>
        <a href="?month=all" className="text-sm font-semibold text-primary hover:underline">All months</a>
      </form>

      {!payrollList.length ? (
        <EmptyState title="No salary slips found" description="No payroll records match the selected period." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-low font-label text-xs uppercase tracking-wide text-muted">
                  <tr>
                    {!isTeacher && <th className="px-4 py-3">Teacher</th>}
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3">Base Salary</th>
                    <th className="px-4 py-3">Bonus</th>
                    <th className="px-4 py-3">Deductions</th>
                    <th className="px-4 py-3">Net Salary</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment Date</th>
                    {canManage && <th className="px-4 py-3">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {payrollList.map((row: any) => (
                    <tr key={row.id} className="border-t border-outline/60 hover:bg-surface-low/50">
                      {!isTeacher && (
                        <td className="px-4 py-4">
                          <p className="font-semibold text-ink">{row.teacher_name ?? "—"}</p>
                          <p className="text-xs text-muted">{row.teacher_email}</p>
                        </td>
                      )}
                      <td className="px-4 py-4 font-semibold">{formatMonth(row.month)}</td>
                      <td className="px-4 py-4 font-mono">{formatPKR(row.base_salary)}</td>
                      <td className="px-4 py-4 text-success">{formatPKR(row.total_bonus)}</td>
                      <td className="px-4 py-4 text-danger">{formatPKR(row.total_deductions)}</td>
                      <td className="px-4 py-4 font-bold text-ink">{formatPKR(row.net_salary)}</td>
                      <td className="px-4 py-4">
                        <Badge tone={row.status === "paid" ? "green" : "blue"}>
                          {row.status === "paid" ? "Paid" : "Generated"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {row.payment_date ? formatDatePK(row.payment_date) : "—"}
                      </td>
                      {canManage && (
                        <td className="px-4 py-4">
                          {row.status === "generated" && (
                            <MarkPaidButton payrollId={row.id} />
                          )}
                        </td>
                      )}
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
