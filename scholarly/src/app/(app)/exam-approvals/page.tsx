import { CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/form-field";
import { requireUser } from "@/lib/auth/session";
import { formatExamType, getPrincipalExamApprovals } from "@/lib/services/marks";
import { reviewExamApprovalAction } from "@/app/(app)/exam-approvals/actions";
import type { ResultApprovalStatus } from "@/types/database";

const statusTone = {
  pending: "yellow",
  approved: "green",
  rejected: "red"
} as const;

export default async function ExamApprovalsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("marks:approve");
  const status = (params.status as ResultApprovalStatus | "all" | undefined) ?? "pending";
  const approvals = await getPrincipalExamApprovals(user, status);

  return (
    <>
      <PageHeader
        eyebrow="Principal review"
        title="Exam Result Approvals"
        description="Approve finalized special exam result sets or reject them with a comment so teachers can correct marks."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((item) => (
          <a
            key={item}
            href={`/exam-approvals?status=${item}`}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${status === item ? "bg-primary text-white" : "bg-white text-muted hover:bg-surface-low"}`}
          >
            {item}
          </a>
        ))}
      </div>

      {!approvals.length ? (
        <EmptyState title="No exam approvals" description="Submitted Monthly, Mid-Term, and Final-Term results will appear here." />
      ) : (
        <div className="grid gap-4">
          {approvals.map((approval: any) => {
            const exam = approval.exams;
            return (
              <Card key={approval.id}>
                <CardHeader>
                  <div>
                    <CardTitle>{exam?.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted">
                      {exam?.classes?.grades?.name} / {exam?.classes?.name} / {exam?.subjects?.name}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatExamType(exam?.exam_type)} / {exam?.term} / {exam?.exam_date} / submitted by {approval.submitter?.full_name ?? exam?.creator?.full_name ?? "Teacher"}
                    </p>
                  </div>
                  <Badge tone={statusTone[approval.status as keyof typeof statusTone]}>{approval.status}</Badge>
                </CardHeader>
                <CardContent>
                  {approval.status === "pending" ? (
                    <form action={reviewExamApprovalAction.bind(null, approval.id)} className="grid gap-3">
                      <Textarea name="principal_comment" placeholder="Optional comment. Required by process if rejecting." />
                      <div className="flex justify-end gap-3">
                        <Button type="submit" name="decision" value="rejected" variant="secondary" className="text-danger hover:bg-danger-soft">
                          <XCircle className="h-4 w-4" /> Reject
                        </Button>
                        <Button type="submit" name="decision" value="approved" className="bg-success text-white hover:bg-success/90">
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-lg bg-surface-low p-3 text-sm">
                      <p className="font-semibold text-ink">Principal comment</p>
                      <p className="mt-1 text-muted">{approval.principal_comment || "No comment provided."}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
