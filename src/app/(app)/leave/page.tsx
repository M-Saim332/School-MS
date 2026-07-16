import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { requireUser } from "@/lib/auth/session";
import { getMyLeaveCenter } from "@/lib/services/leaves";
import { submitLeaveAction } from "@/app/(app)/leave/actions";

const statusTone = {
  pending: "yellow",
  approved: "green",
  rejected: "red"
} as const;

export default async function LeavePage() {
  const user = await requireUser("leave:view");
  const { leaves, migrationRequired } = await getMyLeaveCenter(user);

  return (
    <>
      <PageHeader
        eyebrow="Employee portal"
        title="Leave Center"
        description="Submit leave requests and track Principal review status."
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>New Leave Request</CardTitle>
            <CalendarDays className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {migrationRequired ? (
              <EmptyState
                title="Database migration required"
                description="Apply the latest School OS migration to enable staff leave requests."
              />
            ) : (
              <form action={submitLeaveAction} className="grid gap-4">
                <Field label="Leave type">
                  <Select name="leave_type" required defaultValue="casual">
                    <option value="casual">Casual</option>
                    <option value="medical">Medical</option>
                    <option value="annual">Annual</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="other">Other</option>
                  </Select>
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Start date">
                    <Input name="start_date" type="date" required />
                  </Field>
                  <Field label="End date">
                    <Input name="end_date" type="date" required />
                  </Field>
                </div>
                <Field label="Reason">
                  <Textarea name="reason" required placeholder="Briefly explain the leave request" />
                </Field>
                <Button type="submit">Submit Request</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            {migrationRequired ? (
              <EmptyState title="Leave history unavailable" description="The hosted database does not have the staff leave table yet." />
            ) : !leaves.length ? (
              <EmptyState title="No leave requests yet" description="Submitted leave requests will appear here with their latest status." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="font-label text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="py-3 pr-4">Type</th>
                      <th className="py-3 pr-4">Dates</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave.id} className="border-t border-outline/60">
                        <td className="py-3 pr-4 font-semibold capitalize">{leave.leave_type.replace("_", " ")}</td>
                        <td className="py-3 pr-4 text-muted">{leave.start_date} to {leave.end_date}</td>
                        <td className="py-3 pr-4">
                          <Badge tone={statusTone[leave.status]}>{leave.status}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-muted">{leave.principal_remarks ?? "No remarks"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
