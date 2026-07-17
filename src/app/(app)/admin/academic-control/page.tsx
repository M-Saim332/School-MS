import { redirect } from "next/navigation";
import { ClipboardPenLine } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/form-field";
import { ResultsTable } from "@/app/(app)/results/_components/results-table";
import { createSpecialExamAction } from "@/app/(app)/special-exams/actions";
import { requireUser } from "@/lib/auth/session";
import { getResultsManagementWorkspace } from "@/lib/services/marks";
import { getSpecialExamSetup } from "@/lib/services/special-exams";

export default async function AcademicControlPage() {
  const user = await requireUser("academics:view");

  if (user.role !== "principal") {
    redirect("/academics");
  }

  const [setup, results] = await Promise.all([
    getSpecialExamSetup(user),
    getResultsManagementWorkspace(user, { status: "all" })
  ]);

  const pendingCount = results.filter((row) => row.workflowStatus === "pending_approval").length;

  return (
    <>
      <PageHeader
        eyebrow="Principal portal"
        title="Academic Control"
        description="Manage live exam configurations and student result approvals from one unified view."
      />

      <div className="mb-6 rounded-lg bg-warning-soft p-4 text-sm font-semibold text-warning">
        {pendingCount
          ? `${pendingCount} major examination result${pendingCount === 1 ? "" : "s"} awaiting review.`
          : "No major examination results are currently pending approval."}
      </div>

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Create Special Exam</CardTitle>
            <ClipboardPenLine className="h-5 w-5 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            {setup.migrationRequired ? (
              <EmptyState title="Database migration required" description="Apply the latest School OS migration to enable special exam creation." />
            ) : (
              <form action={createSpecialExamAction} className="grid gap-4">
                <Field label="Teacher assignment">
                  <Select name="assignment_key" required>
                    <option value="">Choose teacher / class / subject</option>
                    {setup.assignments.map((assignment) => (
                      <option
                        key={`${assignment.teacher_id}:${assignment.class_id}:${assignment.subject_id}`}
                        value={`${assignment.teacher_id}:${assignment.class_id}:${assignment.subject_id}`}
                      >
                        {assignment.teacher_name} / {assignment.grade_name} {assignment.class_name} / {assignment.subject_name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Exam name">
                  <Input name="title" placeholder="Special Exam - Algebra Retake" required />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Date">
                    <Input name="exam_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
                  </Field>
                  <Field label="Max marks">
                    <Input name="max_marks" type="number" min="1" step="0.01" defaultValue="100" required />
                  </Field>
                </div>
                <Field label="Term">
                  <Input name="term" defaultValue="Special Exams" required />
                </Field>
                <Button type="submit">Create Grading Task</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Exam Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            {setup.migrationRequired ? (
              <EmptyState title="Special exams unavailable" description="The hosted database does not have the special exam columns yet." />
            ) : !setup.exams.length ? (
              <EmptyState title="No special exams yet" description="Created exams will appear for their assigned teacher in the Results Portal." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="font-label text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="py-3 pr-4">Exam</th>
                      <th className="py-3 pr-4">Class / Subject</th>
                      <th className="py-3 pr-4">Teacher</th>
                      <th className="py-3 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {setup.exams.map((exam: any) => (
                      <tr key={exam.id} className="border-t border-outline/60">
                        <td className="py-3 pr-4">
                          <p className="font-semibold">{exam.title}</p>
                          <p className="text-xs text-muted">{exam.exam_date} / {Number(exam.max_marks)} marks</p>
                        </td>
                        <td className="py-3 pr-4 text-muted">
                          {exam.classes?.grades?.name} {exam.classes?.name} / {exam.subjects?.name}
                        </td>
                        <td className="py-3 pr-4">{exam.teacher?.full_name ?? "Assigned teacher"}</td>
                        <td className="py-3 pr-4">
                          <Badge tone={exam.approval_status === "approved" ? "green" : exam.approval_status === "pending_approval" ? "yellow" : "gray"}>
                            {exam.approval_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
        </CardHeader>
        <CardContent>
          {!results.length ? (
            <EmptyState title="No results found" description="Uploaded major examination results will appear here for approval." />
          ) : (
            <ResultsTable rows={results} showApprovalColumns inlineApproval />
          )}
        </CardContent>
      </Card>
    </>
  );
}
