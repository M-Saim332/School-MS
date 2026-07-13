import { requireUser } from "@/lib/auth/session";
import { getStudentFees, getPaymentHistory } from "@/lib/services/finance";
import { getAcademicOptions } from "@/lib/services/academics";
import { PageHeader } from "@/components/layout/page-header";
import { PaymentsClient } from "@/components/finance/payments-client";

export default async function PaymentsPage() {
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
        title="Payment Processing"
        description="Search students to view their ledgers, record installment payments, print receipt items, or void transactions."
      />
      <PaymentsClient
        user={user}
        accounts={accounts}
        classes={academics.classes}
        payments={payments}
      />
    </>
  );
}
