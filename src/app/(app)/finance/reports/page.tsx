import { requireUser } from "@/lib/auth/session";
import { getStudentFees, getPaymentHistory } from "@/lib/services/finance";
import { getAcademicOptions } from "@/lib/services/academics";
import { PageHeader } from "@/components/layout/page-header";
import { ReportsClient } from "@/components/finance/reports-client";

export default async function ReportsPage() {
  const user = await requireUser("finance:view");
  const [accounts, academics, payments] = await Promise.all([
    getStudentFees(user, {}),
    getAcademicOptions(user),
    getPaymentHistory(user, {})
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Financial Reports"
        description="Analyze daily collections, outstanding ledgers, active discount waivers, or generate individual student ledger cards."
      />
      <ReportsClient
        accounts={accounts}
        payments={payments}
        classes={academics.classes}
        sessions={academics.years}
      />
    </>
  );
}
