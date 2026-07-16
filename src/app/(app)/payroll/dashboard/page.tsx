import { requireUser } from "@/lib/auth/session";
import { getApprovedUnpaidLeaveFlags, getPayrollDashboardStats, getPayrollList, currentMonthKey, formatMonth } from "@/lib/services/payroll";
import { hasPermission } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPKR, formatDatePK } from "@/lib/utils";
import { Banknote, TrendingUp, TrendingDown, Users, CheckCircle, Clock } from "lucide-react";
import { GeneratePayrollButton } from "@/components/payroll/generate-payroll-button";

export default async function PayrollDashboardPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const user = await requireUser("payroll:view");
  const sp = await searchParams;
  const month = sp.month ?? currentMonthKey();
  const canManage = hasPermission(user.role, "payroll:manage", user.permissions);

  const [stats, payrollList, unpaidLeaves] = await Promise.all([
    getPayrollDashboardStats(user, month),
    getPayrollList(user, month),
    getApprovedUnpaidLeaveFlags(user, month)
  ]);

  const statCards = [
    {
      label: "Total Payroll",
      value: formatPKR(stats.totalPayroll),
      hint: "Net salaries for the month",
      icon: Banknote,
      color: "text-primary bg-primary-soft"
    },
    {
      label: "Base Salaries",
      value: formatPKR(stats.totalBaseSalary),
      hint: "Before adjustments",
      icon: Users,
      color: "text-ink bg-surface-low"
    },
    {
      label: "Total Bonuses",
      value: formatPKR(stats.totalBonuses),
      hint: "Bonus adjustments this month",
      icon: TrendingUp,
      color: "text-success bg-success-soft"
    },
    {
      label: "Total Deductions",
      value: formatPKR(stats.totalDeductions),
      hint: "Deduction adjustments this month",
      icon: TrendingDown,
      color: "text-danger bg-danger-soft"
    },
    {
      label: "Paid",
      value: stats.paidCount.toString(),
      hint: "Salary slips marked as paid",
      icon: CheckCircle,
      color: "text-success bg-success-soft"
    },
    {
      label: "Pending",
      value: stats.generatedCount.toString(),
      hint: "Generated but not yet paid",
      icon: Clock,
      color: "text-warning bg-warning-soft"
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Payroll"
        title={`Payroll — ${formatMonth(month)}`}
        description="Monthly salary management, bonuses, deductions, and salary slips for all teaching staff."
        actions={
          canManage ? (
            <GeneratePayrollButton month={month} />
          ) : null
        }
      />

      {/* Month selector */}
      <form method="get" className="mb-6 flex items-center gap-2">
        <label className="text-sm font-semibold text-muted" htmlFor="month-select">Month</label>
        <input
          id="month-select"
          name="month"
          type="month"
          defaultValue={month}
          className="rounded-lg border border-outline/60 bg-surface-low px-3 py-2 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105">
          Apply
        </button>
      </form>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">{s.label}</span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="font-display text-xl font-bold text-ink">{s.value}</div>
                <p className="mt-0.5 text-xs text-muted">{s.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {canManage && unpaidLeaves.length ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Approved Unpaid Leave Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="font-label text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="py-3 pr-4">Employee</th>
                    <th className="py-3 pr-4">Dates</th>
                    <th className="py-3 pr-4">Days</th>
                    <th className="py-3 pr-4">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidLeaves.map((leave: any) => (
                    <tr key={`${leave.user_id}-${leave.start_date}`} className="border-t border-outline/60">
                      <td className="py-3 pr-4 font-semibold">{leave.full_name}</td>
                      <td className="py-3 pr-4 text-muted">{leave.start_date} to {leave.end_date}</td>
                      <td className="py-3 pr-4">{leave.leave_days}</td>
                      <td className="py-3 pr-4 text-muted">{leave.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Payroll Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Salary Slips — {formatMonth(month)}</CardTitle>
          <a href="/payroll/salary-slips" className="text-sm font-bold text-primary hover:underline">
            All Slips →
          </a>
        </CardHeader>
        <CardContent>
          {!payrollList.length ? (
            <EmptyState
              title="No payroll generated yet"
              description={canManage ? `Click "Generate Payroll" to create salary slips for ${formatMonth(month)}.` : "No payroll generated for this month."}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-low font-label text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Base Salary</th>
                    <th className="px-4 py-3">Bonus</th>
                    <th className="px-4 py-3">Deductions</th>
                    <th className="px-4 py-3">Net Salary</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollList.map((row: any) => (
                    <tr key={row.id} className="border-t border-outline/60 hover:bg-surface-low/70">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink">{row.teacher_name ?? "—"}</p>
                        <p className="text-xs text-muted">{row.teacher_email}</p>
                      </td>
                      <td className="px-4 py-4 font-mono font-semibold">{formatPKR(row.base_salary)}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
