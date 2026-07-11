import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApprovalQueue } from "@/components/approvals/approval-queue";
import { requireUser } from "@/lib/auth/session";
import { getApprovalRequests } from "@/lib/services/approvals";

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("approvals:view");
  const requests = await getApprovalRequests(user, { status: (params.status as any) || "pending" });

  return (
    <>
      <PageHeader 
        eyebrow="Action Center" 
        title="Approval Workflows" 
        description="Review and manage pending admissions, cancellations, and other gated requests." 
      />

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <ApprovalQueue initialRequests={requests} />
        </CardContent>
      </Card>
    </>
  );
}
