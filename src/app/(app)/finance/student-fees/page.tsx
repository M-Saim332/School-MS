import { requireUser } from "@/lib/auth/session";
import { getStudentFees } from "@/lib/services/finance";
import { getAcademicOptions } from "@/lib/services/academics";
import { PageHeader } from "@/components/layout/page-header";
import { StudentFeesClient } from "@/components/finance/student-fees-client";

export default async function StudentFeesPage() {
  const user = await requireUser("finance:view");
  const [accounts, academics] = await Promise.all([
    getStudentFees(user, {}),
    getAcademicOptions(user)
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Student Fee Accounts"
        description="Inspect details of tuition invoices, remaining balances, payment statuses, and apply discount waivers."
      />
      <StudentFeesClient
        user={user}
        accounts={accounts}
        classes={academics.classes}
        sessions={academics.years}
      />
    </>
  );
}
