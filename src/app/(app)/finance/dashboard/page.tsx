import { requireUser } from "@/lib/auth/session";
import { getFinanceDashboard } from "@/lib/services/finance";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OutstandingByClassChart, CollectionMethodChart } from "@/components/finance/finance-dashboard-charts";
import Link from "next/link";
import { Wallet, ArrowDownCircle, Percent, ClipboardList, AlertCircle, Banknote } from "lucide-react";
import { formatPKR, formatDatePK } from "@/lib/utils";

export default async function FinanceDashboardPage() {
  const user = await requireUser("finance:view");
  const data = await getFinanceDashboard(user);

  const stats = [
    {
      label: "Total Expected Fees",
      value: formatPKR(data.totalExpected),
      description: "Aggregated academic fee structures",
      icon: Banknote,
      color: "text-primary bg-primary-soft"
    },
    {
      label: "Collected Fees",
      value: formatPKR(data.totalCollected),
      description: "Total payments recorded to date",
      icon: Wallet,
      color: "text-success bg-success-soft"
    },
    {
      label: "Outstanding Fees",
      value: formatPKR(data.totalOutstanding),
      description: "Remaining unpaid invoices",
      icon: AlertCircle,
      color: "text-danger bg-danger-soft"
    },
    {
      label: "Today's Collection",
      value: formatPKR(data.todayCollection),
      description: "Captured during current calendar day",
      icon: ArrowDownCircle,
      color: "text-primary bg-primary-soft"
    },
    {
      label: "Monthly Collection",
      value: formatPKR(data.monthlyCollection),
      description: "Cumulative for this calendar month",
      icon: ArrowDownCircle,
      color: "text-success bg-success-soft"
    },
    {
      label: "Total Discounts",
      value: formatPKR(data.totalDiscounts),
      description: "Scholarships & special adjustments",
      icon: Percent,
      color: "text-warning bg-warning-soft"
    },
    {
      label: "Pending Accounts",
      value: data.pendingPayments.toString(),
      description: "Students with unpaid installments",
      icon: ClipboardList,
      color: "text-muted bg-surface-low"
    },
    {
      label: "Overdue Accounts",
      value: data.overduePayments.toString(),
      description: "Students past their due date",
      icon: AlertCircle,
      color: "text-danger bg-danger-soft"
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Financial Dashboard"
        description="Monitor expected tuition, collected amounts, outstanding balances, daily activity, and discounts."
        actions={
          <div className="flex gap-2">
            <Link href="/finance/payments" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-soft hover:brightness-105">
              Record a Payment
            </Link>
          </div>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">{stat.label}</span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold text-ink">{stat.value}</div>
                <p className="mt-1 text-xs text-muted">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Fees by Class</CardTitle>
          </CardHeader>
          <CardContent>
            <OutstandingByClassChart data={data.outstandingByClass} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Collections by Method</CardTitle>
          </CardHeader>
          <CardContent>
            <CollectionMethodChart data={data.collectionMethodData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Payments</CardTitle>
          <Link href="/finance/payments" className="text-sm font-bold text-primary hover:underline">
            View All History &rarr;
          </Link>
        </CardHeader>
        <CardContent>
          {!data.recentPayments.length ? (
            <div className="py-6 text-center text-sm text-muted">No payments recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-low font-label text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Receipt No</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Collected By</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPayments.map((p: any) => (
                    <tr key={p.id} className="border-t border-outline/60 hover:bg-surface-low/70">
                      <td className="px-4 py-4 font-mono font-semibold">
                        <Link href={`/finance/receipts?id=${p.id}`} className="text-primary hover:underline">
                          {p.receipt_number}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink">{p.student_name}</p>
                        <p className="text-xs text-muted">{p.admission_number}</p>
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {p.grade_name} • {p.class_name}
                      </td>
                      <td className="px-4 py-4">
                        <Badge tone="blue">{p.payment_method.replace("_", " ")}</Badge>
                      </td>
                      <td className="px-4 py-4 font-semibold text-success">
                        {formatPKR(Number(p.amount))}
                      </td>
                      <td className="px-4 py-4 text-muted">{p.received_by_name}</td>
                      <td className="px-4 py-4 text-muted">
                        {formatDatePK(p.payment_date)}
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
