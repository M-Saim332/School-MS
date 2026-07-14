import { requireUser } from "@/lib/auth/session";
import { getSalaryHistory } from "@/lib/services/payroll";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPKR, formatDatePK } from "@/lib/utils";

export default async function SalaryHistoryPage() {
  const user = await requireUser("payroll:view");
  const history = await getSalaryHistory(user);

  return (
    <>
      <PageHeader
        eyebrow="Payroll"
        title="Salary History"
        description={user.role === "teacher" ? "Your salary change history." : "Salary revision records for all teachers."}
      />

      {!history.length ? (
        <EmptyState title="No salary history" description="Salary change records will appear here once a teacher is set up with employment details." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-low font-label text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Previous Salary</th>
                    <th className="px-4 py-3">New Salary</th>
                    <th className="px-4 py-3">Change</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Effective Date</th>
                    <th className="px-4 py-3">Approved By</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row: any) => {
                    const delta = row.new_salary - row.previous_salary;
                    return (
                      <tr key={row.id} className="border-t border-outline/60 hover:bg-surface-low/50">
                        <td className="px-4 py-4 font-semibold text-ink">{row.teacher_id}</td>
                        <td className="px-4 py-4 font-mono text-muted">{formatPKR(row.previous_salary)}</td>
                        <td className="px-4 py-4 font-mono font-semibold text-ink">{formatPKR(row.new_salary)}</td>
                        <td className={`px-4 py-4 font-semibold ${delta >= 0 ? "text-success" : "text-danger"}`}>
                          {delta >= 0 ? "+" : ""}{formatPKR(delta)}
                        </td>
                        <td className="px-4 py-4">
                          <Badge tone={row.action_type === "increase" ? "green" : row.action_type === "decrease" ? "red" : "blue"}>
                            {row.action_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-muted">{formatDatePK(row.effective_date)}</td>
                        <td className="px-4 py-4 text-muted">{row.approved_by_name ?? "—"}</td>
                        <td className="px-4 py-4 text-muted">{row.remarks ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
