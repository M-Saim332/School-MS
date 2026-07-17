import { requireUser } from "@/lib/auth/session";
import { getStudentFees, getPaymentHistory } from "@/lib/services/finance";
import { getAcademicOptions } from "@/lib/services/academics";
import { PageHeader } from "@/components/layout/page-header";
import { FeeManagementClient } from "@/components/finance/fee-management-client";

export default async function FeeManagementPage() {
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
        title="Fee Management"
        description="Review student fee ledgers, collect payments, apply discounts, and print receipts from one consolidated workspace."
      />
      <FeeManagementClient
        user={user}
        accounts={accounts}
        classes={academics.classes}
        sessions={academics.years}
        payments={payments}
      />
    </>
  );
}
