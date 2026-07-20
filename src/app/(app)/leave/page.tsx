import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { LeaveApplicationDialog } from "@/components/leave/leave-application-dialog";
import { requireUser } from "@/lib/auth/session";
import { getLeaveRequestsForReview, getMyLeaveCenter } from "@/lib/services/leaves";
import { hasPermission } from "@/lib/permissions";
import { reviewLeaveAction, submitLeaveAction } from "@/app/(app)/leave/actions";

const statusTone = {
  pending: "yellow",
  approved: "green",
  rejected: "red"
} as const;

export default async function LeavePage() {
  const user = await requireUser("leave:view");
  const canReviewLeaves = hasPermission(user.role, "leave:manage", user.permissions);
  const reviewLeaves = canReviewLeaves ? await getLeaveRequestsForReview(user, "all") : [];
  const leaveCenter = canReviewLeaves ? { leaves: [], migrationRequired: false } : await getMyLeaveCenter(user);
  const { leaves, migrationRequired } = leaveCenter;

  return (
    <>
      <PageHeader
        eyebrow="Employee portal"
        title="Leave Center"
        description={canReviewLeaves ? "Review staff leave requests and make approval decisions." : "Submit leave requests and track Principal review status."}
        actions={
          !canReviewLeaves ? (
            <LeaveApplicationDialog>
              <LeaveRequestForm migrationRequired={migrationRequired} />
            </LeaveApplicationDialog>
          ) : null
        }
      />

      {canReviewLeaves ? (
        <Card>
          <CardHeader>
            <CardTitle>Staff Leave Requests</CardTitle>
            <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            {!reviewLeaves.length ? (
              <EmptyState title="No leave requests" description="Staff leave requests will appear here for approval." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="font-label text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="py-3 pr-4">Staff</th>
                      <th className="py-3 pr-4">Type</th>
                      <th className="py-3 pr-4">Dates</th>
                      <th className="py-3 pr-4">Reason</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4 text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewLeaves.map((leave) => (
                      <tr key={leave.id} className="border-t border-outline/60 align-top">
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-ink">{(leave as any).applicant_name ?? "Employee"}</p>
                        </td>
                        <td className="py-3 pr-4 font-semibold capitalize">{leave.leave_type.replace("_", " ")}</td>
                        <td className="py-3 pr-4 text-muted">{leave.start_date} to {leave.end_date}</td>
                        <td className="max-w-sm py-3 pr-4 text-muted">{leave.reason}</td>
                        <td className="py-3 pr-4">
                          <Badge tone={statusTone[leave.status]}>{leave.status}</Badge>
                          {leave.principal_remarks ? <p className="mt-1 text-xs text-muted">{leave.principal_remarks}</p> : null}
                        </td>
                        <td className="py-3 pr-4">
                          {leave.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <form action={reviewLeaveAction}>
                                <input type="hidden" name="leave_id" value={leave.id} />
                                <input type="hidden" name="decision" value="approved" />
                                <input type="hidden" name="principal_remarks" value="" />
                                <Button type="submit" size="sm">
                                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                  Approve
                                </Button>
                              </form>
                              <form action={reviewLeaveAction}>
                                <input type="hidden" name="leave_id" value={leave.id} />
                                <input type="hidden" name="decision" value="rejected" />
                                <input type="hidden" name="principal_remarks" value="" />
                                <Button type="submit" variant="danger" size="sm">
                                  <XCircle className="h-4 w-4" aria-hidden="true" />
                                  Reject
                                </Button>
                              </form>
                            </div>
                          ) : (
                            <p className="text-right text-xs font-semibold text-muted">Reviewed by {(leave as any).reviewed_by_name ?? "reviewer"}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
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
      )}
    </>
  );
}

function LeaveRequestForm({ migrationRequired }: { migrationRequired: boolean }) {
  if (migrationRequired) {
    return (
      <EmptyState
        title="Database migration required"
        description="Apply the latest School OS migration to enable staff leave requests."
      />
    );
  }

  return (
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
  );
}
